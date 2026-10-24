import { describe, expect, it } from 'vitest';
import {
  addItem,
  canClear,
  canIncrease,
  cartTotal,
  changeQuantity,
  clearCart,
  countUnits,
  detailLines,
  lineSubtotal,
  MAX_QUANTITY,
  parseStoredCart,
  reconcile,
  removeItem,
  setQuantity,
  showUnitPrice,
} from '../../client/src/lib/cart.js';

const catalog = [
  { id: 1, name: 'iPhone 15 Pro 256GB', priceCents: 429900 },
  { id: 2, name: 'SSD Kingston NV2 1TB', priceCents: 30000 },
  { id: 3, name: 'Laptop X', priceCents: 129990 },
  { id: 4, name: 'Mouse inalámbrico Silent', priceCents: 5900 },
  { id: 5, name: 'Cargador USB-C 65W', priceCents: 8900 },
];

describe('addItem', () => {
  it('crea la línea con cantidad 1 en un pedido vacío', () => {
    expect(addItem([], 1)).toEqual([{ productId: 1, quantity: 1 }]);
  });

  it('suma 1 si el producto ya está, sin crear otra línea', () => {
    const lines = addItem(addItem([], 1), 1);
    expect(lines).toEqual([{ productId: 1, quantity: 2 }]);
  });

  it('agrega productos distintos como líneas distintas, en orden', () => {
    expect(addItem(addItem([], 1), 2)).toEqual([
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
    ]);
  });

  it('no pasa de 99 unidades', () => {
    const lines = [{ productId: 1, quantity: 99 }];
    expect(addItem(lines, 1)).toEqual([{ productId: 1, quantity: 99 }]);
  });

  it('no modifica la lista original', () => {
    const lines = [{ productId: 1, quantity: 1 }];
    addItem(lines, 1);
    expect(lines).toEqual([{ productId: 1, quantity: 1 }]);
  });
});

describe('setQuantity y changeQuantity', () => {
  it('respetan el mínimo de 1', () => {
    const lines = [{ productId: 1, quantity: 1 }];
    expect(changeQuantity(lines, 1, -1)).toEqual([{ productId: 1, quantity: 1 }]);
    expect(setQuantity(lines, 1, 0)).toEqual([{ productId: 1, quantity: 1 }]);
    expect(setQuantity(lines, 1, -5)).toEqual([{ productId: 1, quantity: 1 }]);
  });

  it('respetan el máximo de 99', () => {
    const lines = [{ productId: 1, quantity: 99 }];
    expect(changeQuantity(lines, 1, 1)).toEqual([{ productId: 1, quantity: 99 }]);
    expect(setQuantity(lines, 1, 500)).toEqual([{ productId: 1, quantity: 99 }]);
  });

  it('suben y bajan de a una unidad dentro del rango', () => {
    const lines = [{ productId: 1, quantity: 5 }];
    expect(changeQuantity(lines, 1, 1)).toEqual([{ productId: 1, quantity: 6 }]);
    expect(changeQuantity(lines, 1, -1)).toEqual([{ productId: 1, quantity: 4 }]);
  });

  it('solo cambian la línea indicada', () => {
    const lines = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 2 },
    ];
    expect(changeQuantity(lines, 2, 1)).toEqual([
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 3 },
    ]);
  });
});

describe('reglas de pantalla', () => {
  it('canIncrease es false desde 99 y true por debajo', () => {
    expect(MAX_QUANTITY).toBe(99);
    expect(canIncrease(98)).toBe(true);
    expect(canIncrease(99)).toBe(false);
    expect(canIncrease(1)).toBe(true);
  });

  it('showUnitPrice es true solo si la cantidad es mayor que 1', () => {
    expect(showUnitPrice(1)).toBe(false);
    expect(showUnitPrice(2)).toBe(true);
    expect(showUnitPrice(99)).toBe(true);
  });

  it('canClear es false con el pedido vacío y true con al menos una línea', () => {
    expect(canClear([])).toBe(false);
    expect(canClear([{ productId: 1, quantity: 1 }])).toBe(true);
  });
});

describe('removeItem y clearCart', () => {
  it('quita la línea indicada', () => {
    const lines = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ];
    expect(removeItem(lines, 1)).toEqual([{ productId: 2, quantity: 1 }]);
  });

  it('clearCart deja el pedido vacío', () => {
    expect(clearCart()).toEqual([]);
  });
});

describe('countUnits', () => {
  it('suma todas las cantidades', () => {
    expect(countUnits([])).toBe(0);
    expect(
      countUnits([
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 2 },
      ]),
    ).toBe(3);
  });
});

