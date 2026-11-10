import { query } from '../config/db.js';

export async function crear({ usuarioId, hashToken, expiraEn, ip, agente }) {
  const { rows } = await query(
    `INSERT INTO sesiones (usuario_id, hash_token, expira_en, ip, agente)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [usuarioId, hashToken, expiraEn, ip, agente],
  );
  return rows[0];
}

/** Sesión viva y su usuario, en una sola consulta. */
export async function buscarViva(hashToken) {
  const { rows } = await query(
    `SELECT s.id AS sesion_id, s.expira_en,
            u.id, u.email, u.nombre, u.rol, u.activo
       FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.hash_token = $1 AND s.expira_en > NOW() AND u.activo = TRUE
      LIMIT 1`,
    [hashToken],
  );
  return rows[0] ?? null;
}

export async function revocar(hashToken) {
  await query('DELETE FROM sesiones WHERE hash_token = $1', [hashToken]);
}

export async function revocarDeUsuario(usuarioId) {
  await query('DELETE FROM sesiones WHERE usuario_id = $1', [usuarioId]);
}

/** Limpieza de sesiones caducadas; se llama de vez en cuando, no en cada petición. */
export async function purgar() {
  const { rowCount } = await query('DELETE FROM sesiones WHERE expira_en <= NOW()');
  return rowCount;
}
