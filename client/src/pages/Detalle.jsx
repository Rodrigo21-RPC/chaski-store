import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../lib/api.js';
import { formatPrice } from '../lib/money.js';
import { parseSpecs } from '../lib/specs.js';
import AddToCartButton from '../components/AddToCartButton.jsx';
import { useDocumentTitle } from '../state/useDocumentTitle.js';

const secondaryButton =
  'inline-flex min-h-11 items-center justify-center rounded-card border border-line bg-surface px-4 text-sm font-medium hover:border-accent';

function SpecsTable({ specs }) {
  const items = parseSpecs(specs);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="ficha" className="space-y-2">
      <h2 id="ficha" className="text-lg font-semibold">
        Ficha técnica
      </h2>
      <dl className="overflow-hidden rounded-card border border-line">
        {items.map((item, index) =>
          item.type === 'row' ? (
            <div
              key={index}
              className="grid grid-cols-[2fr_3fr] gap-3 px-3 py-2 text-sm odd:bg-surface even:bg-canvas"
            >
              <dt className="text-muted wrap-anywhere">{item.label}</dt>
              <dd className="wrap-anywhere">{item.value}</dd>
            </div>
          ) : (
            <div key={index} className="px-3 py-2 text-sm wrap-anywhere odd:bg-surface even:bg-canvas">
              <dt className="sr-only">Nota</dt>
              <dd>{item.text}</dd>
            </div>
          ),
        )}
      </dl>
    </section>
  );
}

export default function Detalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({ status: 'loading', product: null });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', product: null });
    getProduct(id)
      .then((product) => !cancelled && setState({ status: 'ready', product }))
      .catch((error) => !cancelled && setState({ status: error.status === 404 ? 'notfound' : 'error', product: null }));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useDocumentTitle(
    state.product ? `${state.product.name} · Chaski Store` : 'Producto · Chaski Store',
  );

  const goBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/'));

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Cargando producto…" className="space-y-4">
        <div className="aspect-square w-full max-w-md animate-pulse rounded-card bg-overlay" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-overlay" />
      </div>
    );
  }

  if (state.status !== 'ready') {
    const unavailable = state.status === 'notfound';
    return (
      <div className="rounded-card border border-line bg-surface p-6 text-center">
        <h1 className="text-lg font-semibold">
          {unavailable ? 'Este producto ya no está disponible' : 'No pudimos cargar el producto. Intenta de nuevo.'}
        </h1>
        <Link
          to="/"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-card bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-press"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const { product } = state;

  return (
    <article className="space-y-5 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
      <img
        src={product.imageUrl}
        alt={product.name}
        width="800"
        height="800"
        className="aspect-square w-full rounded-card border border-line bg-overlay object-cover"
      />
      <div className="min-w-0 space-y-5">
        <button type="button" onClick={goBack} className={secondaryButton}>
          Volver
        </button>
        <div className="space-y-2">
          <p className="text-sm font-medium text-accent">{product.category}</p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight wrap-anywhere">{product.name}</h1>
          <p className="whitespace-nowrap text-2xl font-bold tabular-nums">{formatPrice(product.priceCents)}</p>
        </div>
        <p className="whitespace-pre-line text-base leading-relaxed text-muted wrap-anywhere">{product.description}</p>
        <AddToCartButton productId={product.id} />
        <SpecsTable specs={product.specs} />
      </div>
    </article>
  );
}
