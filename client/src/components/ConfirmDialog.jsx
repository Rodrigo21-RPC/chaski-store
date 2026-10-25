import { useEffect, useRef } from 'react';

// Confirmación con el elemento nativo <dialog>: ya trae foco atrapado y cierre con Escape.
export default function ConfirmDialog({ open, name, busy = false, onConfirm, onCancel }) {
  const dialog = useRef(null);
  const cancelButton = useRef(null);

  useEffect(() => {
    const element = dialog.current;
    if (open && !element.open) {
      element.showModal();
      cancelButton.current?.focus();
    }
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="confirmar-titulo"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100%-2rem))] overscroll-contain rounded-card border border-line bg-surface p-6 text-ink backdrop:bg-canvas/60"
    >
      <h2 id="confirmar-titulo" className="text-lg font-semibold">
        ¿Quitar este producto?
      </h2>
      <p className="mt-2 text-sm text-muted wrap-anywhere">
        <span className="font-medium text-ink">{name}</span> dejará de mostrarse en la tienda.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          ref={cancelButton}
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="inline-flex h-10 items-center rounded-card border border-line bg-canvas px-4 text-sm font-medium hover:border-accent disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onConfirm}
          className="inline-flex h-10 items-center gap-2 rounded-card bg-danger px-4 text-sm font-medium text-ink hover:bg-danger-hover disabled:cursor-wait disabled:opacity-80"
        >
          {busy && (
            <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          Quitar
        </button>
      </div>
    </dialog>
  );
}
