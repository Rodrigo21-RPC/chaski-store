import { useEffect, useRef, useState } from 'react';
import { canIncrease } from '../lib/cart.js';
import { useStore } from '../state/StoreContext.jsx';

// Botón "Agregar al pedido" de la tarjeta y del detalle. Confirma con un cambio breve de texto.
export default function AddToCartButton({ productId, className = '' }) {
  const { cart } = useStore();
  const [confirmed, setConfirmed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const current = cart.lines.find((line) => line.productId === productId)?.quantity ?? 0;

  const handleClick = () => {
    const changes = canIncrease(current);
    cart.add(productId);
    if (!changes) return;
    setConfirmed(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setConfirmed(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-card bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover active:bg-accent-press ${className}`}
    >
      <span aria-live="polite">{confirmed ? 'Agregado ✓' : 'Agregar al pedido'}</span>
    </button>
  );
}
