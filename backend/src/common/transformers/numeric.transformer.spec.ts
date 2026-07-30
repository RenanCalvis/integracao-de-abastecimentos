import Decimal from 'decimal.js';
import { NumericTransformer } from './numeric.transformer';

describe('NumericTransformer (Testes Unitários)', () => {
  describe('to', () => {
    it('deve converter string numérica para string via Decimal.js', () => {
      const result = NumericTransformer.to(
        '330.6804772185318029083780535730873',
      );
      expect(result).toBe('330.6804772185318029083780535730873');
    });

    it('deve converter instância de Decimal para string', () => {
      const dec = new Decimal('123.456');
      const result = NumericTransformer.to(dec);
      expect(result).toBe('123.456');
    });

    it('deve retornar null para valores nulos ou indefinidos', () => {
      expect(NumericTransformer.to(null)).toBeNull();
      expect(NumericTransformer.to(undefined)).toBeNull();
    });
  });

  describe('from', () => {
    it('deve retornar a string exata vinda do banco de dados sem conversão para number', () => {
      const val = '4.019766853054999479462753879264';
      const result = NumericTransformer.from(val);
      expect(result).toBe(val);
    });

    it('deve retornar null para valores nulos ou indefinidos', () => {
      expect(NumericTransformer.from(null)).toBeNull();
      expect(NumericTransformer.from(undefined)).toBeNull();
    });
  });
});
