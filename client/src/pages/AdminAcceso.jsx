import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api.js';
import { useDocumentTitle } from '../state/useDocumentTitle.js';

export default function AdminAcceso() {
  useDocumentTitle('Acceso de administrador · Chaski Store');
  const navigate = useNavigate();
  const input = useRef(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fail = (message) => {
    setError(message);
    input.current?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    if (password === '') return fail('Escribe la clave.');

    setError('');
    setSubmitting(true);
    try {
      await login(password);
      navigate('/admin/panel', { replace: true });
    } catch (err) {
      fail(err.body?.error ?? 'No pudimos iniciar sesión. Intenta de nuevo.');
      setSubmitting(false);
    }
  };

  return (
    <main id="contenido" className="page-x mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center py-10">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-card border border-line bg-surface p-6"
      >
        <div className="space-y-1">
          <p translate="no" className="text-sm font-medium text-muted">
            Chaski Store
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Acceso de administrador</h1>
        </div>

        <div className="space-y-2">
          <label htmlFor="clave" className="block text-sm font-medium">
            Clave
          </label>
          <input
            ref={input}
            id="clave"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'clave-error' : undefined}
            className={`h-11 w-full rounded-card border bg-canvas px-3 text-base text-ink focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              error ? 'border-danger' : 'border-line'
            }`}
          />
          <p id="clave-error" aria-live="polite" className={error ? 'text-sm text-danger' : 'sr-only'}>
            {error}
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-card bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover active:bg-accent-press disabled:cursor-wait disabled:opacity-80"
        >
          {submitting && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          Ingresar
        </button>
      </form>
    </main>
  );
}
