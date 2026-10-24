import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// FR-025: las pantallas de clientes no muestran enlaces ni botones hacia la administración.
// Es una red de seguridad contra regresiones: revisa solo los archivos que ya existan.
const clientSrc = path.resolve(import.meta.dirname, '../../client/src');
const customerFiles = [
  'pages/Catalogo.jsx',
  'pages/Detalle.jsx',
  'pages/MiPedido.jsx',
  'components/CustomerLayout.jsx',
  'components/CartBadge.jsx',
  'components/ProductCard.jsx',
  'components/AddToCartButton.jsx',
  'components/CategoryChips.jsx',
  'components/SearchBox.jsx',
  'components/QuantityStepper.jsx',
];

describe('pantallas de clientes', () => {
  const existing = customerFiles.filter((file) => fs.existsSync(path.join(clientSrc, file)));

  it.each(existing)('%s no menciona /admin', (file) => {
    const source = fs.readFileSync(path.join(clientSrc, file), 'utf8');
    expect(source).not.toContain('/admin');
  });
});
