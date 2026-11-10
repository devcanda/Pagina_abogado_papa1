import { query } from '../config/db.js';

const CAMPOS = 'id, email, nombre, rol, activo, creado_en, ultimo_acceso';

export async function buscarPorEmail(email) {
  const { rows } = await query(
    `SELECT ${CAMPOS}, hash_clave FROM usuarios WHERE lower(email) = lower($1) LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function buscarPorId(id) {
  const { rows } = await query(`SELECT ${CAMPOS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function crear({ email, nombre, hashClave, rol = 'editor' }) {
  const { rows } = await query(
    `INSERT INTO usuarios (email, nombre, hash_clave, rol)
     VALUES (lower($1), $2, $3, $4) RETURNING ${CAMPOS}`,
    [email, nombre, hashClave, rol],
  );
  return rows[0];
}

export async function registrarAcceso(id) {
  await query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [id]);
}

export async function contar() {
  const { rows } = await query('SELECT count(*)::int AS total FROM usuarios');
  return rows[0].total;
}

/**
 * Sustituye el hash de la contraseña.
 *
 * No recibe la clave en claro: hashearla es asunto de `auth/claves.js`, y un
 * repositorio que supiera de scrypt dejaría de ser solo acceso a datos.
 */
export async function actualizarClave({ id, hashClave }) {
  const { rows } = await query(
    `UPDATE usuarios SET hash_clave = $2 WHERE id = $1
      RETURNING id, email, nombre, rol`,
    [id, hashClave],
  );
  return rows[0] ?? null;
}
