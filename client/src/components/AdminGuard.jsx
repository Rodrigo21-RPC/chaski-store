import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession } from '../lib/api.js';

// Muestra las pantallas de administración solo con sesión iniciada; si no, lleva al acceso.
// La protección real está en el servidor: esto solo evita mostrar pantallas vacías.
export default function AdminGuard({ children }) {
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    getSession()
      .then(() => !cancelled && setState('allowed'))
      .catch(() => !cancelled && setState('denied'));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === 'denied') return <Navigate to="/admin" replace />;
  if (state === 'loading') {
    return (
      <p role="status" className="p-8 text-muted">
        Verificando acceso…
      </p>
    );
  }
  return children;
}
