import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars -- Express identifica el handler por su aridad (4 args).
export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500;

  if (status >= 500) console.error('[api]', err);

  res.status(status).json({
    error: status >= 500 && env.isProd ? 'Error interno del servidor' : err.message,
    ...(err.detalles ? { detalles: err.detalles } : {}),
  });
}
