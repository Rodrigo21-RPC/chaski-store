import { describe, expect, it } from 'vitest';
import { parsePrice, validateProduct } from '../../server/validation.js';

const PRICE_ERROR = 'Escribe un precio válido, mayor que cero y con hasta dos decimales.';

describe('parsePrice', () => {
  it.each([
    ['4299', 429900],
    ['4299.00', 429900],
    ['25.5', 2550],
    ['0.99', 99],
    ['1299.9', 129990],
    ['  30  ', 3000],
  ])('acepta %j y devuelve %i céntimos', (text, cents) => {
    expect(parsePrice(text)).toEqual({ cents });
  });

  it.each(['', '0', '0.00', '-5', '12.345', 'abc', '1,5', '4,299.00', ' ', '1e3', '.5', '5.', '+5', '1 000'])(
    'rechaza %j con el mensaje de precio',
    (text) => {
      expect(parsePrice(text)).toEqual({ error: PRICE_ERROR });
    },
  );

  it('rechaza lo que no es texto', () => {
    expect(parsePrice(undefined)).toEqual({ error: PRICE_ERROR });
    expect(parsePrice(25)).toEqual({ error: PRICE_ERROR });
  });

  it('no usa coma flotante: 19.99 da exactamente 1999', () => {
    expect(parsePrice('19.99')).toEqual({ cents: 1999 });
    expect(parsePrice('0.07')).toEqual({ cents: 7 });
  });
});

describe('validateProduct', () => {
  const valid = {
    name: 'Laptop X',
    category: 'Laptops',
    price: '1299.9',
    description: 'Una laptop.',
    specs: 'RAM: 8 GB',
  };

  it('acepta un producto válido y devuelve los datos limpios', () => {
    expect(validateProduct(valid)).toEqual({
      data: { name: 'Laptop X', category: 'Laptops', priceCents: 129990, description: 'Una laptop.', specs: 'RAM: 8 GB' },
    });
  });

  it('recorta espacios de nombre y descripción', () => {
    const result = validateProduct({ ...valid, name: '  Laptop X  ', description: '  Una laptop.  ' });
    expect(result.data.name).toBe('Laptop X');
    expect(result.data.description).toBe('Una laptop.');
  });

  it('specs es opcional', () => {
    expect(validateProduct({ ...valid, specs: undefined }).data.specs).toBe('');
    expect(validateProduct({ ...valid, specs: '' }).data.specs).toBe('');
  });

  it('exige nombre y descripción tras quitar espacios', () => {
    expect(validateProduct({ ...valid, name: '   ' }).errors).toEqual({ name: 'Escribe el nombre del producto.' });
    expect(validateProduct({ ...valid, description: '' }).errors).toEqual({ description: 'Escribe una descripción.' });
    expect(validateProduct({ ...valid, name: undefined }).errors).toEqual({ name: 'Escribe el nombre del producto.' });
  });

  it('exige una categoría válida', () => {
    expect(validateProduct({ ...valid, category: '' }).errors).toEqual({ category: 'Elige una categoría.' });
    expect(validateProduct({ ...valid, category: 'Televisores' }).errors).toEqual({ category: 'Elige una categoría.' });
    expect(validateProduct({ ...valid, category: undefined }).errors).toEqual({ category: 'Elige una categoría.' });
  });

  it('exige un precio válido', () => {
    expect(validateProduct({ ...valid, price: '0' }).errors).toEqual({ price: PRICE_ERROR });
  });

  it('reúne todos los errores a la vez, solo de los campos con problema', () => {
    const result = validateProduct({ name: '', category: '', price: 'abc', description: '', specs: '' });
    expect(result.errors).toEqual({
      name: 'Escribe el nombre del producto.',
      category: 'Elige una categoría.',
      price: PRICE_ERROR,
      description: 'Escribe una descripción.',
    });
    expect(result.data).toBeUndefined();
  });
});
