import { describe, it, expect } from 'vitest';
import { getCurrencySymbol, formatCurrencyAmount } from '@/lib/currency';

describe('getCurrencySymbol', () => {
  it('returns $ for USD', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
  });

  it('returns € for EUR', () => {
    expect(getCurrencySymbol('EUR')).toBe('€');
  });

  it('returns ₪ for ILS', () => {
    expect(getCurrencySymbol('ILS')).toBe('₪');
  });

  it('returns the currency code itself when symbol is not found', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ');
  });
});

describe('formatCurrencyAmount', () => {
  it('formats a whole number with two decimal places and the currency symbol', () => {
    const result = formatCurrencyAmount(100, 'USD');
    expect(result).toContain('100.00');
    expect(result).toContain('$');
  });

  it('formats a decimal amount correctly', () => {
    const result = formatCurrencyAmount(9.5, 'EUR');
    expect(result).toContain('9.50');
    expect(result).toContain('€');
  });

  it('formats zero correctly', () => {
    const result = formatCurrencyAmount(0, 'USD');
    expect(result).toContain('0.00');
    expect(result).toContain('$');
  });

  it('uses the currency code as fallback symbol for unknown codes', () => {
    const result = formatCurrencyAmount(50, 'XYZ');
    expect(result).toContain('50.00');
    expect(result).toContain('XYZ');
  });
});
