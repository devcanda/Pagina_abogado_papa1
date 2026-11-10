/**
 * Punto de entrada de la API de candamilabogados.com
 *
 * Local:   npm run dev      (Node lee .env con --env-file)
 * cPanel:  este archivo es el "Application startup file" de Passenger.
 *          Passenger ignora el PORT y gestiona el socket él mismo, pero
 *          app.listen() sigue siendo la forma correcta de arrancar.
 */
import { crearApp } from './src/app.js';
import { env } from './src/config/env.js';
import { verificarConexion, cerrarPool } from './src/config/db.js';
import * as publicacionesRepo from './src/repositories/publicaciones.repo.js';

const app = crearApp();

const servidor = app.listen(env.port, async () => {
  console.log(`[api] Escuchando en http://localhost:${env.port}${env.basePath} (${env.nodeEnv})`);

  try {
    const ahora = await verificarConexion();
    console.log(`[api] PostgreSQL conectado — hora del servidor: ${ahora.toISOString()}`);
  } catch (err) {
    // No tumbamos el proceso: /api/health reportará "degraded" y el deploy
    // seguirá en pie mientras se corrige la cadena de conexión.
    console.error(`[api] ⚠️  No se pudo conectar a PostgreSQL: ${err.message}`);
  }

  /*
   * Una publicación que quedó «en marcha» de un arranque anterior se cierra
   * aquí. El candado de la compilación es una fila en la base, así que sin
   * esto un reinicio a mitad lo dejaría echado para siempre: el panel diría
   * «publicando» y nadie podría volver a publicar.
   */
  try {
    const recuperadas = await publicacionesRepo.recuperarInterrumpidas();
    if (recuperadas) {
      console.warn(`[api] ⚠️  ${recuperadas} publicación(es) quedaron a medias en un arranque anterior.`);
    }
  } catch (err) {
    console.error(`[api] No se pudieron revisar las publicaciones a medias: ${err.message}`);
  }

  if (!env.openaiApiKey) {
    console.warn('[api] ⚠️  OPENAI_API_KEY vacía: el bot de triage responderá en modo degradado.');
  }
});

/** Apagado ordenado: Passenger envía SIGTERM en cada reinicio de la app. */
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.on(senal, () => {
    console.log(`[api] ${senal} recibido, cerrando…`);
    servidor.close(async () => {
      await cerrarPool();
      process.exit(0);
    });
  });
}
