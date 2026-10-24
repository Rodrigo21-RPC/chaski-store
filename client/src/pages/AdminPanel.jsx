import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import SkipLink from '../components/SkipLink.jsx';
import { deleteProduct, logout } from '../lib/api.js';
import { formatPrice } from '../lib/money.js';
import { useStore } from '../state/StoreContext.jsx';
import { useDocumentTitle } from '../state/useDocumentTitle.js';

const headerCell = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted';

export default function AdminPanel() {
  useDocumentTitle('Panel de administración · Chaski Store');
  const navigate = useNavigate();
  const { products, status, refresh, retry } = useStore();
  const [target, setTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/admin', { replace: true });
    }
  };

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await deleteProduct(target.id);
    } catch (error) {
      if (error.status === 401) return navigate('/admin', { replace: true });
      // Un 404 significa que ya lo habían quitado: se trata como quitado, sin error.
      if (error.status !== 404) {
        setRemoving(false);
        return;
      }
    }
    await refresh();
    setTarget(null);
    setRemoving(false);
  };

  let rows;
  if (products.length === 0 && status === 'loading') {
    rows = (
      <tr>
        <td colSpan={5} className="px-4 py-8 text-center text-muted" role="status">
          Cargando productos…
        </td>
      </tr>
    );
  } else if (products.length === 0 && status === 'error') {
    rows = (
      <tr>
        <td colSpan={5} className="px-4 py-8 text-center">
          <p className="font-medium">No pudimos cargar los productos. Intenta de nuevo.</p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 inline-flex h-10 items-center rounded-card bg-accent px-4 text-sm font-medium text-ink hover:bg-accent-hover"
          >
            Reintentar
          </button>
        </td>
      </tr>
    );
  } else if (products.length === 0) {
    rows = (
      <tr>
        <td colSpan={5} className="px-4 py-8 text-center text-muted">
          Aún no hay productos.
        </td>
      </tr>
    );
  } else {
    rows = products.map((product) => (
      <tr key={product.id} className="h-16 border-t border-line hover:bg-overlay/50">
        <td className="px-4 py-2">
          <img
            src={product.imageUrl}
            alt=""
            width="48"
            height="48"
            className="size-12 rounded-chip bg-overlay object-cover"
          />
        </td>
        <td className="max-w-80 px-4 py-2 text-sm font-medium wrap-anywhere">{product.name}</td>
        <td className="px-4 py-2 text-sm text-muted">{product.category}</td>
        <td className="whitespace-nowrap px-4 py-2 text-sm font-semibold tabular-nums">{formatPrice(product.priceCents)}</td>
        <td className="px-4 py-2 text-right">
          <button
            type="button"
            onClick={() => setTarget(product)}
            className="inline-flex h-9 items-center rounded-card border border-danger px-3 text-sm font-medium text-danger hover:bg-danger hover:text-ink"
          >
            Quitar<span className="sr-only"> {product.name}</span>
          </button>
        </td>
      </tr>
    ));
  }

  return (
    <div className="mx-auto w-full max-w-344 px-4 py-6 md:px-8">
      <SkipLink />
      <header className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Panel de administración</h1>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/productos/nuevo"
            className="inline-flex h-10 items-center rounded-card bg-accent px-4 text-sm font-medium text-ink hover:bg-accent-hover active:bg-accent-press"
          >
            Agregar producto
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center rounded-card border border-line bg-surface px-4 text-sm font-medium hover:border-accent"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main id="contenido" className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-160 border-collapse">
          <caption className="sr-only">Productos del catálogo, del más reciente al más antiguo</caption>
          <thead>
            <tr>
              <th scope="col" className={headerCell}>
                <span className="sr-only">Foto</span>
              </th>
              <th scope="col" className={headerCell}>
                Nombre
              </th>
              <th scope="col" className={headerCell}>
                Categoría
              </th>
              <th scope="col" className={headerCell}>
                Precio
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </main>

      <ConfirmDialog
        open={target !== null}
        name={target?.name ?? ''}
        busy={removing}
        onConfirm={confirmRemove}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
