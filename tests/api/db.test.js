import { beforeEach, describe, expect, it } from 'vitest';
import { openDb } from '../../server/db.js';

const insert = (db, overrides = {}) => {
  const row = {
    name: 'Producto',
    category: 'Celulares',
    price_cents: 1000,
    description: 'Descripción',
    specs: '',
    image: 'foto.png',
    ...overrides,
  };
  return db
    .prepare(
      'INSERT INTO products (name, category, price_cents, description, specs, image) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(row.name, row.category, row.price_cents, row.description, row.specs, row.image);
};

describe('openDb', () => {
  let db;
  beforeEach(() => {
    db = openDb(':memory:');
  });

  it('crea la tabla products', () => {
    const table = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'products'")
      .get();
    expect(table?.name).toBe('products');
  });

  it('rechaza una categoría fuera de Celulares, Laptops, Accesorios', () => {
    expect(() => insert(db, { category: 'Televisores' })).toThrow();
    for (const category of ['Celulares', 'Laptops', 'Accesorios']) {
      expect(() => insert(db, { category })).not.toThrow();
    }
  });

  it('rechaza price_cents igual a 0 o negativo', () => {
    expect(() => insert(db, { price_cents: 0 })).toThrow();
    expect(() => insert(db, { price_cents: -100 })).toThrow();
  });

  it('rechaza name, description o image nulos', () => {
    expect(() => insert(db, { name: null })).toThrow();
    expect(() => insert(db, { description: null })).toThrow();
    expect(() => insert(db, { image: null })).toThrow();
  });

  it('usa cadena vacía como valor por defecto de specs', () => {
    db.prepare(
      'INSERT INTO products (name, category, price_cents, description, image) VALUES (?, ?, ?, ?, ?)',
    ).run('Sin specs', 'Laptops', 5000, 'Descripción', 'a.png');
    const row = db.prepare('SELECT specs FROM products').get();
    expect(row.specs).toBe('');
  });

  it('asigna ids autoincrementales crecientes', () => {
    const first = insert(db).lastInsertRowid;
    const second = insert(db).lastInsertRowid;
    expect(Number(second)).toBeGreaterThan(Number(first));
  });

  it('deja user_version en 0 en una base nueva', () => {
    expect(db.prepare('PRAGMA user_version').get().user_version).toBe(0);
  });
});
