import { beforeEach, describe, expect, it } from 'vitest';
import { createLoginGuard } from '../../server/auth.js';
import { makeClock } from './helpers.js';

const MINUTE = 60 * 1000;
const LOCK_MS = 15 * MINUTE;

let clock;
let guard;
beforeEach(() => {
  clock = makeClock();
  guard = createLoginGuard({ now: () => clock.now(), maxFails: 5, lockMs: LOCK_MS });
});

const failTimes = (key, times) => {
  const results = [];
  for (let i = 0; i < times; i++) results.push(guard.fail(key));
  return results;
};

describe('createLoginGuard', () => {
  it('no bloquea con los fallos 1 a 5 (la respuesta a cada uno sigue siendo "clave incorrecta")', () => {
    for (const result of failTimes('ip-1', 5)) expect(result).toEqual({ blocked: false });
  });

  it('no está bloqueado antes del quinto fallo', () => {
    failTimes('ip-1', 4);
    expect(guard.check('ip-1')).toEqual({ blocked: false });
  });

  it('tras el quinto fallo, check devuelve bloqueado con los segundos restantes', () => {
    failTimes('ip-1', 5);
    expect(guard.check('ip-1')).toEqual({ blocked: true, retryAfterSeconds: 900 });
  });

  it('los segundos restantes bajan con el reloj', () => {
    failTimes('ip-1', 5);
    clock.advance(5 * MINUTE);
    expect(guard.check('ip-1')).toEqual({ blocked: true, retryAfterSeconds: 600 });
  });

  it('desbloquea a los 15 minutos y reinicia el conteo', () => {
    failTimes('ip-1', 5);
    clock.advance(LOCK_MS);
    expect(guard.check('ip-1')).toEqual({ blocked: false });
    failTimes('ip-1', 4);
    expect(guard.check('ip-1')).toEqual({ blocked: false });
    guard.fail('ip-1');
    expect(guard.check('ip-1').blocked).toBe(true);
  });

  it('un acierto antes del quinto fallo reinicia el conteo', () => {
    failTimes('ip-1', 4);
    guard.success('ip-1');
    failTimes('ip-1', 4);
    expect(guard.check('ip-1')).toEqual({ blocked: false });
  });

  it('claves de cliente distintas no se afectan entre sí', () => {
    failTimes('ip-1', 5);
    expect(guard.check('ip-1').blocked).toBe(true);
    expect(guard.check('ip-2')).toEqual({ blocked: false });
    failTimes('ip-2', 4);
    expect(guard.check('ip-2')).toEqual({ blocked: false });
  });

  it('elimina del mapa las entradas vencidas y las reiniciadas', () => {
    failTimes('ip-1', 5);
    failTimes('ip-2', 2);
    guard.success('ip-2');
    expect(guard.size()).toBe(1);
    clock.advance(LOCK_MS + 1);
    guard.check('ip-3');
    expect(guard.size()).toBe(0);
  });
});
