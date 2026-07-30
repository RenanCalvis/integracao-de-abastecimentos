import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilialService } from './filial.service';
import { Filial } from '../entities/filial.entity';

describe('FilialService (Testes Unitários)', () => {
  let service: FilialService;
  let repo: jest.Mocked<Repository<Filial>>;

  const mockFilial: Partial<Filial> = {
    id: 'filial-uuid-1',
    cnpj: '20000003000132',
    name: 'Filial Centro',
    company_id: 'emp-123',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilialService,
        {
          provide: getRepositoryToken(Filial),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((val) => val),
            save: jest.fn().mockResolvedValue(mockFilial),
          },
        },
      ],
    }).compile();

    service = module.get<FilialService>(FilialService);
    repo = module.get(getRepositoryToken(Filial));
  });

  it('deve retornar a filial existente se o CNPJ já estiver cadastrado no banco (reuso de entidade)', async () => {
    repo.findOne.mockResolvedValue(mockFilial as unknown as Filial);

    const result = await service.findOrCreate(
      '20000003000132',
      'Filial Centro',
      'emp-123',
    );

    expect(result).toEqual(mockFilial);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { cnpj: '20000003000132' },
    });
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('deve criar e salvar uma nova filial se o CNPJ não for encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await service.findOrCreate(
      '88000003000188',
      'Nova Filial',
      'emp-456',
    );

    expect(result).toBeDefined();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cnpj: '88000003000188',
        name: 'Nova Filial',
        company_id: 'emp-456',
      }),
    );
    expect(repo.save).toHaveBeenCalled();
  });
});
