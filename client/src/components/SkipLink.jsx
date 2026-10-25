// Primer elemento enfocable de cada pantalla: permite saltar directo al contenido principal.
export default function SkipLink() {
  return (
    <a
      href="#contenido"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-chip focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
    >
      Saltar al contenido
    </a>
  );
}
