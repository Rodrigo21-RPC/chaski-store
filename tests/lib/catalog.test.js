import { describe, expect, it } from 'vitest';
import { CATEGORIES, filterProducts } from '../../client/src/lib/catalog.js';

const products = [
  { id: 5, name: 'Mouse inalámbrico Silent', category: 'Accesorios', description: 'Compatible con mac y PC' },
  { id: 4, name: 'MacBook Air M2 13"', category: 'Laptops', description: 'Ligera' },
  { id: 3, name: 'Lenovo IdeaPad 3 15"', category: 'Laptops', description: 'Para estudiar' },
  { id: 2, name: 'iPhone 15 Pro 256GB', category: 'Celulares', description: 'Titanio' },
  { id: 1, name: 'Samsung Galaxy S24', category: 'Celulares', description: 'Pantalla AMOLED' },
];

const ids = (list) => list.map((p) => p.id);

describe('CATEGORIES', () => {
  it('lista Todos y las tres categorías en orden', () => {
    expect(CATEGORIES).toEqual(['Todos', 'Celulares', 'Laptops', 'Accesorios']);
  });
});

describe('filterProducts', () => {
  it('devuelve todos con categoría Todos y consulta vacía', () => {
    expect(ids(filterProducts(products, { category: 'Todos', query: '' }))).toEqual([5, 4, 3, 2, 1]);
  });

  it('filtra por categoría exacta', () => {
    expect(ids(filterProducts(products, { category: 'Laptops', query: '' }))).toEqual([4, 3]);
    expect(ids(filterProducts(products, { category: 'Celulares', query: '' }))).toEqual([2, 1]);
  });

  it('busca por nombre sin distinguir mayúsculas ni minúsculas', () => {
    expect(ids(filterProducts(products, { category: 'Todos', query: 'IPHONE' }))).toEqual([2]);
    expect(ids(filterProducts(products, { category: 'Todos', query: 'iphone' }))).toEqual([2]);
  });

  it('combina categoría y búsqueda', () => {
    expect(ids(filterProducts(products, { category: 'Laptops', query: 'mac' }))).toEqual([4]);
  });

  it('conserva el orden recibido', () => {
    // El iPhone no contiene "a" en el nombre; el resto mantiene el orden recibido.
    expect(ids(filterProducts(products, { category: 'Todos', query: 'a' }))).toEqual([5, 4, 3, 1]);
  });

  it('devuelve una lista vacía si nada coincide', () => {
    expect(filterProducts(products, { category: 'Todos', query: 'zzzz' })).toEqual([]);
  });

  it('ignora espacios sobrantes de la consulta', () => {
    expect(ids(filterProducts(products, { category: 'Todos', query: '  galaxy  ' }))).toEqual([1]);
  });

  it('busca solo en el nombre, no en la descripción', () => {
    // "mac" aparece en la descripción del mouse, pero su nombre no lo contiene.
    expect(ids(filterProducts(products, { category: 'Todos', query: 'mac' }))).toEqual([4]);
  });
});
