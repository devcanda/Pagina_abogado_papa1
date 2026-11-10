import 'dotenv/config';

/**
 * Lee una variable de entorno obligatoria y falla rápido si no existe.
 * Preferimos un crash al arrancar antes que un 500 silencioso en producción.
 */
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 3000),

  // Prefijo bajo el que se monta la API. En un subdominio dedicado
  // (api.candamilabogados.com) es "/api"; si Passenger ya monta la app en
  // /api, se pone "" para no acabar sirviendo /api/api.
  basePath: (process.env.API_BASE_PATH ?? '/api').replace(/\/$/, ''),

  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4321')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  databaseUrl: required('DATABASE_URL'),
  databaseSsl: process.env.DATABASE_SSL === 'true',

  // Carpeta donde el panel escribe las imágenes y desde donde las sirve el
  // servidor web. En local es `frontend/public/img`; en cPanel, `public_html/img`.
  carpetaMedios: process.env.CARPETA_MEDIOS ?? '../frontend/public/img',

  /**
   * Dónde vive el frontend, para poder recompilarlo al publicar.
   * En local, `../frontend` desde `backend/`. En cPanel hay que apuntarlo a
   * donde esté el proyecto de Astro, que no suele colgar de `public_html`.
   */
  carpetaFrontend: process.env.CARPETA_FRONTEND,

  // Dónde se prepara la compilación antes de ponerla en su sitio. Fuera del
  // proyecto de Astro a propósito (ver `compilacion.service.js`) y en el mismo
  // volumen que el destino, o el renombrado final daría EXDEV.
  carpetaPublicacion: process.env.CARPETA_PUBLICACION,

  // Orden de compilación, configurable por si en el servidor hace falta otra
  // (una ruta absoluta de node, pnpm en vez de npm…). Si se define, va con sus
  // argumentos separados por espacios.
  ordenCompilacion: process.env.ORDEN_COMPILACION,
  argumentosCompilacion: process.env.ARGUMENTOS_COMPILACION
    ? process.env.ARGUMENTOS_COMPILACION.split(' ').filter(Boolean)
    : undefined,

  // URL que usa la compilación para traerse el contenido. Se pasa explícita
  // para que no dependa del .env del frontend, que apunta a producción.
  urlApiParaCompilar: process.env.URL_API_COMPILACION,

  // URL pública del panel, para los enlaces de los correos y los avisos.
  urlPanel: process.env.URL_PANEL ?? 'http://localhost:3000/panel',

  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
};
