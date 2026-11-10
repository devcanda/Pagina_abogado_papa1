import { query } from '../config/db.js';

/**
 * Huecos que se muestran en el panel.
 *
 * Se excluyen los que empiezan por `prueba-`: existen solo para que las
 * pruebas automáticas tengan dónde subir sin tocar una imagen real del sitio.
 * Una prueba que deja el contenido alterado no es una prueba, es un problema.
 */
export async function listar() {
  const { rows } = await query(
    `SELECT clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido,
            ancho, alto, bytes, actualizado_en
       FROM medios
      WHERE clave NOT LIKE 'prueba-%'
      ORDER BY descripcion, clave`,
  );
  return rows;
}

export async function buscar(clave) {
  const { rows } = await query('SELECT * FROM medios WHERE clave = $1', [clave]);
  return rows[0] ?? null;
}

export async function actualizarArchivo({ clave, archivo, ancho, alto, bytes, usuarioId }) {
  const { rows } = await query(
    `UPDATE medios
        SET archivo = $2, ancho = $3, alto = $4, bytes = $5,
            actualizado_en = NOW(), usuario_id = $6
      WHERE clave = $1
      RETURNING clave, archivo, ancho, alto, bytes, actualizado_en`,
    [clave, archivo, ancho, alto, bytes, usuarioId ?? null],
  );
  return rows[0] ?? null;
}

export async function actualizarAlt({ clave, alt, usuarioId }) {
  const { rows } = await query(
    `UPDATE medios SET alt = $2, actualizado_en = NOW(), usuario_id = $3
      WHERE clave = $1 RETURNING clave, alt`,
    [clave, alt, usuarioId ?? null],
  );
  return rows[0] ?? null;
}
