import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const imagesDir = path.join(import.meta.dirname, 'seed-images');

// Se insertan en este orden: el último queda primero en el catálogo (más reciente).
const SEED_PRODUCTS = [
  {
    name: 'iPhone 15 Pro 256GB',
    category: 'Celulares',
    priceCents: 429900,
    image: 'iphone-15-pro.svg',
    description: 'Cuerpo de titanio, chip A17 Pro y cámara principal de 48 MP. Ideal para quienes quieren lo mejor de Apple.',
    specs: 'Pantalla: 6.1 pulgadas\nAlmacenamiento: 256 GB\nCámara: 48 MP\nGarantía de 12 meses',
  },
  {
    name: 'Samsung Galaxy S24 128GB',
    category: 'Celulares',
    priceCents: 329900,
    image: 'galaxy-s24.svg',
    description: 'Pantalla AMOLED brillante, cámara con inteligencia artificial y batería para todo el día.',
    specs: 'Pantalla: 6.2 pulgadas\nAlmacenamiento: 128 GB\nMemoria RAM: 8 GB\nGarantía de 12 meses',
  },
  {
    name: 'Xiaomi Redmi Note 13',
    category: 'Celulares',
    priceCents: 89900,
    image: 'redmi-note-13.svg',
    description: 'Un celular económico con pantalla grande y buena cámara para el día a día.',
    specs: 'Pantalla: 6.67 pulgadas\nAlmacenamiento: 128 GB\nMemoria RAM: 6 GB\nBatería: 5000 mAh',
  },
  {
    name: 'MacBook Air M2 13"',
    category: 'Laptops',
    priceCents: 549900,
    image: 'macbook-air-m2.svg',
    description: 'Liviana, silenciosa y muy rápida con el chip M2. Perfecta para estudiar, trabajar y viajar.',
    specs: 'Pantalla: 13.6 pulgadas\nProcesador: Apple M2\nMemoria RAM: 8 GB\nAlmacenamiento: 256 GB SSD',
  },
  {
    name: 'Lenovo IdeaPad 3 15"',
    category: 'Laptops',
    priceCents: 259900,
    image: 'ideapad-3.svg',
    description: 'Laptop confiable para tareas del día a día, clases virtuales y oficina.',
    specs: 'Pantalla: 15.6 pulgadas\nProcesador: Intel Core i5\nMemoria RAM: 8 GB\nAlmacenamiento: 512 GB SSD',
  },
  {
    name: 'ASUS TUF Gaming F15',
    category: 'Laptops',
    priceCents: 399900,
    image: 'asus-tuf-f15.svg',
    description: 'Pensada para jugar y para diseñar, con tarjeta gráfica dedicada y pantalla de alta frecuencia.',
    specs: 'Pantalla: 15.6 pulgadas, 144 Hz\nProcesador: Intel Core i7\nMemoria RAM: 16 GB\nTarjeta gráfica: RTX 3050',
  },
  {
    name: 'SSD Kingston NV2 1TB',
    category: 'Accesorios',
    priceCents: 30000,
    image: 'ssd-kingston-1tb.svg',
    description: 'Unidad de estado sólido para que tu equipo arranque y abra programas mucho más rápido.',
    specs: 'Capacidad: 1 TB\nInterfaz: NVMe PCIe 4.0\nLectura: hasta 3500 MB/s\nGarantía de 36 meses',
  },
  {
    name: 'Audífonos Bluetooth Pro',
    category: 'Accesorios',
    priceCents: 12900,
    image: 'audifonos-bluetooth.svg',
    description: 'Audífonos inalámbricos con cancelación de ruido y estuche de carga.',
    specs: 'Conexión: Bluetooth 5.3\nAutonomía: 30 horas\nCancelación de ruido activa',
  },
  {
    name: 'Cargador USB-C 65W',
    category: 'Accesorios',
    priceCents: 8900,
    image: 'cargador-usb-c-65w.svg',
    description: 'Carga rápida para laptop, tablet y celular con un solo cargador.',
    specs: 'Potencia: 65 W\nPuerto: USB-C\nTecnología: GaN',
  },
  {
    name: 'Mouse inalámbrico Silent',
    category: 'Accesorios',
    priceCents: 5900,
    image: 'mouse-inalambrico.svg',
    description: 'Mouse de clic silencioso, cómodo y con conexión inalámbrica estable.',
    specs: 'Conexión: Receptor USB 2.4 GHz\nBatería: 1 pila AA\nResolución: 1600 DPI',
  },
];

// Siembra el catálogo de ejemplo una sola vez (cuando user_version es 0). Si el
// administrador quita todos los productos, no vuelven a aparecer.
export function seedIfNew(db, uploadsDir) {
  if (db.prepare('PRAGMA user_version').get().user_version !== 0) return;

  const copied = [];
  const insert = db.prepare(
    'INSERT INTO products (name, category, price_cents, description, specs, image) VALUES (?, ?, ?, ?, ?, ?)',
  );

  db.exec('BEGIN');
  try {
    for (const product of SEED_PRODUCTS) {
      const stored = `${crypto.randomUUID()}.svg`;
      fs.copyFileSync(path.join(imagesDir, product.image), path.join(uploadsDir, stored));
      copied.push(stored);
      insert.run(product.name, product.category, product.priceCents, product.description, product.specs, stored);
    }
    db.exec('PRAGMA user_version = 1');
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    for (const stored of copied) fs.rmSync(path.join(uploadsDir, stored), { force: true });
    throw error;
  }
}
