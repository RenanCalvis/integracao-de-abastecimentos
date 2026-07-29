import Decimal from 'decimal.js';
import { Abastecimento } from '../../entities/abastecimento.entity';
import { RawAbastecimentoPayload } from '../interfaces/raw-abastecimento-payload.interface';

export class AbastecimentoMapper {
  static toDomain(rawJson: RawAbastecimentoPayload): Partial<Abastecimento> {
    let totalAmount = new Decimal(0);
    let totalLiters = new Decimal(0);

    for (const item of rawJson.line_items ?? []) {
      const qty = new Decimal(item.quantity ?? 0);
      const unitPrice = new Decimal(item.unit_price ?? 0);
      totalAmount = totalAmount.add(qty.mul(unitPrice));
      totalLiters = totalLiters.add(qty);
    }

    return {
      protocolo_number: rawJson.protocolo_number,
      vehicle_plate: rawJson.vehicle,
      fueling_date: new Date(rawJson.created_at),
      buyer_cpf: rawJson.buyer_cpf,
      establishment_cnpj: rawJson.establishment_cnpj,
      observations: rawJson.observations ?? null,
      raw_payload: rawJson as unknown as Record<string, unknown>,
      total_amount: totalAmount.toFixed(),
      total_liters: totalLiters.toFixed(),
    };
  }
}
