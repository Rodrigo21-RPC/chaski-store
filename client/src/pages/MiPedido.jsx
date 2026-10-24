import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QuantityStepper from '../components/QuantityStepper.jsx';
import { getConfig } from '../lib/api.js';
import { canClear, cartTotal, detailLines, showUnitPrice } from '../lib/cart.js';
import { formatPrice } from '../lib/money.js';
import { buildWhatsAppUrl } from '../lib/whatsapp.js';
import { useStore } from '../state/StoreContext.jsx';
import { useDocumentTitle } from '../state/useDocumentTitle.js';

const primaryLink =
  'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card px-5 text-base font-semibold';
const disabledClass = 'cursor-not-allowed bg-surface text-muted opacity-60 border border-line';

function WhatsAppGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.02-1.58A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-2.98.94.97-2.9-.2-.31a8.2 8.2 0 1 1 6.69 3.6Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03 0 1.2.87 2.35 1 2.51.12.16 1.7 2.6 4.14 3.65 1.54.66 2.14.72 2.91.6.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

export default function MiPedido() {
  useDocumentTitle('Mi pedido · Chaski Store');
  const { products, status, refresh, retry, notice, dismissNotice, cart } = useStore();
  const [whatsappNumber, setWhatsappNumber] = useState(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    getConfig()
      .then((config) => !cancelled && setWhatsappNumber(config.whatsappNumber))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const lines = useMemo(() => detailLines(cart.lines, products), [cart.lines, products]);
  const total = cartTotal(cart.lines, products);
  const whatsappUrl = whatsappNumber ? buildWhatsAppUrl(lines, whatsappNumber) : null;

  const waitingForCatalog = cart.lines.length > 0 && products.length === 0;

  let body;
  if (waitingForCatalog && status === 'loading') {
    body = (
      <div aria-busy="true" aria-label="Cargando tu pedido…" className="space-y-3">
        {cart.lines.map((line) => (
          <div key={line.productId} className="h-24 animate-pulse rounded-card bg-overlay" />
        ))}
      </div>
    );
  } else if (waitingForCatalog && status === 'error') {
    body = (
      <div className="rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-lg font-semibold">No pudimos cargar los productos. Intenta de nuevo.</p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-card bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-press"
        >
          Reintentar
        </button>
      </div>
    );
  } else if (lines.length === 0) {
    body = (
      <div className="rounded-card border border-line bg-surface p-6 text-center">
        <p className="text-lg font-semibold">Tu pedido está vacío</p>
        <Link
          to="/"
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-card bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-press"
        >
          Ver el catálogo
        </Link>
      </div>
    );
  } else {
    body = (
      <ul className="space-y-3">
        {lines.map((line) => {
          const product = productsById.get(line.productId);
          return (
            <li key={line.productId} className="flex gap-3 rounded-card border border-line bg-surface p-3">
              <img
                src={product.imageUrl}
                alt=""
                width="80"
                height="80"
                className="size-20 shrink-0 rounded-chip bg-overlay object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-base font-semibold leading-snug wrap-anywhere">{line.name}</h2>
                  {showUnitPrice(line.quantity) && (
                    <p className="text-sm tabular-nums text-muted">{formatPrice(line.priceCents)} c/u</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <QuantityStepper
                    quantity={line.quantity}
                    name={line.name}
                    onChange={(delta) => cart.changeQuantity(line.productId, delta)}
                  />
                  <p className="whitespace-nowrap text-base font-bold tabular-nums">{formatPrice(line.subtotalCents)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => cart.remove(line.productId)}
                  className="inline-flex min-h-11 w-fit items-center rounded-chip px-2 text-sm font-medium text-danger hover:text-danger-hover hover:underline"
                >
                  Quitar<span className="sr-only"> {line.name} del pedido</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  const hasLines = lines.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Mi pedido</h1>

      {notice && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-accent bg-accent/10 p-3 text-sm"
        >
          <p>{notice}</p>
          <button
            type="button"
            onClick={dismissNotice}
            className="inline-flex min-h-11 items-center rounded-chip border border-line bg-surface px-3 font-medium hover:border-accent"
          >
            Entendido
          </button>
        </div>
      )}

      {body}

      {hasLines && (
        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-lg font-semibold">Total</p>
          <p className="whitespace-nowrap text-2xl font-bold tabular-nums">{formatPrice(total)}</p>
        </div>
      )}

      <p className="rounded-card border border-line bg-surface p-3 text-sm text-muted">
        Tu pedido se envía por WhatsApp. No se realiza ningún pago en esta página.
      </p>

      <div className="space-y-3">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${primaryLink} bg-whatsapp text-canvas hover:brightness-110 active:brightness-95`}
          >
            <WhatsAppGlyph />
            Enviar pedido por WhatsApp
          </a>
        ) : (
          <button type="button" disabled className={`${primaryLink} ${disabledClass}`}>
            <WhatsAppGlyph />
            Enviar pedido por WhatsApp
          </button>
        )}
        <button
          type="button"
          disabled={!canClear(cart.lines)}
          onClick={cart.clear}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-card border border-line bg-surface px-5 text-sm font-medium hover:border-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line"
        >
          Vaciar pedido
        </button>
      </div>
    </div>
  );
}
