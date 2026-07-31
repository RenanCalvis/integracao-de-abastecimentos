import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Abastecimento } from '../entities/abastecimento.entity';

function formatCpf(cpf?: string): string {
  if (!cpf) return 'N/A';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCnpj(cnpj?: string): string {
  if (!cnpj) return 'N/A';
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatCurrency(val?: string | number): string {
  if (val === null || val === undefined) return 'R$ 0,00';
  const num = typeof val === 'number' ? val : Number(val);
  return `R$ ${num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLiters(val?: string | number): string {
  if (val === null || val === undefined) return '0,00 L';
  const num = typeof val === 'number' ? val : Number(val);
  return `${num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} L`;
}

const fillcolor = '#000';

@Injectable()
export class ReceiptService {
  private translateOrigin(origin: string): string {
    const map: Record<string, string> = {
      government_allocation: 'Alocação Governamental',
      direct_purchase: 'Compra Direta',
      fleet_card: 'Cartão Frota',
    };
    return map[origin] || origin;
  }

  private translateTypeFuel(typeFuel: string): string {
    const map: Record<string, string> = {
      fuel: 'Combustível',
      lubricant: 'Lubrificante',
    };
    return map[typeFuel] || typeFuel;
  }

  async generateReceiptPdf(abastecimento: Abastecimento): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const itemsCount = abastecimento.items?.length || 0;
      const hasObs = Boolean(abastecimento.observations);

      const calculatedHeight = Math.max(
        540,
        460 + itemsCount * 36 + (hasObs ? 35 : 0),
      );

      const pageWidth = 320;
      const margin = 18;
      const contentWidth = pageWidth - margin * 2; // 284pt

      const doc = new PDFDocument({
        size: [pageWidth, calculatedHeight],
        margin,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const drawDashedSeparator = () => {
        const y = doc.y + 3;
        doc
          .save()
          .strokeColor(fillcolor)
          .lineWidth(0.5)
          .dash(3, { space: 2 })
          .moveTo(margin, y)
          .lineTo(pageWidth - margin, y)
          .stroke()
          .restore();
        doc.y = y + 8;
      };

      // ── Cabeçalho ─────────────────────────────────────────────────────────────
      doc.y = 20;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('CUPOM DE ABASTECIMENTO', margin, doc.y, {
          align: 'center',
          width: contentWidth,
        });

      doc.moveDown(0.3);
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(fillcolor)
        .text(`Protocolo ${abastecimento.protocolo_number}`, margin, doc.y, {
          align: 'center',
          width: contentWidth,
        });

      const fuelingDateFormatted = abastecimento.fueling_date
        ? new Date(abastecimento.fueling_date).toLocaleString('pt-BR', {
            timeZone: 'America/Campo_Grande',
          })
        : 'N/A';
      doc.text(
        `Data do abastecimento: ${fuelingDateFormatted}`,
        margin,
        doc.y,
        {
          align: 'center',
          width: contentWidth,
        },
      );

      const emissionDateFormatted = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Campo_Grande',
      });

      doc.text(`Data de emissão: ${emissionDateFormatted}`, margin, doc.y, {
        align: 'center',
        width: contentWidth,
      });

      doc.moveDown(0.5);
      drawDashedSeparator();

      // ── Posto / Estabelecimento ─────────────────────────────────────
      const stationName =
        abastecimento.posto?.trade_name || 'Estabelecimento Não Informado';
      const stationCnpj =
        abastecimento.posto?.cnpj || abastecimento.establishment_cnpj;

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('POSTO / ESTABELECIMENTO', margin, doc.y);
      doc.fontSize(9).font('Helvetica-Bold').text(stationName, margin, doc.y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`CNPJ: ${formatCnpj(stationCnpj)}`, margin, doc.y);

      doc.moveDown(0.6);

      // ── Filial / Cliente ──────────────────────────────────────────────
      const branchName = abastecimento.filial?.name || 'Filial Não Informada';
      const branchCnpj = abastecimento.filial?.cnpj;

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('FILIAL / CLIENTE', margin, doc.y);
      doc.fontSize(9).font('Helvetica-Bold').text(branchName, margin, doc.y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`CNPJ: ${formatCnpj(branchCnpj)}`, margin, doc.y);

      doc.moveDown(0.6);

      // ── Motorista e Veículo ──────────────────────────────────────────
      const driverName =
        abastecimento.motorista?.full_name ||
        abastecimento.buyer_full_name ||
        'Motorista Não Informado';
      const driverCpf = abastecimento.motorista?.cpf || abastecimento.buyer_cpf;

      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('MOTORISTA E VEÍCULO', margin, doc.y);
      doc.fontSize(9).font('Helvetica-Bold').text(driverName, margin, doc.y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(`CPF: ${formatCpf(driverCpf)}`, margin, doc.y);
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Placa do Veículo: ${abastecimento.vehicle_plate}`,
          margin,
          doc.y,
        );

      doc.moveDown(0.6);
      drawDashedSeparator();

      // ── Itens Abastecidos ───────────────────────────────────────────────
      doc
        .fontSize(7.5)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('ITENS ABASTECIDOS', margin, doc.y);
      doc.moveDown(0.4);

      if (abastecimento.items && abastecimento.items.length > 0) {
        for (const item of abastecimento.items) {
          const rowY = doc.y;

          doc
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .fillColor(fillcolor)
            .text(item.product_display_name, margin, rowY, {
              width: contentWidth - 75,
            });

          const formattedLineTotal = formatCurrency(item.line_total);
          doc
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .fillColor(fillcolor)
            .text(formattedLineTotal, margin, rowY, {
              width: contentWidth,
              align: 'right',
            });

          const qtyText = formatLiters(item.quantity);
          const unitPriceText = formatCurrency(item.unit_price);
          doc
            .fontSize(7.5)
            .font('Helvetica')
            .fillColor(fillcolor)
            .text(`${qtyText}  x  ${unitPriceText}`, margin, doc.y + 1);

          doc.moveDown(0.4);
        }
      } else {
        doc
          .fontSize(8)
          .font('Helvetica-Oblique')
          .fillColor(fillcolor)
          .text('(Nenhum item detalhado)', margin, doc.y);
        doc.moveDown(0.4);
      }

      // Linha sólida sobre o total
      const solidY = doc.y + 2;
      doc
        .save()
        .strokeColor(fillcolor)
        .lineWidth(1)
        .moveTo(margin, solidY)
        .lineTo(pageWidth - margin, solidY)
        .stroke()
        .restore();

      doc.y = solidY + 8;

      // ── Totais e Resumo ───────────────────────────────────────────────────────
      let totalAmountNum = Number(abastecimento.total_amount || 0);
      if (abastecimento.items && abastecimento.items.length > 0) {
        totalAmountNum = abastecimento.items.reduce((acc, item) => {
          const itemVal = Number(item.line_total || 0);
          return acc + Math.round(itemVal * 100) / 100;
        }, 0);
      }

      const totalY = doc.y;
      doc
        .fontSize(8.5)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('TOTAL DO ABASTECIMENTO', margin, totalY, {
          width: contentWidth - 90,
        });

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text(formatCurrency(totalAmountNum), margin, totalY, {
          width: contentWidth,
          align: 'right',
        });

      doc.moveDown(0.6);

      // Litragem Total
      const litragemY = doc.y;
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(fillcolor)
        .text('Litragem Total:', margin, litragemY);

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text(formatLiters(abastecimento.total_liters), margin, litragemY, {
          width: contentWidth,
          align: 'right',
        });

      doc.moveDown(0.3);

      // Tipo / Origem
      const translatedFuel = this.translateTypeFuel(abastecimento.type_fuel);
      const translatedOrigin = this.translateOrigin(abastecimento.origin);

      const tipoOrigemY = doc.y;
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(fillcolor)
        .text('Tipo / Origem:', margin, tipoOrigemY);

      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text(`${translatedFuel} (${translatedOrigin})`, margin, tipoOrigemY, {
          width: contentWidth,
          align: 'right',
        });

      doc.moveDown(0.6);

      // Caixa de Observações (Borda simples em preto)
      if (abastecimento.observations) {
        const obsY = doc.y;
        doc
          .save()
          .rect(margin, obsY, contentWidth, 20)
          .strokeColor(fillcolor)
          .lineWidth(0.5)
          .stroke()
          .restore();

        doc
          .fontSize(7.5)
          .font('Helvetica-Oblique')
          .fillColor(fillcolor)
          .text(`Obs: ${abastecimento.observations}`, margin + 6, obsY + 5, {
            width: contentWidth - 12,
          });

        doc.y = obsY + 26;
      }

      drawDashedSeparator();

      // ── Rodapé ────────────────────────────────────────────────────────────────
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor(fillcolor)
        .text('Comprovante Autêntico', margin, doc.y, {
          align: 'center',
          width: contentWidth,
        });

      doc.moveDown(0.2);
      doc
        .fontSize(7.5)
        .font('Helvetica')
        .fillColor(fillcolor)
        .text('Gerado pelo Sistema de Gestão GD Tech', margin, doc.y, {
          align: 'center',
          width: contentWidth,
        });

      doc.end();
    });
  }
}
