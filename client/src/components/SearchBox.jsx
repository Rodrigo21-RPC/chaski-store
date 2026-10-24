export default function SearchBox({ value, onChange }) {
  return (
    <div>
      <label htmlFor="buscar" className="sr-only">
        Buscar productos por nombre
      </label>
      <input
        id="buscar"
        name="q"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por nombre…"
        autoComplete="off"
        spellCheck={false}
        className="h-12 w-full rounded-card border border-line bg-surface px-4 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
    </div>
  );
}
