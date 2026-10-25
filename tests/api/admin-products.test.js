import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { insertProduct, JPG, loginAgent, makeTestApp, PNG, WEBP } from './helpers.js';

const MB = 1024 * 1024;
const PRICE_ERROR = 'Escribe un precio válido, mayor que cero y con hasta dos decimales.';
const valid = {
  name: 'Laptop X',
  category: 'Laptops',
  price: '1299.9',
  description: 'Una laptop para estudiar.',
  specs: 'RAM: 8 GB\nGarantía de 12 meses',
};

let ctx;
let agent;
beforeEach(async () => {
  ctx = makeTestApp();
  agent = await loginAgent(ctx.app);
});
afterEach(() => ctx.cleanup());

// Envía el formulario como lo haría el navegador (multipart).
function create(fields, image = { buffer: PNG, filename: 'foto.png', contentType: 'image/png' }, client = agent) {
  let req = client.post('/api/admin/products');
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) req = req.field(key, value);
  }
  if (image) req = req.attach('image', image.buffer, { filename: image.filename, contentType: image.contentType });
  return req;
}

const rowCount = () => ctx.db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
const uploads = () => fs.readdirSync(ctx.uploadsDir);

describe('POST /api/admin/products (crear)', () => {
  it.each([
    ['png', PNG, 'foto.png', 'image/png'],
    ['jpg', JPG, 'foto.jpg', 'image/jpeg'],
    ['webp', WEBP, 'foto.webp', 'image/webp'],
  ])('crea un producto con foto %s y responde 201 con el DTO', async (ext, buffer, filename, contentType) => {
    const res = await create(valid, { buffer, filename, contentType });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'Laptop X',
      category: 'Laptops',
      priceCents: 129990,
      description: 'Una laptop para estudiar.',
      specs: 'RAM: 8 GB\nGarantía de 12 meses',
    });
    expect(Number.isInteger(res.body.id)).toBe(true);
    expect(res.body.imageUrl).toMatch(new RegExp(`^/uploads/[0-9a-f-]{36}\\.${ext}$`));
    expect(fs.existsSync(path.join(ctx.uploadsDir, path.basename(res.body.imageUrl)))).toBe(true);
  });

  it('el producto nuevo aparece primero en el catálogo público', async () => {
    insertProduct(ctx.db, { name: 'Anterior' });
    const created = await create(valid);
    const list = await request(ctx.app).get('/api/products');
    expect(list.body[0].id).toBe(created.body.id);
    expect(list.body).toHaveLength(2);
  });

  it('el precio 1299.9 queda como 129990 céntimos', async () => {
    const res = await create({ ...valid, price: '1299.9' });
    expect(res.body.priceCents).toBe(129990);
  });

  it('la foto se acepta aunque el nombre o el tipo declarado mientan, si los bytes son válidos', async () => {
    const res = await create(valid, { buffer: PNG, filename: 'foto.txt', contentType: 'text/plain' });
    expect(res.status).toBe(201);
    expect(res.body.imageUrl).toMatch(/\.png$/);
  });

  it('las especificaciones son opcionales', async () => {
    const res = await create({ ...valid, specs: undefined });
    expect(res.status).toBe(201);
    expect(res.body.specs).toBe('');
  });

  it('permite dos productos con el mismo nombre', async () => {
    const first = await create(valid);
    const second = await create(valid);
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).not.toBe(first.body.id);
    expect(rowCount()).toBe(2);
  });

  it('acepta una foto de exactamente 5 MB', async () => {
    const exact = Buffer.concat([PNG, Buffer.alloc(5 * MB - PNG.length)]);
    const res = await create(valid, { buffer: exact, filename: 'foto.png', contentType: 'image/png' });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/admin/products (validación)', () => {
  it.each([
    ['name', { name: undefined }, { name: 'Escribe el nombre del producto.' }],
    ['name vacío', { name: '   ' }, { name: 'Escribe el nombre del producto.' }],
    ['category', { category: undefined }, { category: 'Elige una categoría.' }],
    ['category inválida', { category: 'Televisores' }, { category: 'Elige una categoría.' }],
    ['description', { description: undefined }, { description: 'Escribe una descripción.' }],
    ['price ausente', { price: undefined }, { price: PRICE_ERROR }],
    ['price 0', { price: '0' }, { price: PRICE_ERROR }],
    ['price negativo', { price: '-5' }, { price: PRICE_ERROR }],
    ['price con tres decimales', { price: '12.345' }, { price: PRICE_ERROR }],
    ['price con letras', { price: 'abc' }, { price: PRICE_ERROR }],
  ])('responde 400 solo con el error de %s', async (label, override, expected) => {
    const res = await create({ ...valid, ...override });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errors: expected });
  });

  it('sin foto responde 400 con "Elige una foto."', async () => {
    const res = await create(valid, null);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errors: { image: 'Elige una foto.' } });
  });

  it.each([
    ['un HTML renombrado .png', Buffer.from('<html><script>alert(1)</script></html>'), 'foto.png', 'image/png'],
    ['un GIF', Buffer.from('GIF89a......'), 'foto.gif', 'image/gif'],
    ['un SVG', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'foto.svg', 'image/svg+xml'],
    ['un archivo vacío', Buffer.alloc(0), 'foto.png', 'image/png'],
  ])('rechaza %s con "La foto debe ser JPG, PNG o WebP."', async (label, buffer, filename, contentType) => {
    const res = await create(valid, { buffer, filename, contentType });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errors: { image: 'La foto debe ser JPG, PNG o WebP.' } });
  });

  it('rechaza una foto de 5 MB + 1 byte con 400 (no 413)', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(5 * MB + 1 - PNG.length)]);
    const res = await create(valid, { buffer: big, filename: 'foto.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ errors: { image: 'La foto no debe pesar más de 5 MB.' } });
  });

  it('reúne todos los errores a la vez', async () => {
    const res = await create({ name: '', category: '', price: 'abc', description: '' }, null);
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual({
      name: 'Escribe el nombre del producto.',
      category: 'Elige una categoría.',
      price: PRICE_ERROR,
      description: 'Escribe una descripción.',
      image: 'Elige una foto.',
    });
  });

  it('un cuerpo JSON (no multipart) responde 400 con todos los campos', async () => {
    const res = await agent.post('/api/admin/products').send({});
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.errors).sort()).toEqual(['category', 'description', 'image', 'name', 'price']);
  });

  it.each([
    ['campo inválido', { price: '0' }, undefined],
    ['foto inválida', {}, { buffer: Buffer.from('no soy una foto'), filename: 'a.png', contentType: 'image/png' }],
  ])('con %s no se crea fila ni archivo', async (label, override, image) => {
    await create({ ...valid, ...override }, image);
    expect(rowCount()).toBe(0);
    expect(uploads()).toEqual([]);
  });
});

