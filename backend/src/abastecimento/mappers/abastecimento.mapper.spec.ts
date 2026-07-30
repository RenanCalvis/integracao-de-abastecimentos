import { AbastecimentoMapper } from './abastecimento.mapper';
import {
  RawAbastecimentoPayload,
  RawLineItem,
} from '../interfaces/raw-abastecimento-payload.interface';

describe('AbastecimentoMapper (Testes Unitários - Precisão Monetária)', () => {
  const buildRawPayload = (
    overrides?: Partial<RawAbastecimentoPayload>,
  ): RawAbastecimentoPayload => ({
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
    observations: 'Uso informado: 197731km.',
    responsible: null,
    first_government_allocation_office_number: null,
    payment_method_id: null,
    foto_painel_url: null,
    line_items: [
      {
        product: {
          display_name: 'Gasolina Comum',
          perma_name: 'gasolina-comum',
          category: {
            display_name: 'Combustível',
            perma_name: 'combustivel',
          },
        },
        quantity: '58.14',
        unit_price: '3.646783631086150623635896717618',
        complete_tank: true,
      },
      {
        product: {
          display_name: 'Etanol',
          perma_name: 'etanol',
          category: {
            display_name: 'Combustível',
            perma_name: 'combustivel',
          },
        },
        quantity: '26.7',
        unit_price: '4.444062805512471372722359491023',
        complete_tank: false,
      },
    ],
    ...overrides,
  });

  it('deve calcular total_amount e total_liters com precisão decimal arbitrária total sem truncamento', () => {
    const raw = buildRawPayload();
    const domain = AbastecimentoMapper.toDomain(raw);

    expect(domain.total_amount).toBe('330.68047721853178290987803357262462');

    expect(domain.total_liters).toBe('84.84');
  });

  it('não deve perder precisão em números com 30+ casas decimais', () => {
    const raw = buildRawPayload({
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
          quantity: '1',
          unit_price: '4.019766853054999479462753879264',
          complete_tank: true,
        },
      ],
    });
    const domain = AbastecimentoMapper.toDomain(raw);

    expect(domain.total_amount).toBe('4.019766853054999479462753879264');
  });

  it('regressão: garante que total_amount NUNCA é arredondado para 2 casas decimais (ex: 330.68)', () => {
    const raw = buildRawPayload();
    const domain = AbastecimentoMapper.toDomain(raw);

    expect(domain.total_amount).not.toBe('330.68');
    expect(domain.total_amount?.length).toBeGreaterThan(15);
  });

  it('deve tratar line_items vazio sem lançar erro, retornando total_amount 0 e total_liters 0', () => {
    const raw = buildRawPayload({ line_items: [] });
    const domain = AbastecimentoMapper.toDomain(raw);

    expect(domain.total_amount).toBe('0');
    expect(domain.total_liters).toBe('0');
  });

  it('deve tratar line_items com quantity ou unit_price indefinidos/nulos de forma segura', () => {
    const raw = buildRawPayload({
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
          unit_price: '5.50',
          complete_tank: true,
        },
        {
          quantity: undefined,
          unit_price: undefined,
        } as unknown as RawLineItem,
      ],
    });
    const domain = AbastecimentoMapper.toDomain(raw);

    expect(domain.total_amount).toBe('55');
    expect(domain.total_liters).toBe('10');
  });

  it('deve mapear corretamente todos os campos do contrato para o modelo de domínio', () => {
    const raw = buildRawPayload();
    const domain = AbastecimentoMapper.toDomain(raw);

    expect(domain.protocolo_number).toBe('100000000000506');
    expect(domain.vehicle_plate).toBe('MSQ7I34');
    expect(domain.buyer_cpf).toBe('68010511137');
    expect(domain.buyer_full_name).toBe('Warley Moraes');
    expect(domain.establishment_cnpj).toBe('10000001000190');
    expect(domain.type_fuel).toBe('fuel');
    expect(domain.origin).toBe('government_allocation');
    expect(domain.observations).toBe('Uso informado: 197731km.');
  });
});
