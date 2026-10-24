import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/money.js';
import AddToCartButton from './AddToCartButton.jsx';

export default function ProductCard({ product, priority = false }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface">
      <Link
        to={`/producto/${product.id}`}
        className="flex min-w-0 flex-1 flex-col rounded-card focus-visible:-outline-offset-2"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          width="400"
          height="400"
          loading={priority ? 'eager' : 'lazy'}
          className="aspect-square w-full bg-overlay object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
          <h2 className="line-clamp-2 text-base font-semibold leading-snug wrap-anywhere">{product.name}</h2>
          <p className="mt-auto pt-1 whitespace-nowrap text-base font-bold tabular-nums">{formatPrice(product.priceCents)}</p>
        </div>
      </Link>
      <div className="p-3 pt-0">
        <AddToCartButton productId={product.id} />
      </div>
    </article>
  );
}
