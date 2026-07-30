import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Abastecimento } from '../entities/abastecimento.entity';

@Injectable()
export class ReceiptService {
  async generateReceiptPdf(abastecimento: Abastecimento): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const itemsCount = abastecimento.items?.length || 0;
      // Calcula a altura dinâmica com base na quantidade de itens e observações
      const calculatedHeight = Math.max(
        500,
        450 + itemsCount * 35 + (abastecimento.observations ? 40 : 0),
      );

      const doc = new PDFDocument({
        size: [300, calculatedHeight],
        margin: 15,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const separator = () => {
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(
            '----------------------------------------------------------------------',
            { align: 'center' },
          );
      };

      // ── Cabeçalho ─────────────────────────────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('CUPOM DE ABASTECIMENTO', { align: 'center' });
      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`Protocolo: ${abastecimento.protocolo_number}`, {
          align: 'center',
        });

      const formattedDate = abastecimento.fueling_date
        ? new Date(abastecimento.fueling_date).toLocaleString('pt-BR')
        : 'N/A';
      doc.text(`Data: ${formattedDate}`, { align: 'center' });
      doc.moveDown(0.4);

      separator();

      // ── Dados do Estabelecimento / Posto ─────────────────────────────────────
      doc.font('Helvetica-Bold').text('POSTO / ESTABELECIMENTO');
      doc
        .font('Helvetica')
        .text(`Razão Social: ${abastecimento.posto?.trade_name || 'N/A'}`);
      doc.text(
        `CNPJ: ${abastecimento.posto?.cnpj || abastecimento.establishment_cnpj || 'N/A'}`,
      );
      doc.moveDown(0.4);

      // ── Dados da Filial / Cliente ──────────────────────────────────────────────
      doc.font('Helvetica-Bold').text('FILIAL / CLIENTE');
      doc
        .font('Helvetica')
        .text(`Nome: ${abastecimento.filial?.name || 'N/A'}`);
      doc.text(`CNPJ: ${abastecimento.filial?.cnpj || 'N/A'}`);
      doc.moveDown(0.4);

      // ── Dados do Motorista e Veículo ──────────────────────────────────────────
      doc.font('Helvetica-Bold').text('MOTORISTA E VEÍCULO');
      doc
        .font('Helvetica')
        .text(
          `Nome: ${abastecimento.motorista?.full_name || abastecimento.buyer_full_name || 'N/A'}`,
        );
      doc.text(
        `CPF: ${abastecimento.motorista?.cpf || abastecimento.buyer_cpf || 'N/A'}`,
      );
      doc.text(`Placa do Veículo: ${abastecimento.vehicle_plate}`);

      separator();

      // ── Itens do Abastecimento ───────────────────────────────────────────────
      doc.font('Helvetica-Bold').text('ITENS DO ABASTECIMENTO');
      doc.moveDown(0.3);

      if (abastecimento.items && abastecimento.items.length > 0) {
        for (const item of abastecimento.items) {
          doc.font('Helvetica-Bold').text(item.product_display_name);
          const qty = Number(item.quantity).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3,
          });
          const unitPrice = Number(item.unit_price).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          });
          const lineTotal = Number(item.line_total).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          doc
            .font('Helvetica')
            .text(`  ${qty} Qtd  x  R$ ${unitPrice}  =  R$ ${lineTotal}`);
          doc.moveDown(0.2);
        }
      } else {
        doc.font('Helvetica').text('  (Nenhum item detalhado)');
      }

      separator();

      // ── Totais e Resumo ───────────────────────────────────────────────────────
      const totalAmount = Number(abastecimento.total_amount).toLocaleString(
        'pt-BR',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
      );
      const totalLiters = Number(abastecimento.total_liters).toLocaleString(
        'pt-BR',
        { minimumFractionDigits: 2, maximumFractionDigits: 3 },
      );

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`VALOR TOTAL: R$ ${totalAmount}`);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`Litragem Total: ${totalLiters} L`);
      doc.text(
        `Tipo de Combustível: ${abastecimento.type_fuel} | Origem: ${abastecimento.origin}`,
      );

      if (abastecimento.observations) {
        doc.moveDown(0.3);
        doc
          .font('Helvetica-Oblique')
          .text(`Observações: ${abastecimento.observations}`);
      }

      separator();

      // ── Rodapé ────────────────────────────────────────────────────────────────
      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('SISTEMA DE GESTÃO DE ABASTECIMENTOS', { align: 'center' });
      doc
        .font('Helvetica')
        .text('Comprovante gerado eletronicamente sob demanda', {
          align: 'center',
        });

      doc.end();
    });
  }
}
