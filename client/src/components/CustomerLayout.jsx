import { Link, Outlet } from 'react-router-dom';
import CartBadge from './CartBadge.jsx';
import SkipLink from './SkipLink.jsx';

export default function CustomerLayout() {
  return (
    <div className="page-x mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
      <SkipLink />
      <header className="flex min-h-16 items-center justify-between gap-3 py-2">
        <Link to="/" translate="no" className="inline-flex min-h-11 items-center text-xl font-bold tracking-tight">
          Chaski Store
        </Link>
        <CartBadge />
      </header>
      <main id="contenido" className="flex-1 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  );
}
