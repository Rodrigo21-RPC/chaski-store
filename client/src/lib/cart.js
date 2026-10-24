// Reglas del pedido. Un pedido es una lista de líneas { productId, quantity }.
// Solo se guardan ids y cantidades: nombres y precios salen siempre del catálogo.
// Todo el dinero va en céntimos enteros.
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

const clamp = (quantity) => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, quantity));

const mapLine = (lines, productId, update) =>
  lines.map((line) => (line.productId === productId ? { ...line, quantity: clamp(update(line.quantity)) } : line));

export function addItem(lines, productId) {
  if (!lines.some((line) => line.productId === productId)) {
    return [...lines, { productId, quantity: MIN_QUANTITY }];
  }
  return mapLine(lines, productId, (quantity) => quantity + 1);
}

export const setQuantity = (lines, productId, quantity) => mapLine(lines, productId, () => quantity);

export const changeQuantity = (lines, productId, delta) => mapLine(lines, productId, (quantity) => quantity + delta);

export const removeItem = (lines, productId) => lines.filter((line) => line.productId !== productId);

export const clearCart = () => [];

export const countUnits = (lines) => lines.reduce((sum, line) => sum + line.quantity, 0);

export const canIncrease = (quantity) => quantity < MAX_QUANTITY;

export const showUnitPrice = (quantity) => quantity > 1;

export const canClear = (lines) => lines.length > 0;

export const lineSubtotal = (priceCents, quantity) => priceCents * quantity;

const byId = (products) => new Map(products.map((product) => [product.id, product]));

// Une cada línea con su producto del catálogo (omite las de productos que ya no existen).
export function detailLines(lines, products) {
  const catalog = byId(products);
  const detailed = [];
  for (const line of lines) {
    const product = catalog.get(line.productId);
    if (!product) continue;
    detailed.push({
      productId: product.id,
      name: product.name,
      priceCents: product.priceCents,
      quantity: line.quantity,
      subtotalCents: lineSubtotal(product.priceCents, line.quantity),
    });
  }
  return detailed;
}

export const cartTotal = (lines, products) =>
  detailLines(lines, products).reduce((sum, line) => sum + line.subtotalCents, 0);

// Quita las líneas cuyo producto ya no existe (FR-024).
export function reconcile(lines, products) {
  const catalog = byId(products);
  const kept = lines.filter((line) => catalog.has(line.productId));
  return { lines: kept, removedCount: lines.length - kept.length };
}

// Lee el pedido guardado en el dispositivo; cualquier dato dañado se trata como pedido vacío.
export function parseStoredCart(json) {
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const merged = new Map();
  for (const item of data) {
    if (!item || !Number.isInteger(item.productId) || !Number.isInteger(item.quantity)) continue;
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + item.quantity);
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity: clamp(quantity) }));
}
