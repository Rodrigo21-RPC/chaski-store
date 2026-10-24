import { CATEGORIES } from '../lib/catalog.js';

export default function CategoryChips({ value, onChange }) {
  return (
    <div role="group" aria-label="Categorías" className="flex flex-wrap gap-2">
      {CATEGORIES.map((category) => {
        const active = category === value;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(category)}
            className={`min-h-11 rounded-chip border px-4 text-sm font-medium transition-colors ${
              active
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-line bg-surface text-muted hover:border-accent hover:text-ink'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
