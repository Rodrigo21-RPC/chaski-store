import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm.jsx';
import SkipLink from '../components/SkipLink.jsx';
import { createProduct } from '../lib/api.js';
import { useStore } from '../state/StoreContext.jsx';
import { useDocumentTitle } from '../state/useDocumentTitle.js';

export default function AdminNuevoProducto() {
  useDocumentTitle('Agregar producto · Chaski Store');
  const navigate = useNavigate();
  const { refresh } = useStore();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setErrors({});
    setSubmitting(true);
    try {
      await createProduct(formData);
      await refresh();
      navigate('/admin/panel');
    } catch (error) {
      if (error.status === 401) return navigate('/admin', { replace: true });
      if (error.status === 400 && error.body?.errors) setErrors(error.body.errors);
      else setErrors({ form: 'No pudimos guardar el producto. Intenta de nuevo.' });
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8">
      <SkipLink />
      <header className="space-y-2 pb-6">
        <Link to="/admin/panel" className="inline-flex min-h-10 items-center text-sm text-accent hover:underline">
          Volver al panel
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Agregar producto</h1>
      </header>
      <main id="contenido" className="rounded-card border border-line bg-surface p-6">
        <ProductForm errors={errors} submitting={submitting} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
