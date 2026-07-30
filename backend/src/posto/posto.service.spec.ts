import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostoService } from './posto.service';
import { Posto } from '../entities/posto.entity';

describe('PostoService (Testes Unitários)', () => {
  let service: PostoService;
  let repo: jest.Mocked<Repository<Posto>>;

  const mockPosto: Partial<Posto> = {
    id: 'posto-uuid-1',
    cnpj: '10000001000190',
    trade_name: 'Posto Central',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostoService,
        {
          provide: getRepositoryToken(Posto),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((val) => val),
            save: jest.fn().mockResolvedValue(mockPosto),
          },
        },
      ],
    }).compile();

    service = module.get<PostoService>(PostoService);
    repo = module.get(getRepositoryToken(Posto));
  });

  it('deve retornar o posto existente se o CNPJ já estiver cadastrado no banco (reuso de entidade)', async () => {
    repo.findOne.mockResolvedValue(mockPosto as unknown as Posto);

    const result = await service.findOrCreate(
      '10000001000190',
      'Posto Central',
    );

    expect(result).toEqual(mockPosto);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { cnpj: '10000001000190' },
    });
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('deve criar e salvar um novo posto se o CNPJ não for encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await service.findOrCreate('99000001000199', 'Posto Novo');

    expect(result).toBeDefined();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cnpj: '99000001000199',
        trade_name: 'Posto Novo',
      }),
    );
    expect(repo.save).toHaveBeenCalled();
  });
});
