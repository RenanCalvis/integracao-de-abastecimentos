import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptService } from './receipt.service';
import { Abastecimento } from '../entities/abastecimento.entity';
import { ItemAbastecimento } from '../entities/item-abastecimento.entity';
import { Posto } from '../entities/posto.entity';
import { Filial } from '../entities/filial.entity';
import { Motorista } from '../entities/motorista.entity';

describe('ReceiptService (Testes Unitários - Geração de PDF)', () => {
  let service: ReceiptService;

  const mockAbastecimento: Partial<Abastecimento> = {
    id: '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b',
    protocolo_number: '100000000000506',
    total_amount: '330.68',
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
    raw_payload: {},
    created_at: new Date(),
    updated_at: new Date(),
    posto: {
      id: 'posto-1',
      cnpj: '10000001000190',
      trade_name: 'Posto Central',
      created_at: new Date(),
      updated_at: new Date(),
    } as Posto,
    filial: {
      id: 'filial-1',
      cnpj: '20000003000132',
      name: 'Filial Centro',
      company_id: 'emp-123',
      created_at: new Date(),
      updated_at: new Date(),
    } as Filial,
    motorista: {
      id: 'mot-1',
      cpf: '68010511137',
      full_name: 'Warley Moraes',
      created_at: new Date(),
      updated_at: new Date(),
    } as Motorista,
    items: [
      {
        id: 'item-1',
        product_display_name: 'Gasolina Comum',
        product_slug: 'gasolina-comum',
        quantity: '58.14',
        unit_price: '3.6467',
        line_total: '212.02',
        complete_tank: true,
        abastecimento: {} as Abastecimento,
        created_at: new Date(),
      } as ItemAbastecimento,
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceiptService],
    }).compile();

    service = module.get<ReceiptService>(ReceiptService);
  });

  it('deve gerar um Buffer PDF válido com a estrutura do cupom fiscal', async () => {
    const pdfBuffer = await service.generateReceiptPdf(
      mockAbastecimento as Abastecimento,
    );

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(100);
    expect(pdfBuffer.toString('utf8', 0, 5)).toBe('%PDF-');
  });

  it('deve gerar PDF com sucesso mesmo se o abastecimento não possuir itens ou observações', async () => {
    const abastecimentoSemItens: Partial<Abastecimento> = {
      ...mockAbastecimento,
      items: [],
      observations: null,
    };

    const pdfBuffer = await service.generateReceiptPdf(
      abastecimentoSemItens as Abastecimento,
    );

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.toString('utf8', 0, 5)).toBe('%PDF-');
  });
});
