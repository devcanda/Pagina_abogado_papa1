import { query } from '../config/db.js';

/**
 * Deja constancia de quién cambió qué. Con publicación directa y sin
 * aprobación previa, este registro es la única red de seguridad.
 */
export async function registrar({ usuarioId, accion, entidad, entidadId, detalle }) {
  await query(
    `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, detalle)
     VALUES ($1, $2, $3, $4, $5)`,
    [usuarioId ?? null, accion, entidad, entidadId ?? null, detalle ?? null],
  );
}

export async function ultimas(limite = 50) {
  const { rows } = await query(
    `SELECT a.id, a.accion, a.entidad, a.entidad_id, a.detalle, a.creado_en,
            u.nombre AS usuario
       FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
      ORDER BY a.creado_en DESC LIMIT $1`,
    [limite],
  );
  return rows;
}
