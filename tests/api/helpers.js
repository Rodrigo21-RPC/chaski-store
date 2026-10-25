import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../../server/app.js';
import { openDb } from '../../server/db.js';

// Imágenes mínimas con los bytes iniciales de cada formato.
export const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(16)]);
export const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);
export const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.from([0x24, 0, 0, 0]), Buffer.from('WEBP'), Buffer.alloc(8)]);

export const TEST_PASSWORD = 'clave-de-prueba';
export const TEST_WHATSAPP = '51999999999';

export function makeClock(start = 1_700_000_000_000) {
  return {
    t: start,
    now() {
      return this.t;
    },
    advance(ms) {
      this.t += ms;
    },
  };
}

export function makeTestApp(options = {}) {
  const db = openDb(':memory:');
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaski-uploads-'));
  const clock = makeClock();
  const app = createApp({
    db,
    uploadsDir,
    adminPassword: TEST_PASSWORD,
    whatsappNumber: TEST_WHATSAPP,
    now: () => clock.now(),
    ...options,
  });
  const cleanup = () => {
    fs.rmSync(uploadsDir, { recursive: true, force: true });
    if (options.clientDir) fs.rmSync(options.clientDir, { recursive: true, force: true });
  };
  return { app, db, uploadsDir, clock, cleanup };
}

export function insertProduct(db, overrides = {}) {
  const row = {
    name: 'Producto de prueba',
    category: 'Celulares',
    price_cents: 10000,
    description: 'Descripción de prueba',
    specs: '',
    image: 'foto.png',
    ...overrides,
  };
  const result = db
    .prepare(
      'INSERT INTO products (name, category, price_cents, description, specs, image) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(row.name, row.category, row.price_cents, row.description, row.specs, row.image);
  return Number(result.lastInsertRowid);
}

export async function loginAgent(app, password = TEST_PASSWORD) {
  const agent = request.agent(app);
  await agent.post('/api/admin/login').send({ password }).expect(204);
  return agent;
}
