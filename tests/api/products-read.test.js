import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { insertProduct, makeTestApp, TEST_WHATSAPP } from './helpers.js';

let ctx;
beforeEach(() => {
  ctx = makeTestApp();
});
afterEach(() => ctx.cleanup());

describe('GET /api/products', () => {
  it('devuelve una lista vacía si no hay productos', async () => {
    const res = await request(ctx.app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('devuelve el producto con la forma exacta del contrato', async () => {
    const id = insertProduct(ctx.db, {
      name: 'iPhone 15 Pro 256GB',
      category: 'Celulares',
      price_cents: 429900,
      description: 'Titanio y chip A17 Pro.',
      specs: 'Pantalla: 6.1 pulgadas',
      image: 'abc123.webp',
    });
    const res = await request(ctx.app).get('/api/products');
    expect(res.body).toEqual([
      {
        id,
        name: 'iPhone 15 Pro 256GB',
        category: 'Celulares',
        priceCents: 429900,
        description: 'Titanio y chip A17 Pro.',
        specs: 'Pantalla: 6.1 pulgadas',
        imageUrl: '/uploads/abc123.webp',
      },
    ]);
  });

  it('ordena del más reciente al más antiguo (id descendente)', async () => {
    const first = insertProduct(ctx.db, { name: 'Primero' });
    const second = insertProduct(ctx.db, { name: 'Segundo' });
    const third = insertProduct(ctx.db, { name: 'Tercero' });
    const res = await request(ctx.app).get('/api/products');
    expect(res.body.map((p) => p.id)).toEqual([third, second, first]);
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto si existe', async () => {
    const id = insertProduct(ctx.db, { name: 'Laptop X', category: 'Laptops' });
    const res = await request(ctx.app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('Laptop X');
  });

  it('responde 404 con el mensaje en español si no existe', async () => {
    const res = await request(ctx.app).get('/api/products/999');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Este producto ya no está disponible.' });
  });

  it.each(['abc', '0', '-1', '1.5'])('responde 404 para el id inválido %s', async (badId) => {
    const res = await request(ctx.app).get(`/api/products/${badId}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Este producto ya no está disponible.' });
  });
});

describe('GET /api/config', () => {
  it('devuelve el número de WhatsApp de la tienda', async () => {
    const res = await request(ctx.app).get('/api/config');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ whatsappNumber: TEST_WHATSAPP });
  });
});
