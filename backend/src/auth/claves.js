import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derivar = promisify(scrypt);

/**
 * Hash de contraseñas con `scrypt` de la biblioteca estándar.
 *
 * Se elige frente a bcrypt o argon2 porque ambos son módulos nativos: en
 * hosting compartido su compilación es la primera fuente de problemas de
 * despliegue. `scrypt` viene en Node y resiste bien el hardware dedicado.
 */

const LONGITUD_SAL = 16;
const LONGITUD_CLAVE = 64;
// Coste: ~100 ms por verificación en un equipo normal. Subirlo encarece el
// ataque por fuerza bruta en la misma proporción que el inicio de sesión.
const OPCIONES = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** Devuelve "sal:derivada", ambas en hexadecimal. */
export async function hashear(clave) {
  const sal = randomBytes(LONGITUD_SAL);
  const derivada = await derivar(clave, sal, LONGITUD_CLAVE, OPCIONES);
  return `${sal.toString('hex')}:${derivada.toString('hex')}`;
}

/**
 * Comprueba una contraseña contra su hash.
 *
 * La comparación es en tiempo constante: una comparación normal filtra, por lo
 * que tarda, cuántos bytes coinciden.
 */
export async function verificar(clave, almacenado) {
  if (typeof almacenado !== 'string' || !almacenado.includes(':')) return false;

  const [salHex, derivadaHex] = almacenado.split(':');
  let sal;
  let esperada;
  try {
    sal = Buffer.from(salHex, 'hex');
    esperada = Buffer.from(derivadaHex, 'hex');
  } catch {
    return false;
  }
  if (sal.length !== LONGITUD_SAL || esperada.length !== LONGITUD_CLAVE) return false;

  const obtenida = await derivar(clave, sal, LONGITUD_CLAVE, OPCIONES);
  return timingSafeEqual(obtenida, esperada);
}

/**
 * Consume el mismo tiempo que una verificación real.
 *
 * Se llama cuando el correo no existe: sin esto, un atacante distingue
 * "usuario inexistente" de "contraseña incorrecta" midiendo la respuesta, y
 * eso le permite enumerar cuentas válidas.
 */
export async function gastarTiempoEquivalente() {
  await derivar('señuelo', randomBytes(LONGITUD_SAL), LONGITUD_CLAVE, OPCIONES);
}
