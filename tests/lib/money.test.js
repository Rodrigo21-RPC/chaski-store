import { describe, expect, it } from 'vitest';
import { formatPrice } from '../../client/src/lib/money.js';

describe('formatPrice', () => {
  it('muestra miles con coma y dos decimales', () => {
    expect(formatPrice(429900)).toBe('S/ 4,299.00');
  });

  it('muestra importes pequeños con dos decimales', () => {
    expect(formatPrice(2500)).toBe('S/ 25.00');
    expect(formatPrice(5)).toBe('S/ 0.05');
  });

  it('agrupa millones con una coma por cada tres cifras', () => {
    expect(formatPrice(100000000)).toBe('S/ 1,000,000.00');
  });

  it('siempre lleva el símbolo S/ y exactamente dos decimales', () => {
    for (const cents of [1, 99, 100, 1050, 129990, 600000]) {
      expect(formatPrice(cents)).toMatch(/^S\/ \d{1,3}(,\d{3})*\.\d{2}$/);
    }
  });
});
