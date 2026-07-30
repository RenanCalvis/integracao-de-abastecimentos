import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotoristaService } from './motorista.service';
import { Motorista } from '../entities/motorista.entity';

describe('MotoristaService (Testes Unitários)', () => {
  let service: MotoristaService;
  let repo: jest.Mocked<Repository<Motorista>>;

  const mockMotorista: Partial<Motorista> = {
    id: 'mot-uuid-1',
    cpf: '68010511137',
    full_name: 'Warley Moraes',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotoristaService,
        {
          provide: getRepositoryToken(Motorista),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((val) => val),
            save: jest.fn().mockResolvedValue(mockMotorista),
          },
        },
      ],
    }).compile();

    service = module.get<MotoristaService>(MotoristaService);
    repo = module.get(getRepositoryToken(Motorista));
  });

  it('deve retornar o motorista existente se o CPF já estiver cadastrado no banco (reuso de entidade)', async () => {
    repo.findOne.mockResolvedValue(mockMotorista as unknown as Motorista);

    const result = await service.findOrCreate('68010511137', 'Warley Moraes');

    expect(result).toEqual(mockMotorista);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { cpf: '68010511137' },
    });
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('deve criar e salvar um novo motorista se o CPF não for encontrado', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await service.findOrCreate('11122233344', 'Novo Motorista');

    expect(result).toBeDefined();
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cpf: '11122233344',
        full_name: 'Novo Motorista',
      }),
    );
    expect(repo.save).toHaveBeenCalled();
  });
});
