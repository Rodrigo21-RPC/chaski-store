import fs from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { seedIfNew } from '../../server/seed.js';
import { makeTestApp } from './helpers.js';

let ctx;
beforeEach(() => {
  ctx = makeTestApp();
});
afterEach(() => ctx.cleanup());

const allProducts = (db) => db.prepare('SELECT * FROM products ORDER BY id').all();
const userVersion = (db) => db.prepare('PRAGMA user_version').get().user_version;

describe('seedIfNew', () => {
  it('inserta los 10 productos de ejemplo y sube user_version a 1', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    expect(allProducts(ctx.db)).toHaveLength(10);
    expect(userVersion(ctx.db)).toBe(1);
  });

  it('copia las 10 fotos y cada image insertada existe como archivo', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    expect(fs.readdirSync(ctx.uploadsDir)).toHaveLength(10);
    for (const product of allProducts(ctx.db)) {
      expect(fs.existsSync(`${ctx.uploadsDir}/${product.image}`)).toBe(true);
    }
  });

  it('no inserta nada en una segunda llamada', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    seedIfNew(ctx.db, ctx.uploadsDir);
    expect(allProducts(ctx.db)).toHaveLength(10);
    expect(fs.readdirSync(ctx.uploadsDir)).toHaveLength(10);
  });

  it('no vuelve a sembrar si el catálogo se vació', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    ctx.db.exec('DELETE FROM products');
    seedIfNew(ctx.db, ctx.uploadsDir);
    expect(allProducts(ctx.db)).toHaveLength(0);
  });

  it('incluye productos de cada categoría con precios válidos', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    const products = allProducts(ctx.db);
    for (const category of ['Celulares', 'Laptops', 'Accesorios']) {
      expect(products.some((p) => p.category === category)).toBe(true);
    }
    expect(products.every((p) => Number.isInteger(p.price_cents) && p.price_cents > 0)).toBe(true);
  });

  it('tiene una sola laptop con "Mac" y un solo celular con "iPhone" en el nombre', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    const products = allProducts(ctx.db);
    const macs = products.filter((p) => /mac/i.test(p.name));
    expect(macs).toHaveLength(1);
    expect(macs[0].category).toBe('Laptops');
    const iphones = products.filter((p) => /iphone/i.test(p.name));
    expect(iphones).toHaveLength(1);
    expect(iphones[0].category).toBe('Celulares');
  });

  it('incluye un SSD de 300.00 soles para el pedido de ejemplo', () => {
    seedIfNew(ctx.db, ctx.uploadsDir);
    const ssd = allProducts(ctx.db).find((p) => /ssd/i.test(p.name));
    expect(ssd.price_cents).toBe(30000);
  });
});
