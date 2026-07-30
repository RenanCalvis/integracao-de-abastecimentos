import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AbastecimentoService } from './abastecimento.service';
import { Abastecimento } from '../entities/abastecimento.entity';
import { MotoristaService } from '../motorista/motorista.service';
import { PostoService } from '../posto/posto.service';
import { FilialService } from '../filial/filial.service';
import { ItemAbastecimentoService } from '../item-abastecimento/item-abastecimento.service';
import { ReceiptService } from '../receipt/receipt.service';
import { StorageService } from '../storage/storage.service';
import { RawAbastecimentoPayload } from './interfaces/raw-abastecimento-payload.interface';
import { Motorista } from '../entities/motorista.entity';
import { Posto } from '../entities/posto.entity';
import { Filial } from '../entities/filial.entity';

describe('AbastecimentoService (Testes Unitários)', () => {
  let service: AbastecimentoService;
  let abastecimentoRepo: jest.Mocked<Repository<Abastecimento>>;
  let receiptService: jest.Mocked<ReceiptService>;
  let storageService: jest.Mocked<StorageService>;
  let motoristaService: jest.Mocked<MotoristaService>;
  let postoService: jest.Mocked<PostoService>;
  let filialService: jest.Mocked<FilialService>;
  let itemAbastecimentoService: jest.Mocked<ItemAbastecimentoService>;

  const mockAbastecimento: Partial<Abastecimento> = {
    id: '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b',
    protocolo_number: '100000000000506',
    total_amount: '330.6804772185318029083780535730873',
    total_liters: '84.84',
    vehicle_plate: 'MSQ7I34',
    fueling_date: new Date('2026-07-27T16:50:50.080Z'),
    buyer_cpf: '68010511137',
    buyer_full_name: 'Warley Moraes',
    establishment_cnpj: '10000001000190',
    type_fuel: 'fuel',
    origin: 'government_allocation',
    observations: 'Uso informado: 197731km.',
    receipt_url: null,
    raw_payload: { test: true },
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbastecimentoService,
        {
          provide: getRepositoryToken(Abastecimento),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: MotoristaService,
          useValue: { findOrCreate: jest.fn() },
        },
        {
          provide: PostoService,
          useValue: { findOrCreate: jest.fn() },
        },
        {
          provide: FilialService,
          useValue: { findOrCreate: jest.fn() },
        },
        {
          provide: ItemAbastecimentoService,
          useValue: { createForAbastecimento: jest.fn() },
        },
        {
          provide: ReceiptService,
          useValue: { generateReceiptPdf: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { uploadReceipt: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AbastecimentoService>(AbastecimentoService);
    abastecimentoRepo = module.get(getRepositoryToken(Abastecimento));
    receiptService = module.get(ReceiptService);
    storageService = module.get(StorageService);
    motoristaService = module.get(MotoristaService);
    postoService = module.get(PostoService);
    filialService = module.get(FilialService);
    itemAbastecimentoService = module.get(ItemAbastecimentoService);
  });

  describe('findOne', () => {
    it('deve retornar os detalhes do abastecimento sem a propriedade raw_payload', async () => {
      abastecimentoRepo.findOne.mockResolvedValue(
        mockAbastecimento as Abastecimento,
      );

      const result = await service.findOne(
        '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockAbastecimento.id);
      expect(result.protocolo_number).toBe(mockAbastecimento.protocolo_number);
      expect(
        (result as unknown as Record<string, unknown>).raw_payload,
      ).toBeUndefined();
    });

    it('deve lançar NotFoundException quando o abastecimento não for encontrado', async () => {
      abastecimentoRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('id-invalido')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('deve aplicar filtros de busca e retornar lista paginada de abastecimentos', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockAbastecimento], 1]),
      };

      abastecimentoRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const query = {
        page: 1,
        limit: 10,
        vehicle: 'MSQ',
        buyer_cpf: '68010511137',
        establishment_cnpj: '10000001000190',
        date_from: '2026-07-01',
        date_to: '2026-07-31',
      };

      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total_pages).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'abastecimento.vehicle_plate ILIKE :vehicle',
        { vehicle: '%MSQ%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'abastecimento.buyer_cpf = :buyer_cpf',
        { buyer_cpf: '68010511137' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'abastecimento.establishment_cnpj = :establishment_cnpj',
        { establishment_cnpj: '10000001000190' },
      );
    });
  });

  describe('getComprovanteUrl (Lazy Loading)', () => {
    it('deve retornar a URL existente caso o receipt_url já esteja preenchido no banco', async () => {
      const abastecimentoComComprovante = {
        ...mockAbastecimento,
        receipt_url:
          'http://localhost:3103/receipts/comprovante-100000000000506.pdf',
      };
      abastecimentoRepo.findOne.mockResolvedValue(
        abastecimentoComComprovante as Abastecimento,
      );

      const result = await service.getComprovanteUrl(
        '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b',
      );

      expect(result.url).toBe(abastecimentoComComprovante.receipt_url);
      expect(receiptService.generateReceiptPdf).not.toHaveBeenCalled();
      expect(storageService.uploadReceipt).not.toHaveBeenCalled();
    });

    it('deve gerar o PDF no ReceiptService, subir no StorageService e salvar a URL quando receipt_url for nulo', async () => {
      abastecimentoRepo.findOne.mockResolvedValue(
        mockAbastecimento as Abastecimento,
      );
      const fakeBuffer = Buffer.from('PDF_DUMMY_CONTENT');
      const generatedUrl =
        'http://localhost:3103/comprovantes/comprovante-100000000000506.pdf';

      receiptService.generateReceiptPdf.mockResolvedValue(fakeBuffer);
      storageService.uploadReceipt.mockResolvedValue(generatedUrl);
      abastecimentoRepo.save.mockResolvedValue({
        ...mockAbastecimento,
        receipt_url: generatedUrl,
      } as Abastecimento);

      const result = await service.getComprovanteUrl(
        '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b',
      );

      expect(result.url).toBe(generatedUrl);
      expect(receiptService.generateReceiptPdf).toHaveBeenCalledWith(
        mockAbastecimento,
      );
      expect(storageService.uploadReceipt).toHaveBeenCalledWith(
        'comprovante-100000000000506.pdf',
        fakeBuffer,
      );
      expect(abastecimentoRepo.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException ao tentar gerar comprovante de registro inexistente', async () => {
      abastecimentoRepo.findOne.mockResolvedValue(null);

      await expect(service.getComprovanteUrl('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('persistOnePublic', () => {
    it('deve criar o abastecimento e os itens associados em caso de novo registro', async () => {
      const rawPayload: RawAbastecimentoPayload = {
        protocolo_number: '999',
        created_at: '2026-07-27T16:50:50.080Z',
        vehicle: 'ABC1234',
        buyer_cpf: '11122233344',
        buyer_full_name: 'Motorista Teste',
        establishment_cnpj: '11222333000144',
        establishment_official_name: 'Posto Teste',
        client_branch_cnpj: '55666777000188',
        client_branch_official_name: 'Filial Teste',
        empresa_id: 'emp-1',
        type_fuel: 'fuel',
        origin: 'government_allocation',
        observations: null,
        responsible: null,
        first_government_allocation_office_number: null,
        payment_method_id: null,
        foto_painel_url: null,
        line_items: [
          {
            product: {
              display_name: 'Gasolina',
              perma_name: 'gasolina',
              category: {
                display_name: 'Combustível',
                perma_name: 'combustivel',
              },
            },
            quantity: '10',
            unit_price: '5',
            complete_tank: true,
          },
        ],
      };

      const mockMotorista = { id: 'm-1' } as Motorista;
      const mockPosto = { id: 'p-1' } as Posto;
      const mockFilial = { id: 'f-1' } as Filial;

      motoristaService.findOrCreate.mockResolvedValue(mockMotorista);
      postoService.findOrCreate.mockResolvedValue(mockPosto);
      filialService.findOrCreate.mockResolvedValue(mockFilial);

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ raw: [{ id: 'new-id' }] }),
      };
      abastecimentoRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.persistOnePublic(rawPayload);

      expect(result.status).toBe('created');
      expect(result.protocolo_number).toBe('999');
      expect(
        itemAbastecimentoService.createForAbastecimento,
      ).toHaveBeenCalledWith(expect.any(String), rawPayload.line_items);
    });

    it('deve retornar status ignored quando o protocolo for duplicado (ON CONFLICT ignore)', async () => {
      const rawPayload: RawAbastecimentoPayload = {
        protocolo_number: '999',
        created_at: '2026-07-27T16:50:50.080Z',
        vehicle: 'ABC1234',
        buyer_cpf: '11122233344',
        buyer_full_name: 'Motorista Teste',
        establishment_cnpj: '11222333000144',
        establishment_official_name: 'Posto Teste',
        client_branch_cnpj: '55666777000188',
        client_branch_official_name: 'Filial Teste',
        empresa_id: 'emp-1',
        type_fuel: 'fuel',
        origin: 'government_allocation',
        observations: null,
        responsible: null,
        first_government_allocation_office_number: null,
        payment_method_id: null,
        foto_painel_url: null,
        line_items: [],
      };

      const mockMotorista = { id: 'm-1' } as Motorista;
      const mockPosto = { id: 'p-1' } as Posto;
      const mockFilial = { id: 'f-1' } as Filial;

      motoristaService.findOrCreate.mockResolvedValue(mockMotorista);
      postoService.findOrCreate.mockResolvedValue(mockPosto);
      filialService.findOrCreate.mockResolvedValue(mockFilial);

      const mockQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ raw: [] }),
      };
      abastecimentoRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.persistOnePublic(rawPayload);

      expect(result.status).toBe('ignored');
      expect(
        itemAbastecimentoService.createForAbastecimento,
      ).not.toHaveBeenCalled();
    });
  });
});
