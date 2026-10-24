import { describe, expect, it } from 'vitest';
import { buildOrderMessage, buildWhatsAppUrl } from '../../client/src/lib/whatsapp.js';

const lines = [
  { productId: 1, name: 'iPhone 15 Pro 256GB', priceCents: 429900, quantity: 1, subtotalCents: 429900 },
  { productId: 2, name: 'SSD Kingston NV2 1TB', priceCents: 30000, quantity: 2, subtotalCents: 60000 },
];

const expectedMessage = [
  'Hola Chaski Store, quiero hacer este pedido:',
  '',
  '1. iPhone 15 Pro 256GB x1 = S/ 4,299.00',
  '2. SSD Kingston NV2 1TB x2 = S/ 600.00',
  '',
  'Total: S/ 4,899.00',
].join('\n');

describe('buildOrderMessage', () => {
  it('produce exactamente el formato del contrato', () => {
    expect(buildOrderMessage(lines)).toBe(expectedMessage);
  });

  it('incluye todos los productos con su cantidad y su subtotal', () => {
    const message = buildOrderMessage(lines);
    for (const line of lines) {
      expect(message).toContain(line.name);
      expect(message).toContain(`x${line.quantity}`);
    }
    expect(message).toContain('S/ 4,299.00');
    expect(message).toContain('S/ 600.00');
  });

  it('el total es la suma de los subtotales', () => {
    const three = [
      { productId: 1, name: 'A', priceCents: 129990, quantity: 3, subtotalCents: 389970 },
      { productId: 2, name: 'B', priceCents: 5900, quantity: 2, subtotalCents: 11800 },
    ];
    expect(buildOrderMessage(three)).toMatch(/Total: S\/ 4,017\.70$/);
  });

  it('no contiene datos personales del cliente', () => {
    const message = buildOrderMessage(lines);
    expect(message).not.toMatch(/nombre|tel[eé]fono|direcci[oó]n|correo|e-?mail|@/i);
  });
});

describe('buildWhatsAppUrl', () => {
  it('empieza con la dirección de wa.me del número de la tienda', () => {
    const url = buildWhatsAppUrl(lines, '51999999999');
    expect(url.startsWith('https://wa.me/51999999999?text=')).toBe(true);
  });

  it('el texto decodificado es igual al mensaje', () => {
    const url = buildWhatsAppUrl(lines, '51999999999');
    expect(new URL(url).searchParams.get('text')).toBe(expectedMessage);
  });

  it('codifica acentos, saltos de línea y la barra de S/', () => {
    const accents = [
      { productId: 1, name: 'Audífonos Bluetooth Pro', priceCents: 12900, quantity: 1, subtotalCents: 12900 },
    ];
    const url = buildWhatsAppUrl(accents, '51999999999');
    expect(url).toContain(encodeURIComponent('Audífonos'));
    expect(url).toContain('%0A');
    expect(url).toContain('S%2F');
    expect(url).not.toMatch(/\s/);
    expect(url.split('?text=')[1]).toBe(encodeURIComponent(buildOrderMessage(accents)));
  });

  it('devuelve null con un pedido vacío', () => {
    expect(buildWhatsAppUrl([], '51999999999')).toBeNull();
  });
});
