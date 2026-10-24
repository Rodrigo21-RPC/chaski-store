import { Router } from 'express';
import multer from 'multer';
import { deleteImage, detectImageType, saveImage } from './images.js';
import { validateProduct } from './validation.js';

const NOT_FOUND = { error: 'Este producto ya no está disponible.' };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const readImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
}).single('image');

export function toDto(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    priceCents: row.price_cents,
    description: row.description,
    specs: row.specs,
    imageUrl: `/uploads/${row.image}`,
  };
}

// Rutas públicas de lectura. Orden: del más reciente al más antiguo (id descendente).
export function publicProductsRouter({ db }) {
  const router = Router();

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(rows.map(toDto));
  });

  router.get('/:id', (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) return res.status(404).json(NOT_FOUND);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));
    if (!row) return res.status(404).json(NOT_FOUND);
    res.json(toDto(row));
  });

  return router;
}

// Rutas de administración. Se montan detrás del guardia de /api/admin/* (server/auth.js),
// así que aquí no se vuelve a comprobar la sesión.
export function adminProductsRouter({ db, uploadsDir }) {
  const router = Router();

  const insert = db.prepare(
    'INSERT INTO products (name, category, price_cents, description, specs, image) VALUES (?, ?, ?, ?, ?, ?)',
  );

  const createProduct = (req, res) => {
    const { data, errors = {} } = validateProduct(req.body ?? {});

    const file = req.file;
    const imageType = file ? detectImageType(file.buffer) : null;
    if (!file) errors.image = 'Elige una foto.';
    else if (!imageType) errors.image = 'La foto debe ser JPG, PNG o WebP.';

    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // Primero el archivo y luego la fila; si la fila falla, no queda la foto huérfana.
    const image = saveImage(file.buffer, imageType, uploadsDir);
    try {
      const { lastInsertRowid } = insert.run(data.name, data.category, data.priceCents, data.description, data.specs, image);
      const row = db.prepare('SELECT * FROM products WHERE id = ?').get(lastInsertRowid);
      res.status(201).json(toDto(row));
    } catch (error) {
      deleteImage(image, uploadsDir);
      throw error;
    }
  };

  router.post('/', (req, res, next) => {
    readImage(req, res, (error) => {
      if (!error) return createProduct(req, res);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ errors: { image: 'La foto no debe pesar más de 5 MB.' } });
      }
      if (error instanceof multer.MulterError) return res.status(400).json({ error: 'La solicitud no es válida.' });
      next(error);
    });
  });

  router.delete('/:id', (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) return res.status(404).json(NOT_FOUND);
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!row) return res.status(404).json(NOT_FOUND);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    deleteImage(row.image, uploadsDir);
    res.status(204).end();
  });

  return router;
}
