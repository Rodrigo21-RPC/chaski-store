import path from 'node:path';
import express from 'express';
import { authRouter } from './auth.js';
import { adminProductsRouter, publicProductsRouter } from './products.js';

const UPLOADS_CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

export function createApp({ db, uploadsDir, adminPassword, whatsappNumber, now = Date.now, secureCookies = false, clientDir }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  app.use(
    '/uploads',
    express.static(uploadsDir, {
      fallthrough: true,
      setHeaders(res) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', UPLOADS_CSP);
      },
    }),
  );
  app.use('/uploads', (req, res) => res.status(404).end());

  app.get('/api/config', (req, res) => {
    res.json({ whatsappNumber });
  });
  app.use('/api/products', publicProductsRouter({ db }));
  app.use('/api/admin', authRouter({ adminPassword, now, secureCookies }));
  app.use('/api/admin/products', adminProductsRouter({ db, uploadsDir }));

  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'No encontramos lo que buscas.' });
  });

  if (clientDir) {
    app.use(express.static(clientDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.sendFile(path.resolve(clientDir, 'index.html'));
    });
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'La solicitud no es válida.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Ocurrió un error. Intenta de nuevo.' });
  });

  return app;
}
