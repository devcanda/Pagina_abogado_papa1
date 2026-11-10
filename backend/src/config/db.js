import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

/**
 * Pool único para todo el proceso. En cPanel/Passenger cada instancia de la app
 * es un proceso aparte, así que mantenemos el máximo bajo para no agotar las
 * conexiones que el hosting permite por usuario de PostgreSQL.
 */
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
  max: env.isProd ? 5 : 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  console.error('[db] Error en cliente inactivo del pool:', err.message);
});

/** Helper de consulta. Centraliza el logging lento en un solo sitio. */
export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const ms = Date.now() - start;
  if (!env.isProd && ms > 200) console.warn(`[db] Consulta lenta (${ms}ms): ${text.slice(0, 80)}`);
  return result;
}

/** Comprobación de arranque: si la base no responde, queremos saberlo ya. */
export async function verificarConexion() {
  const { rows } = await pool.query('SELECT NOW() AS ahora');
  return rows[0].ahora;
}

export async function cerrarPool() {
  await pool.end();
}
