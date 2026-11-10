import { query } from '../config/db.js';

export async function registrarTurno({ leadId = null, sessionId, mensajeUsuario, respuestaIa }) {
  const { rows } = await query(
    `INSERT INTO chat_logs (lead_id, session_id, mensaje_usuario, respuesta_ia)
     VALUES ($1, COALESCE($2::uuid, gen_random_uuid()), $3, $4)
     RETURNING id, session_id, "timestamp"`,
    [leadId, sessionId, mensajeUsuario, respuestaIa],
  );
  return rows[0];
}

/** Historial de una sesión, para dar memoria corta al bot de triage. */
export async function historialDeSesion(sessionId, limite = 10) {
  const { rows } = await query(
    `SELECT mensaje_usuario, respuesta_ia
       FROM chat_logs
      WHERE session_id = $1::uuid
      ORDER BY "timestamp" DESC
      LIMIT $2`,
    [sessionId, limite],
  );
  return rows.reverse();
}
