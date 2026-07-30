import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemAbastecimentoService } from './item-abastecimento.service';
import { ItemAbastecimento } from '../entities/item-abastecimento.entity';
import { RawLineItem } from '../abastecimento/interfaces/raw-abastecimento-payload.interface';

describe('ItemAbastecimentoService (Testes Unitários - Cálculo do Item)', () => {
  let service: ItemAbastecimentoService;
  let itemRepo: jest.Mocked<Repository<ItemAbastecimento>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemAbastecimentoService,
        {
          provide: getRepositoryToken(ItemAbastecimento),
          useValue: {
            create: jest
              .fn()
              .mockImplementation(
                (val: Partial<ItemAbastecimento>) => val as ItemAbastecimento,
              ),
            save: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<ItemAbastecimentoService>(ItemAbastecimentoService);
    itemRepo = module.get(getRepositoryToken(ItemAbastecimento));
  });

  it('deve calcular line_total = quantity * unit_price para cada item mantendo precisão decimal', async () => {
    const lineItems: RawLineItem[] = [
      {
        product: {
          display_name: 'Gasolina Comum',
          perma_name: 'gasolina-comum',
          category: { display_name: 'Combustível', perma_name: 'combustivel' },
        },
        quantity: '58.14',
        unit_price: '3.646783631086150623635896717618',
        complete_tank: true,
      },
    ];

    await service.createForAbastecimento('abastecimento-id-123', lineItems);

    expect(itemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        abastecimento: { id: 'abastecimento-id-123' },
        product_display_name: 'Gasolina Comum',
        quantity: '58.14',
        unit_price: '3.646783631086150623635896717618',
        line_total: '212.02400031134879725819103516231052',

        complete_tank: true,
      }),
    );
    expect(itemRepo.save).toHaveBeenCalled();
  });

  it('deve retornar silenciosamente quando a lista de lineItems for vazia ou nula', async () => {
    await service.createForAbastecimento('abastecimento-id-123', []);

    expect(itemRepo.create).not.toHaveBeenCalled();
    expect(itemRepo.save).not.toHaveBeenCalled();
  });
});
