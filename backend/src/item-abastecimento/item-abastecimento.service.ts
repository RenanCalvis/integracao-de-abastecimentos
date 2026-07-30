import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { uuidv7 } from 'uuidv7';
import { ItemAbastecimento } from '../entities/item-abastecimento.entity';
import { RawLineItem } from '../abastecimento/interfaces/raw-abastecimento-payload.interface';

Decimal.set({ precision: 40 });

@Injectable()
export class ItemAbastecimentoService {
  constructor(
    @InjectRepository(ItemAbastecimento)
    private readonly itemRepository: Repository<ItemAbastecimento>,
  ) {}

  async createForAbastecimento(
    abastecimentoId: string,
    lineItems: RawLineItem[],
  ): Promise<void> {
    if (!lineItems?.length) return;

    const itens = lineItems.map((item) => {
      const qty = new Decimal(item.quantity ?? 0);
      const unitPrice = new Decimal(item.unit_price ?? 0);
      const lineTotal = qty.mul(unitPrice);

      return this.itemRepository.create({
        id: uuidv7(),
        abastecimento: { id: abastecimentoId },
        product_display_name: item.product?.display_name ?? 'Não Informado',
        product_slug: item.product?.perma_name ?? '',
        quantity: qty.toFixed(),
        unit_price: unitPrice.toFixed(),
        line_total: lineTotal.toFixed(),
        complete_tank: item.complete_tank ?? false,
      });
    });

    await this.itemRepository.save(itens);
  }
}
