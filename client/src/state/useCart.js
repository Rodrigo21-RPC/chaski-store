import { useCallback, useEffect, useRef, useState } from 'react';
import { addItem, changeQuantity as changeLineQuantity, clearCart, parseStoredCart, reconcile, removeItem } from '../lib/cart.js';

const STORAGE_KEY = 'chaski.pedido';

// El almacenamiento puede no estar disponible (modo privado, bloqueado): en ese caso
// el pedido funciona solo en memoria.
function readStored() {
  try {
    return parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeStored(lines) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // sin almacenamiento: el pedido sigue en memoria
  }
}

export function useCart() {
  const [lines, setLines] = useState(readStored);
  const linesRef = useRef(lines);
  linesRef.current = lines;

  useEffect(() => {
    writeStored(lines);
  }, [lines]);

  // Sincroniza el pedido entre pestañas del mismo dispositivo.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) setLines(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((productId) => setLines((current) => addItem(current, productId)), []);
  const changeQuantity = useCallback(
    (productId, delta) => setLines((current) => changeLineQuantity(current, productId, delta)),
    [],
  );
  const remove = useCallback((productId) => setLines((current) => removeItem(current, productId)), []);
  const clear = useCallback(() => setLines(clearCart()), []);

  // Quita las líneas de productos que ya no existen; devuelve cuántas quitó.
  const dropMissing = useCallback((products) => {
    const { lines: kept, removedCount } = reconcile(linesRef.current, products);
    if (removedCount > 0) setLines(kept);
    return removedCount;
  }, []);

  return { lines, add, changeQuantity, remove, clear, dropMissing };
}