describe('DELETE /api/admin/products/:id', () => {
  it('borra el producto y su foto y responde 204', async () => {
    const created = await create(valid);
    const file = path.basename(created.body.imageUrl);
    expect(fs.existsSync(path.join(ctx.uploadsDir, file))).toBe(true);

    const res = await agent.delete(`/api/admin/products/${created.body.id}`);
    expect(res.status).toBe(204);
    expect(fs.existsSync(path.join(ctx.uploadsDir, file))).toBe(false);

    const list = await request(ctx.app).get('/api/products');
    expect(list.body).toEqual([]);
    await request(ctx.app).get(`/api/products/${created.body.id}`).expect(404);
  });

  it('solo borra el producto indicado', async () => {
    const keep = insertProduct(ctx.db, { name: 'Se queda' });
    const remove = insertProduct(ctx.db, { name: 'Se va' });
    await agent.delete(`/api/admin/products/${remove}`).expect(204);
    const list = await request(ctx.app).get('/api/products');
    expect(list.body.map((p) => p.id)).toEqual([keep]);
  });

  it('responde 204 aunque el archivo de la foto ya no exista', async () => {
    const id = insertProduct(ctx.db, { image: 'inexistente.png' });
    await agent.delete(`/api/admin/products/${id}`).expect(204);
  });

  it('responde 404 para un id inexistente o ya borrado', async () => {
    const created = await create(valid);
    await agent.delete(`/api/admin/products/${created.body.id}`).expect(204);
    const again = await agent.delete(`/api/admin/products/${created.body.id}`);
    expect(again.status).toBe(404);
    expect(again.body).toEqual({ error: 'Este producto ya no está disponible.' });
    await agent.delete('/api/admin/products/9999').expect(404);
  });

  it.each(['abc', '0', '-1', '1.5'])('responde 404 para el id no entero positivo %s', async (badId) => {
    const res = await agent.delete(`/api/admin/products/${badId}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Este producto ya no está disponible.' });
  });
});

describe('sin sesión', () => {
  it('crear y borrar responden 401 y no cambian nada', async () => {
    const id = insertProduct(ctx.db, { name: 'Intocable' });
    const anonymous = request(ctx.app);

    const created = await create(valid, undefined, request.agent(ctx.app));
    expect(created.status).toBe(401);
    expect(created.body).toEqual({ error: 'Inicia sesión para continuar.' });

    const deleted = await anonymous.delete(`/api/admin/products/${id}`);
    expect(deleted.status).toBe(401);

    expect(rowCount()).toBe(1);
    expect(uploads()).toEqual([]);
  });
});