describe('subtotales y total (SC-003)', () => {
  it('lineSubtotal multiplica en céntimos enteros', () => {
    expect(lineSubtotal(129990, 3)).toBe(389970);
  });

  it('pedido 1: un iPhone y dos SSD', () => {
    const lines = [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 2 },
    ];
    expect(countUnits(lines)).toBe(3);
    expect(cartTotal(lines, catalog)).toBe(489900);
  });

  it('pedido 2: 1299.90 por 3 unidades', () => {
    const lines = [{ productId: 3, quantity: 3 }];
    expect(cartTotal(lines, catalog)).toBe(389970);
  });

  it('pedido 3: un producto repetido agregado varias veces', () => {
    let lines = [];
    lines = addItem(lines, 4);
    lines = addItem(lines, 5);
    lines = addItem(lines, 4);
    expect(lines).toHaveLength(2);
    expect(cartTotal(lines, catalog)).toBe(5900 * 2 + 8900);
  });

  it('el total del pedido vacío es 0', () => {
    expect(cartTotal([], catalog)).toBe(0);
  });

  it('el total ignora líneas de productos que no existen', () => {
    expect(cartTotal([{ productId: 99, quantity: 2 }], catalog)).toBe(0);
  });
});

describe('detailLines', () => {
  it('une cada línea con su producto y su subtotal, en el orden del pedido', () => {
    const lines = [
      { productId: 2, quantity: 2 },
      { productId: 1, quantity: 1 },
    ];
    expect(detailLines(lines, catalog)).toEqual([
      { productId: 2, name: 'SSD Kingston NV2 1TB', priceCents: 30000, quantity: 2, subtotalCents: 60000 },
      { productId: 1, name: 'iPhone 15 Pro 256GB', priceCents: 429900, quantity: 1, subtotalCents: 429900 },
    ]);
  });

  it('omite las líneas cuyo producto no existe', () => {
    expect(detailLines([{ productId: 99, quantity: 1 }], catalog)).toEqual([]);
  });
});

describe('reconcile (FR-024)', () => {
  it('elimina las líneas cuyo producto ya no existe y cuenta cuántas quitó', () => {
    const lines = [
      { productId: 1, quantity: 1 },
      { productId: 99, quantity: 2 },
      { productId: 2, quantity: 3 },
    ];
    expect(reconcile(lines, catalog)).toEqual({
      lines: [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 3 },
      ],
      removedCount: 1,
    });
  });

  it('no cambia nada si todos los productos existen', () => {
    const lines = [{ productId: 1, quantity: 1 }];
    expect(reconcile(lines, catalog)).toEqual({ lines, removedCount: 0 });
  });

  it('puede dejar el pedido vacío', () => {
    expect(reconcile([{ productId: 98, quantity: 1 }], catalog)).toEqual({ lines: [], removedCount: 1 });
  });
});

describe('parseStoredCart', () => {
  it('lee un pedido válido', () => {
    expect(parseStoredCart('[{"productId":1,"quantity":2}]')).toEqual([{ productId: 1, quantity: 2 }]);
  });

  it('devuelve una lista vacía para JSON dañado, algo que no es lista y null', () => {
    expect(parseStoredCart('{no es json')).toEqual([]);
    expect(parseStoredCart('{"productId":1}')).toEqual([]);
    expect(parseStoredCart('"hola"')).toEqual([]);
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart(undefined)).toEqual([]);
  });

  it('descarta líneas sin productId y quantity enteros', () => {
    const stored = JSON.stringify([
      { productId: 1, quantity: 2 },
      { productId: 'x', quantity: 1 },
      { productId: 2 },
      { quantity: 3 },
      { productId: 3, quantity: 1.5 },
      null,
      7,
    ]);
    expect(parseStoredCart(stored)).toEqual([{ productId: 1, quantity: 2 }]);
  });

  it('ajusta cantidades fuera de 1 a 99 al rango', () => {
    const stored = JSON.stringify([
      { productId: 1, quantity: 0 },
      { productId: 2, quantity: 500 },
      { productId: 3, quantity: -4 },
    ]);
    expect(parseStoredCart(stored)).toEqual([
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 99 },
      { productId: 3, quantity: 1 },
    ]);
  });

  it('junta líneas repetidas del mismo producto', () => {
    const stored = JSON.stringify([
      { productId: 1, quantity: 2 },
      { productId: 1, quantity: 3 },
    ]);
    expect(parseStoredCart(stored)).toEqual([{ productId: 1, quantity: 5 }]);
  });
});
