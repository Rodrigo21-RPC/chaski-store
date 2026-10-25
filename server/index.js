import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';
import { readConfig } from './config.js';
import { openDb } from './db.js';
import { seedIfNew } from './seed.js';

const root = path.resolve(import.meta.dirname, '..');

let config;
try {
  config = readConfig(process.env);
} catch (error) {
  console.error(`No se pudo iniciar Chaski Store. ${error.message}`);
  process.exit(1);
}

const dataDir = path.join(root, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const db = openDb(path.join(dataDir, 'chaski.db'));
seedIfNew(db, uploadsDir);

const builtClient = path.join(root, 'client', 'dist');

const app = createApp({
  db,
  uploadsDir,
  adminPassword: config.adminPassword,
  whatsappNumber: config.whatsappNumber,
  secureCookies: process.env.NODE_ENV === 'production',
  clientDir: fs.existsSync(builtClient) ? builtClient : undefined,
});

app.listen(config.port, () => {
  console.log(`Chaski Store lista en http://localhost:${config.port}`);
});
