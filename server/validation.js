import { z } from 'zod';

export const CATEGORIES = ['Celulares', 'Laptops', 'Accesorios'];

const NAME_ERROR = 'Escribe el nombre del producto.';
const CATEGORY_ERROR = 'Elige una categoría.';
const DESCRIPTION_ERROR = 'Escribe una descripción.';
export const PRICE_ERROR = 'Escribe un precio válido, mayor que cero y con hasta dos decimales.';

// Convierte "1299.9" en céntimos enteros (129990) sin pasar por números de coma flotante.
export function parsePrice(text) {
  if (typeof text !== 'string') return { error: PRICE_ERROR };
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) return { error: PRICE_ERROR };
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0) return { error: PRICE_ERROR };
  return { cents };
}

const required = (message) => z.string({ error: message }).trim().min(1, message);

const productSchema = z.object({
  name: required(NAME_ERROR),
  category: z.enum(CATEGORIES, { error: CATEGORY_ERROR }),
  description: required(DESCRIPTION_ERROR),
  specs: z.string().trim().optional(),
});

// Devuelve { data } con los datos limpios, o { errors } con un mensaje por cada campo con problema.
export function validateProduct(fields = {}) {
  const errors = {};

  const parsed = productSchema.safeParse({
    name: fields.name,
    category: fields.category,
    description: fields.description,
    specs: fields.specs,
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[issue.path[0]] ??= issue.message;
  }

  const price = parsePrice(fields.price);
  if (price.error) errors.price = price.error;

  if (Object.keys(errors).length > 0) return { errors };

  return {
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      priceCents: price.cents,
      description: parsed.data.description,
      specs: parsed.data.specs ?? '',
    },
  };
}
