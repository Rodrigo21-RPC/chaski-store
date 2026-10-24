import { describe, expect, it } from 'vitest';
import { readConfig } from '../../server/config.js';

const valid = { ADMIN_PASSWORD: 'secreto', WHATSAPP_NUMBER: '51999999999' };

describe('readConfig', () => {
  it('devuelve la configuración con valores válidos y puerto 3000 por defecto', () => {
    expect(readConfig(valid)).toEqual({
      adminPassword: 'secreto',
      whatsappNumber: '51999999999',
      port: 3000,
    });
  });

  it('falla en español nombrando ADMIN_PASSWORD si falta o está vacía', () => {
    expect(() => readConfig({ WHATSAPP_NUMBER: '51999999999' })).toThrow(/ADMIN_PASSWORD/);
    expect(() => readConfig({ ...valid, ADMIN_PASSWORD: '' })).toThrow(/ADMIN_PASSWORD/);
  });

  it('falla en español nombrando WHATSAPP_NUMBER si falta o está vacío', () => {
    expect(() => readConfig({ ADMIN_PASSWORD: 'secreto' })).toThrow(/WHATSAPP_NUMBER/);
    expect(() => readConfig({ ...valid, WHATSAPP_NUMBER: '' })).toThrow(/WHATSAPP_NUMBER/);
  });

  it('acepta solo dígitos, de 8 a 15, sin + ni espacios', () => {
    expect(readConfig({ ...valid, WHATSAPP_NUMBER: '51999999' }).whatsappNumber).toBe('51999999');
    expect(readConfig({ ...valid, WHATSAPP_NUMBER: '123456789012345' }).whatsappNumber).toBe(
      '123456789012345',
    );
    for (const bad of ['+51 999', 'abc', '+51999999999', '5199 9999', '1234567', '1234567890123456']) {
      expect(() => readConfig({ ...valid, WHATSAPP_NUMBER: bad })).toThrow(/WHATSAPP_NUMBER/);
    }
  });

  it('usa 3000 si PORT está ausente o vacío y convierte un PORT válido a número', () => {
    expect(readConfig({ ...valid, PORT: '' }).port).toBe(3000);
    expect(readConfig({ ...valid, PORT: '8080' }).port).toBe(8080);
  });

  it('rechaza un PORT que no es un puerto válido', () => {
    expect(() => readConfig({ ...valid, PORT: 'abc' })).toThrow(/PORT/);
    expect(() => readConfig({ ...valid, PORT: '70000' })).toThrow(/PORT/);
  });
});
