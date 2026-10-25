import crypto from 'node:crypto';
import { Router } from 'express';

const COOKIE_NAME = 'chaski_admin';
const NO_SESSION = { error: 'Inicia sesión para continuar.' };
const WRONG_PASSWORD = { error: 'Clave incorrecta.' };
const EMPTY_PASSWORD = { error: 'Escribe la clave.' };
const LOCKED = { error: 'Demasiados intentos. Vuelve a intentarlo en 15 minutos.' };

// Bloqueo por intentos fallidos. Lleva la cuenta por clave de cliente (la IP): a los
// `maxFails` fallos seguidos bloquea `lockMs`. Un acierto reinicia la cuenta.
export function createLoginGuard({ now = Date.now, maxFails = 5, lockMs = 15 * 60 * 1000 } = {}) {
  const entries = new Map(); // clave -> { fails, lockedUntil }

  const dropExpiredLocks = () => {
    const current = now();
    for (const [key, entry] of entries) {
      if (entry.lockedUntil !== null && entry.lockedUntil <= current) entries.delete(key);
    }
  };

  return {
    check(key) {
      dropExpiredLocks();
      const entry = entries.get(key);
      if (entry && entry.lockedUntil !== null) {
        return { blocked: true, retryAfterSeconds: Math.ceil((entry.lockedUntil - now()) / 1000) };
      }
      return { blocked: false };
    },
    fail(key) {
      const entry = entries.get(key) ?? { fails: 0, lockedUntil: null };
      entry.fails += 1;
      if (entry.fails >= maxFails) entry.lockedUntil = now() + lockMs;
      entries.set(key, entry);
      return { blocked: false };
    },
    success(key) {
      entries.delete(key);
    },
    size() {
      return entries.size;
    },
  };
}

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest();

// Compara los hashes en tiempo constante para no filtrar información de la clave.
const passwordMatches = (input, expected) => crypto.timingSafeEqual(sha256(input), sha256(expected));

function readCookie(header, name) {
  for (const part of (header ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

export function authRouter({ adminPassword, now, secureCookies = false }) {
  const router = Router();
  const sessions = new Set();
  const guard = createLoginGuard({ now });
  const flags = `HttpOnly; SameSite=Strict; Path=/${secureCookies ? '; Secure' : ''}`;

  const requireAdmin = (req, res, next) => {
    const token = readCookie(req.headers.cookie, COOKIE_NAME);
    if (token && sessions.has(token)) return next();
    res.status(401).json(NO_SESSION);
  };

  router.post('/login', (req, res) => {
    const password = req.body?.password;
    if (typeof password !== 'string' || password === '') return res.status(400).json(EMPTY_PASSWORD);

    const status = guard.check(req.ip);
    if (status.blocked) {
      res.set('Retry-After', String(status.retryAfterSeconds));
      return res.status(429).json(LOCKED);
    }

    if (!passwordMatches(password, adminPassword)) {
      guard.fail(req.ip);
      return res.status(401).json(WRONG_PASSWORD);
    }

    guard.success(req.ip);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.add(token);
    // Sin Max-Age ni Expires: el navegador descarta la cookie al cerrarse.
    res.set('Set-Cookie', `${COOKIE_NAME}=${token}; ${flags}`);
    res.status(204).end();
  });

  router.post('/logout', (req, res) => {
    const token = readCookie(req.headers.cookie, COOKIE_NAME);
    if (token) sessions.delete(token);
    res.set('Set-Cookie', `${COOKIE_NAME}=; ${flags}; Max-Age=0`);
    res.status(204).end();
  });

  // Guardia general: todo lo demás bajo /api/admin/* exige sesión, exista o no la ruta.
  router.use(requireAdmin);

  router.get('/session', (req, res) => res.status(204).end());

  return router;
}
