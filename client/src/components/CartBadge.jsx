import { Link } from 'react-router-dom';
import { countUnits } from '../lib/cart.js';
import { useStore } from '../state/StoreContext.jsx';

export default function CartBadge() {
  const { cart } = useStore();
  const units = countUnits(cart.lines);
  return (
    <Link
      to="/pedido"
      aria-label={`Mi pedido, ${units} ${units === 1 ? 'unidad' : 'unidades'}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-card border border-line bg-surface px-4 text-sm font-medium hover:border-accent"
    >
      <span>Mi pedido</span>
      <span
        aria-hidden="true"
        className="inline-flex min-w-6 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold tabular-nums text-white"
      >
        {units}
      </span>
    </Link>
  );
}
