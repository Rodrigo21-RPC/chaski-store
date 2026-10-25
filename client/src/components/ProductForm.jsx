import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_OPTIONS = ['Celulares', 'Laptops', 'Accesorios'];
const FIELD_ORDER = ['name', 'category', 'price', 'description', 'specs', 'image'];

const controlClass = (invalid) =>
  `w-full rounded-card border bg-surface px-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
    invalid ? 'border-danger' : 'border-line'
  }`;

function Field({ id, label, hint, error, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-ayuda`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {/* Región viva siempre presente: el lector de pantalla anuncia el error al aparecer. */}
      <p id={`${id}-error`} aria-live="polite" className={error ? 'text-sm text-danger' : 'sr-only'}>
        {error}
      </p>
    </div>
  );
}

// Formulario de producto. Se puede enviar incompleto: los errores llegan del servidor,
// junto a cada campo, y el foco pasa al primero con problema.
export default function ProductForm({ errors = {}, submitting = false, onSubmit }) {
  const form = useRef(null);

  useEffect(() => {
    const first = FIELD_ORDER.find((name) => errors[name]);
    if (first) form.current?.elements[first]?.focus();
  }, [errors]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!submitting) onSubmit(new FormData(event.currentTarget));
  };

  // En un <textarea>, Ctrl o ⌘ + Enter envía el formulario (Enter solo agrega una línea).
  const submitOnCtrlEnter = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      form.current?.requestSubmit();
    }
  };

  const describe = (name, hasHint = false) => {
    if (errors[name]) return `${name}-error`;
    return hasHint ? `${name}-ayuda` : undefined;
  };

  return (
    <form ref={form} onSubmit={handleSubmit} noValidate className="space-y-5">
      <div aria-live="polite">
        {errors.form && (
          <p className="rounded-card border border-danger p-3 text-sm text-danger">{errors.form}</p>
        )}
      </div>

      <Field id="name" label="Nombre" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={describe('name')}
          className={`${controlClass(errors.name)} h-11`}
        />
      </Field>

      <Field id="category" label="Categoría" error={errors.category}>
        <select
          id="category"
          name="category"
          defaultValue=""
          aria-invalid={errors.category ? 'true' : undefined}
          aria-describedby={describe('category')}
          className={`${controlClass(errors.category)} h-11`}
        >
          <option value="">Elige una categoría</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field id="price" label="Precio (S/)" error={errors.price}>
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            S/
          </span>
          <input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            aria-invalid={errors.price ? 'true' : undefined}
            aria-describedby={describe('price')}
            className={`${controlClass(errors.price)} h-11 pl-9 tabular-nums`}
          />
        </div>
      </Field>

      <Field id="description" label="Descripción" error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={4}
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={describe('description')}
          onKeyDown={submitOnCtrlEnter}
          className={`${controlClass(errors.description)} py-2`}
        />
      </Field>

      <Field
        id="specs"
        label="Especificaciones (opcional)"
        hint="Una por línea, con el formato Etiqueta: valor. Por ejemplo, Pantalla: 6.1 pulgadas."
        error={errors.specs}
      >
        <textarea
          id="specs"
          name="specs"
          rows={5}
          aria-describedby={describe('specs', true)}
          onKeyDown={submitOnCtrlEnter}
          className={`${controlClass(errors.specs)} py-2`}
        />
      </Field>

      <Field id="image" label="Foto" hint="JPG, PNG o WebP, de hasta 5&nbsp;MB." error={errors.image}>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-invalid={errors.image ? 'true' : undefined}
          aria-describedby={describe('image', true)}
          className={`${controlClass(errors.image)} py-2 file:mr-3 file:rounded-chip file:border-0 file:bg-overlay file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink`}
        />
      </Field>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-card bg-accent px-4 text-sm font-medium text-ink hover:bg-accent-hover active:bg-accent-press disabled:cursor-wait disabled:opacity-80"
        >
          {submitting && (
            <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          Guardar producto
        </button>
        <Link
          to="/admin/panel"
          className="inline-flex h-10 items-center rounded-card border border-line bg-surface px-4 text-sm font-medium hover:border-accent"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
