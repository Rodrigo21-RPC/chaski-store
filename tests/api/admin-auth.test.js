import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loginAgent, makeTestApp, TEST_PASSWORD } from './helpers.js';

const LOCK_MS = 15 * 60 * 1000;
const NO_SESSION = { error: 'Inicia sesión para continuar.' };
const LOCKED = { error: 'Demasiados intentos. Vuelve a intentarlo en 15 minutos.' };

let ctx;
beforeEach(() => {
  ctx = makeTestApp();
});
afterEach(() => ctx.cleanup());

const login = (password, app = ctx.app) => request(app).post('/api/admin/login').send({ password });
const cookieOf = (res) => (res.headers['set-cookie'] ?? []).find((c) => c.startsWith('chaski_admin='));

describe('POST /api/admin/login', () => {
  it('con la clave correcta responde 204 y una cookie de sesión', async () => {
    const res = await login(TEST_PASSWORD);
    expect(res.status).toBe(204);
    const cookie = cookieOf(res);
    expect(cookie).toBeTruthy();
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Path=/');
    expect(cookie).not.toMatch(/Max-Age|Expires/i);
    expect(cookie).not.toContain('Secure');
  });

  it('con secureCookies activo la cookie lleva Secure', async () => {
    const secure = makeTestApp({ secureCookies: true });
    const res = await login(TEST_PASSWORD, secure.app);
    expect(cookieOf(res)).toContain('Secure');
    secure.cleanup();
  });

  it('con una clave incorrecta responde 401', async () => {
    const res = await login('otra');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Clave incorrecta.' });
    expect(cookieOf(res)).toBeUndefined();
  });

  it.each([{}, { password: '' }, { password: 123 }])('con el cuerpo %j responde 400', async (body) => {
    const res = await request(ctx.app).post('/api/admin/login').send(body);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Escribe la clave.' });
  });

  it('la clave vacía no suma al conteo de intentos fallidos', async () => {
    for (let i = 0; i < 4; i++) await login('otra');
    for (let i = 0; i < 10; i++) await login('');
    const res = await login(TEST_PASSWORD);
    expect(res.status).toBe(204);
  });
});

describe('GET /api/admin/session y POST /api/admin/logout', () => {
  it('da 204 con la sesión iniciada', async () => {
    const agent = await loginAgent(ctx.app);
    await agent.get('/api/admin/session').expect(204);
  });

  it('da 401 sin cookie o con un token inventado', async () => {
    const none = await request(ctx.app).get('/api/admin/session');
    expect(none.status).toBe(401);
    expect(none.body).toEqual(NO_SESSION);
    const fake = await request(ctx.app).get('/api/admin/session').set('Cookie', 'chaski_admin=inventado');
    expect(fake.status).toBe(401);
    expect(fake.body).toEqual(NO_SESSION);
  });

  it('logout responde 204 y deja inservible la cookie anterior', async () => {
    const res = await login(TEST_PASSWORD);
    const cookie = cookieOf(res).split(';')[0];
    await request(ctx.app).get('/api/admin/session').set('Cookie', cookie).expect(204);
    const out = await request(ctx.app).post('/api/admin/logout').set('Cookie', cookie);
    expect(out.status).toBe(204);
    expect(cookieOf(out)).toMatch(/chaski_admin=;|Max-Age=0|Expires=/i);
    const after = await request(ctx.app).get('/api/admin/session').set('Cookie', cookie);
    expect(after.status).toBe(401);
  });

  it('logout sin sesión también responde 204', async () => {
    await request(ctx.app).post('/api/admin/logout').expect(204);
  });
});

describe('guardia general de /api/admin/*', () => {
  it('sin sesión, cualquier ruta de administración responde 401 aunque todavía no exista', async () => {
    const attempts = [
      request(ctx.app).post('/api/admin/products').send({}),
      request(ctx.app).delete('/api/admin/products/1'),
      request(ctx.app).get('/api/admin/lo-que-sea'),
    ];
    for (const res of await Promise.all(attempts)) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual(NO_SESSION);
    }
  });

  it('con sesión, una ruta de administración inexistente responde 404', async () => {
    const agent = await loginAgent(ctx.app);
    const res = await agent.get('/api/admin/lo-que-sea');
    expect(res.status).toBe(404);
  });

  it('las rutas públicas no piden sesión', async () => {
    await request(ctx.app).get('/api/products').expect(200);
    await request(ctx.app).get('/api/config').expect(200);
  });
});

describe('bloqueo por intentos fallidos', () => {
  it('bloquea desde el sexto intento aun con la clave correcta y desbloquea a los 15 minutos', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await login('otra');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Clave incorrecta.' });
    }

    const sixth = await login('otra');
    expect(sixth.status).toBe(429);
    expect(sixth.body).toEqual(LOCKED);
    expect(Number(sixth.headers['retry-after'])).toBe(900);

    const correctWhileLocked = await login(TEST_PASSWORD);
    expect(correctWhileLocked.status).toBe(429);
    expect(correctWhileLocked.body).toEqual(LOCKED);
    expect(cookieOf(correctWhileLocked)).toBeUndefined();

    ctx.clock.advance(LOCK_MS);
    const afterLock = await login(TEST_PASSWORD);
    expect(afterLock.status).toBe(204);
  });

  it('cuatro fallos seguidos y luego un acierto reinician el conteo', async () => {
    for (let i = 0; i < 4; i++) await login('otra');
    expect((await login(TEST_PASSWORD)).status).toBe(204);
    for (let i = 0; i < 4; i++) {
      const res = await login('otra');
      expect(res.status).toBe(401);
    }
    const res = await login(TEST_PASSWORD);
    expect(res.status).toBe(204);
  });
});
