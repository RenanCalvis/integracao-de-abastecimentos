import { ValueTransformer } from 'typeorm';
import Decimal from 'decimal.js';

/**
 * Converte colunas NUMERIC do banco para string no TS para evitar perda de precisão.
 * Toda aritmética no sistema deve ser feita via Decimal.js, nunca com primitivos (number).
 *
 * - `to`: normaliza para string antes de gravar (aceita string, Decimal ou null).
 * - `from`: retorna a string exata vinda do PostgreSQL, sem renormalização,
 *   para preservar precisão arbitrária (ex: 30+ casas decimais em unit_price).
 */
export const NumericTransformer: ValueTransformer = {
  to(value: string | Decimal | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    return new Decimal(value).toFixed();
  },

  from(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    return value; 
  },
};

