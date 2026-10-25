import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request } from '../lib/api.js';
import { useCart } from './useCart.js';

const StoreContext = createContext(null);

const REMOVED_NOTICE = 'Quitamos de tu pedido productos que ya no están disponibles.';

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [notice, setNotice] = useState(null);
  const cart = useCart();
  const { dropMissing } = cart;

  // Vuelve a pedir la lista. Si ya había datos y falla, se conservan los anteriores.
  // Con una lista nueva, quita del pedido los productos que ya no existen (FR-024).
  const refresh = useCallback(async () => {
    try {
      const list = await request('/api/products');
      setProducts(list);
      setStatus('ready');
      if (dropMissing(list) > 0) setNotice(REMOVED_NOTICE);
    } catch {
      setStatus((current) => (current === 'ready' ? 'ready' : 'error'));
    }
  }, [dropMissing]);

  const retry = useCallback(() => {
    setStatus('loading');
    refresh();
  }, [refresh]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ products, status, refresh, retry, notice, dismissNotice, cart }),
    [products, status, refresh, retry, notice, dismissNotice, cart],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore debe usarse dentro de StoreProvider');
  return value;
}
