// Convierte el texto de especificaciones (una por línea) en filas de la ficha técnica.
// "Etiqueta: valor" pasa a fila; cualquier otra línea no vacía pasa a texto.
export function parseSpecs(text) {
  const items = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '') continue;
    const colon = line.indexOf(':');
    const label = colon > 0 ? line.slice(0, colon).trim() : '';
    const value = colon > 0 ? line.slice(colon + 1).trim() : '';
    if (label && value) {
      items.push({ type: 'row', label, value });
    } else {
      items.push({ type: 'text', text: line });
    }
  }
  return items;
}
