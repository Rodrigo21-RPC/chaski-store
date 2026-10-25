import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { makeTestApp } from './helpers.js';

const cleanups = [];
afterEach(() => {
  while (cleanups.length) cleanups.pop()();
});

function setup(options) {
  const ctx = makeTestApp(options);
  cleanups.push(ctx.cleanup);
  return ctx;
}

function makeClientDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chaski-client-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>Chaski Store</title>');
  return dir;
}

describe('createApp', () => {
  it('responde 404 JSON en español para rutas /api inexistentes', async () => {
    const { app } = setup();
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No encontramos lo que buscas.' });
  });

  it('sirve /uploads con nosniff y una política de contenido restrictiva', async () => {
    const { app, uploadsDir } = setup();
    fs.writeFileSync(path.join(uploadsDir, 'foto.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    const res = await request(app).get('/uploads/foto.png');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    );
  });

  it('da 404 para un archivo inexistente en /uploads y no cae en index.html', async () => {
    const clientDir = makeClientDir();
    const { app } = setup({ clientDir });
    const res = await request(app).get('/uploads/no-existe.png');
    expect(res.status).toBe(404);
    expect(res.text).not.toContain('Chaski Store');
  });

  it('con clientDir devuelve index.html para rutas del cliente', async () => {
    const clientDir = makeClientDir();
    const { app } = setup({ clientDir });
    const res = await request(app).get('/pedido');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Chaski Store');
  });

  it('sin clientDir no devuelve index.html para rutas del cliente', async () => {
    const { app } = setup();
    const res = await request(app).get('/pedido');
    expect(res.status).toBe(404);
  });
});
