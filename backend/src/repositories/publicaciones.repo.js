import { query } from '../config/db.js';

/**
 * Intenta abrir una publicación.
 *
 * Devuelve la fila si consiguió el candado, o `null` si ya había una en marcha.
 *
 * El `WHERE NOT EXISTS` va DENTRO del mismo `INSERT` a propósito. Comprobar
 * primero y luego insertar deja una rendija entre las dos sentencias por la que
 * dos pulsaciones casi simultáneas cuelan dos compilaciones. Así la
 * comprobación y la inserción son una sola operación.
 *
 * El índice único parcial de la tabla es la segunda red: aunque el `WHERE` se
 * evaluara a la vez en dos conexiones, la base rechazaría la segunda fila.
 */
export async function abrir({ usuarioId }) {
  const { rows } = await query(
    `INSERT INTO publicaciones (estado, usuario_id)
     SELECT 'en-marcha', $1
      WHERE NOT EXISTS (SELECT 1 FROM publicaciones WHERE estado = 'en-marcha')
     RETURNING id, estado, usuario_id, iniciada_en`,
    [usuarioId ?? null],
  );
  return rows[0] ?? null;
}

export async function cerrar({ id, estado, salida }) {
  const { rows } = await query(
    `UPDATE publicaciones
        SET estado = $2, salida = $3, acabada_en = NOW()
      WHERE id = $1
      RETURNING id, estado, iniciada_en, acabada_en, salida`,
    [id, estado, salida ?? null],
  );
  return rows[0] ?? null;
}

/** La última publicación, en marcha o terminada. Es lo que mira el panel. */
export async function ultima() {
  const { rows } = await query(
    `SELECT p.id, p.estado, p.iniciada_en, p.acabada_en, p.salida, u.nombre AS usuario
       FROM publicaciones p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.iniciada_en DESC
      LIMIT 1`,
  );
  return rows[0] ?? null;
}

/** La última que llegó a buen puerto. Es la que está sirviendo el sitio. */
export async function ultimaHecha() {
  const { rows } = await query(
    `SELECT id, acabada_en FROM publicaciones
      WHERE estado = 'hecha' ORDER BY acabada_en DESC LIMIT 1`,
  );
  return rows[0] ?? null;
}

/**
 * Cierra las publicaciones que quedaron «en marcha» de un arranque anterior.
 *
 * Se llama al arrancar el servidor. Sin esto, un reinicio a mitad de una
 * compilación dejaría la fila abierta para siempre: el candado no se soltaría
 * y el panel diría «publicando» hasta que alguien tocara la base a mano.
 *
 * El margen evita cerrar la publicación de OTRO proceso que esté compilando
 * ahora mismo, si algún día Passenger levanta más de uno.
 */
export async function recuperarInterrumpidas({ minutos = 10 } = {}) {
  const { rows } = await query(
    `UPDATE publicaciones
        SET estado = 'interrumpida', acabada_en = NOW(),
            salida = COALESCE(salida, '') ||
                     E'\\n[recuperada] el servidor se reinició durante la compilación'
      WHERE estado = 'en-marcha'
        AND iniciada_en < NOW() - ($1 || ' minutes')::interval
      RETURNING id`,
    [String(minutos)],
  );
  return rows.length;
}
