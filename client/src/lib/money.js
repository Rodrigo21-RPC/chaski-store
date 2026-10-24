// Formato de precios en soles. Trabaja solo con enteros (céntimos) para que los
// totales sean exactos y el resultado no dependa del idioma del navegador.
export function formatPrice(cents) {
  const soles = Math.floor(cents / 100);
  const decimals = String(cents % 100).padStart(2, '0');
  const grouped = String(soles).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `S/ ${grouped}.${decimals}`;
}
