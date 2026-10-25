import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryChips from '../components/CategoryChips.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SearchBox from '../components/SearchBox.jsx';
import { CATEGORIES, filterProducts } from '../lib/catalog.js';
import { useDocumentTitle } from '../state/useDocumentTitle.js';
import { useStore } from '../state/StoreContext.jsx';

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando productos…" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="aspect-square animate-pulse bg-overlay" />
          <div className="space-y-2 p-3">
            <div className="h-4 animate-pulse rounded bg-overlay" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Message({ title, children }) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {children}
    </div>
  );
}

const actionClass =
  'mt-4 inline-flex min-h-11 items-center justify-center rounded-card bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-press';

export default function Catalogo() {
  useDocumentTitle('Catálogo · Chaski Store');
  const { products, status, refresh, retry } = useStore();
  const [params, setParams] = useSearchParams();

  const requested = params.get('categoria');
  const category = CATEGORIES.includes(requested) ? requested : 'Todos';
  const query = params.get('q') ?? '';

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === 'Todos') next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  };

  const visible = useMemo(() => filterProducts(products, { category, query }), [products, category, query]);

  let content;
  if (products.length === 0 && status === 'loading') {
    content = <Skeleton />;
  } else if (products.length === 0 && status === 'error') {
    content = (
      <Message title="No pudimos cargar los productos. Intenta de nuevo.">
        <button type="button" onClick={retry} className={actionClass}>
          Reintentar
        </button>
      </Message>
    );
  } else if (products.length === 0) {
    content = <Message title="Aún no hay productos disponibles" />;
  } else if (visible.length === 0) {
    content = (
      <Message title="No encontramos productos">
        <button type="button" onClick={() => update({ categoria: 'Todos', q: '' })} className={actionClass}>
          Ver todos los productos
        </button>
      </Message>
    );
  } else {
    content = (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
    );
  }

  const showFilters = products.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
      {showFilters && (
        <div className="space-y-3">
          <SearchBox value={query} onChange={(value) => update({ q: value })} />
          <CategoryChips value={category} onChange={(value) => update({ categoria: value })} />
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {showFilters ? `${visible.length} productos` : ''}
      </p>
      {content}
    </div>
  );
}
