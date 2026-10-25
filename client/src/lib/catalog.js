export const CATEGORIES = ['Todos', 'Celulares', 'Laptops', 'Accesorios'];

const normalize = (text) => text.trim().toLocaleLowerCase('es-PE');

// Filtra por categoría y por nombre (sin distinguir mayúsculas); conserva el orden recibido.
export function filterProducts(products, { category = 'Todos', query = '' } = {}) {
  const needle = normalize(query);
  return products.filter(
    (product) =>
      (category === 'Todos' || product.category === category) &&
      (needle === '' || normalize(product.name).includes(needle)),
  );
}
