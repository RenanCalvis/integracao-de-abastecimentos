import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SyncService } from './sync.service';
import { SyncState } from '../entities/sync-state.entity';
import { SyncLog } from '../entities/sync-log.entity';
import { AbastecimentoService } from '../abastecimento/abastecimento.service';
import { RawAbastecimentoPayload } from '../abastecimento/interfaces/raw-abastecimento-payload.interface';

describe('SyncService (Testes Unitários - Integração & Sincronização)', () => {
  let service: SyncService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;
  let abastecimentoService: jest.Mocked<AbastecimentoService>;
  let syncStateRepo: jest.Mocked<Repository<SyncState>>;
  let syncLogRepo: jest.Mocked<Repository<SyncLog>>;

  const mockLog: Partial<SyncLog> = {
    id: 'log-uuid-123',
    trigger: 'manual',
    status: 'running',
    started_at: new Date(),
    finished_at: null,
    pages_fetched: 0,
    total_created: 0,
    total_ignored: 0,
    total_errors: 0,
    error_message: null,
  };

  const mockRawItem: RawAbastecimentoPayload = {
    protocolo_number: '100000000000506',
    created_at: '2026-07-27T16:50:50.080Z',
    vehicle: 'MSQ7I34',
    buyer_cpf: '68010511137',
    buyer_full_name: 'Warley Moraes',
    establishment_cnpj: '10000001000190',
    establishment_official_name: 'Sh Informatica LTDA',
    client_branch_cnpj: '20000003000132',
    client_branch_official_name: 'Expresso Centro Oeste LTDA',
    empresa_id: 'emp-123',
    type_fuel: 'fuel',
    origin: 'government_allocation',
    observations: null,
    responsible: null,
    first_government_allocation_office_number: null,
    payment_method_id: null,
    foto_painel_url: null,
    line_items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: AbastecimentoService,
          useValue: { persistOnePublic: jest.fn() },
        },
        {
          provide: getRepositoryToken(SyncState),
          useValue: { findOne: jest.fn(), upsert: jest.fn() },
        },
        {
          provide: getRepositoryToken(SyncLog),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    abastecimentoService = module.get(AbastecimentoService);
    syncStateRepo = module.get(getRepositoryToken(SyncState));
    syncLogRepo = module.get(getRepositoryToken(SyncLog));

    configService.get.mockImplementation(
      (key: string, defaultValue?: unknown) => {
        if (key === 'BASE_URL') return 'https://prova.staging.granddos.tech';
        if (key === 'LIMIT_SYNC') return 50;
        if (key === 'API_TOKEN') return 'token-teste-123';
        return defaultValue;
      },
    );

    syncLogRepo.create.mockReturnValue(mockLog as SyncLog);
    syncLogRepo.save.mockResolvedValue(mockLog as SyncLog);
    syncStateRepo.findOne.mockResolvedValue(null);
  });

  it('deve realizar a sincronização completa paginada e atualizar o cursor no banco', async () => {
    const page1Data: AxiosResponse = {
      data: {
        data: [mockRawItem],
        next_cursor: 'cursor-pagina-2',
        has_more: true,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as never },
    };

    const page2Data: AxiosResponse = {
      data: {
        data: [{ ...mockRawItem, protocolo_number: '100000000000507' }],
        next_cursor: null,
        has_more: false,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as never },
    };

    httpService.get
      .mockReturnValueOnce(of(page1Data))
      .mockReturnValueOnce(of(page2Data));

    abastecimentoService.persistOnePublic
      .mockResolvedValueOnce({
        protocolo_number: '100000000000506',
        status: 'created',
      })
      .mockResolvedValueOnce({
        protocolo_number: '100000000000507',
        status: 'ignored',
      });

    const report = await service.runSync('manual');

    expect(report.pages_fetched).toBe(2);
    expect(report.total_created).toBe(1);
    expect(report.total_ignored).toBe(1);
    expect(report.total_errors).toBe(0);
    expect(syncStateRepo.upsert).toHaveBeenCalledWith(
      {
        id: 'default',
        last_cursor: 'cursor-pagina-2',
        last_sync_at: expect.any(Date),
      },
      ['id'],
    );
  });

  it('deve utilizar o last_cursor salvo na execução anterior para permitir sync incremental', async () => {
    syncStateRepo.findOne.mockResolvedValue({
      id: 'default',
      last_cursor: 'cursor-anterior-999',
      last_sync_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const pageData: AxiosResponse = {
      data: {
        data: [],
        next_cursor: null,
        has_more: false,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as never },
    };

    httpService.get.mockReturnValueOnce(of(pageData));

    await service.runSync('scheduled');

    expect(httpService.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ cursor: 'cursor-anterior-999' }),
      }),
    );
  });

  it('deve impedir execuções paralelas de sincronização lançando erro (isSyncing lock)', async () => {
    (service as unknown as Record<string, unknown>).isSyncing = true;

    await expect(service.runSync('scheduled')).rejects.toThrow(
      'Sincronização já em andamento.',
    );
  });

  it('deve tratar erros individuais de persistência sem abortar a leitura do batch', async () => {
    const pageData: AxiosResponse = {
      data: {
        data: [
          mockRawItem,
          { ...mockRawItem, protocolo_number: 'item-com-erro' },
        ],
        next_cursor: null,
        has_more: false,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} as never },
    };

    httpService.get.mockReturnValueOnce(of(pageData));

    abastecimentoService.persistOnePublic
      .mockResolvedValueOnce({
        protocolo_number: '100000000000506',
        status: 'created',
      })
      .mockRejectedValueOnce(new Error('Erro de FK ou parsing'));

    const report = await service.runSync('manual');

    expect(report.total_created).toBe(1);
    expect(report.total_errors).toBe(1);
    expect(report.pages_fetched).toBe(1);
  });

  it('deve abortar o loop e registrar status error no SyncLog em caso de falha de rede da API externa', async () => {
    httpService.get.mockReturnValueOnce(
      throwError(() => new Error('Connection Timeout - API offline')),
    );

    await expect(service.runSync('manual')).rejects.toThrow(
      'Connection Timeout - API offline',
    );

    expect(syncLogRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        error_message: expect.stringContaining('Connection Timeout'),
      }),
    );
  });
});
