import { canIncrease } from '../lib/cart.js';

const buttonClass =
  'inline-flex size-11 items-center justify-center rounded-chip border border-line bg-surface text-lg font-medium hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line';

export default function QuantityStepper({ quantity, name, onChange }) {
  return (
    <div role="group" aria-label={`Cantidad de ${name}`} className="inline-flex items-center gap-2">
      <button type="button" aria-label="Disminuir cantidad" onClick={() => onChange(-1)} className={buttonClass}>
        <span aria-hidden="true">−</span>
      </button>
      <output aria-live="polite" className="min-w-8 text-center text-base font-semibold tabular-nums">
        {quantity}
      </output>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={!canIncrease(quantity)}
        onClick={() => onChange(1)}
        className={buttonClass}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
