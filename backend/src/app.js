import express from 'express';
import { carpetaMedios } from './services/imagenes.service.js';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { panelRouter } from './admin/rutas.js';
import { cargarSesion } from './middlewares/panel.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

export function crearApp() {
  const app = express();

  // Passenger actúa como proxy inverso: sin esto, req.ip sería siempre la del servidor
  // y el rate limit trataría a todos los visitantes como un único cliente.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  /**
   * CORS, SOLO para la API.
   *
   * No se aplica a todo el servidor a propósito. CORS existe para permitir que
   * un origen distinto consuma la API; el panel es HTML que sirve este mismo
   * proceso, así que sus formularios son del mismo origen y no tienen nada que
   * negociar. Cuando estaba global, el navegador enviaba el `Origin` del
   * propio panel —que no está en la lista de orígenes de la API— y el acceso
   * se rechazaba con «Origen no permitido por CORS».
   */
  const corsApi = cors({
    origin(origin, callback) {
      // Sin Origin = curl, Postman o el build de Astro en el servidor.
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
  });

  app.use(express.json({ limit: '100kb' }));
  // El acceso del panel va como formulario clásico, no como JSON. Ambos
  // analizadores ignoran `multipart`, así que la subida de imágenes llega con
  // el flujo intacto y se lee a mano en `admin/rutas.js`.
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));

  /**
   * Imágenes del sitio, SOLO en desarrollo.
   *
   * En producción las sirve Apache desde `public_html/img`, y el panel se ve
   * en el mismo dominio, así que las vistas previas cargan solas. En local el
   * panel vive en el puerto 3000 y las imágenes en el 4340: sin esto, la
   * biblioteca del panel sale llena de recuadros grises y no se puede
   * comprobar si una foto quedó bien al subirla.
   */
  if (!env.isProd) {
    // `maxAge: 0` porque aquí se sustituyen imágenes continuamente y una caché
    // haría dudar de si la subida funcionó.
    app.use('/img', express.static(carpetaMedios(), { maxAge: 0 }));
  }

  // El panel va ANTES que la API y bajo su propio prefijo: su sesión es por
  // cookie, no por token, y no debe quedar bajo las rutas públicas.
  app.use('/panel', cargarSesion, panelRouter);

  app.use(env.basePath || '/', corsApi, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
