/**
 * Cambio de contraseña del panel, desde la línea de comandos.
 *
 *   node --env-file=.env scripts/cambiar-clave.js <correo>            (genera una fuerte)
 *   node --env-file=.env scripts/cambiar-clave.js <correo> <clave>    (pone la que usted diga)
 *
 * No hay pantalla de «he olvidado mi contraseña» a propósito: un formulario de
 * recuperación accesible desde internet es otra puerta al panel, y con un solo
 * usuario no compensa. Los cambios los hace quien tiene acceso al servidor.
 *
 * La contraseña ANTERIOR no se puede recuperar ni mostrar: en la base solo hay
 * un hash scrypt de un solo sentido. Este script no la lee, la REEMPLAZA.
 */
import { randomBytes } from 'node:crypto';
import { hashear } from '../src/auth/claves.js';
import * as usuariosRepo from '../src/repositories/usuarios.repo.js';
import * as sesionesRepo from '../src/repositories/sesiones.repo.js';
import * as auditoria from '../src/repositories/auditoria.repo.js';
import { env } from '../src/config/env.js';
import { cerrarPool } from '../src/config/db.js';

const [, , email, clavePedida] = process.argv;

if (!email) {
  console.error('Uso: node --env-file=.env scripts/cambiar-clave.js <correo> [clave]');
  process.exit(2);
}

/**
 * Claves que no se admiten en producción.
 *
 * No es una lista exhaustiva ni pretende serlo: son las que aparecen en los
 * primeros renglones de cualquier diccionario de ataque, y por tanto las que
 * un atacante prueba en los primeros segundos. En local se permiten con un
 * aviso, porque el panel solo escucha en `localhost` y escribir una clave
 * larga cuarenta veces al día no aporta seguridad, solo fricción.
 */
const CLAVES_DE_DICCIONARIO = [
  'admin', 'admin123', 'administrador', '123456', '12345678', '123456789',
  'password', 'contrasena', 'contraseña', 'qwerty', 'abc123', 'clave',
  'candamil', 'panel', 'publicidad', 'letmein', '1234', 'test', 'prueba',
];

function evaluar(clave) {
  const motivos = [];
  if (clave.length < 12) motivos.push(`tiene ${clave.length} caracteres; lo razonable son 12 o más`);
  if (CLAVES_DE_DICCIONARIO.includes(clave.toLowerCase())) {
    motivos.push('está en los diccionarios de ataque más comunes');
  }
  if (/^[a-z]+\d{1,4}$/i.test(clave)) motivos.push('es «una palabra + unos dígitos», el patrón que primero se prueba');
  return motivos;
}

try {
  const usuario = await usuariosRepo.buscarPorEmail(email);
  if (!usuario) {
    console.error(`No existe ningún usuario con el correo ${email}.`);
    process.exit(1);
  }

  // 18 bytes en base64url: suficiente entropía y legible para dictarla.
  const generada = !clavePedida;
  const clave = clavePedida ?? randomBytes(18).toString('base64url');
  const motivos = evaluar(clave);

  if (motivos.length && env.isProd) {
    console.error('\n  Esa contraseña NO se admite con NODE_ENV=production:');
    for (const m of motivos) console.error(`    · ${m}`);
    console.error('\n  El panel publica cambios en el sitio real. Omita el segundo');
    console.error('  argumento y el script genera una fuerte.\n');
    process.exit(1);
  }

  const actualizado = await usuariosRepo.actualizarClave({
    id: usuario.id,
    hashClave: await hashear(clave),
  });

  // Cambiar la contraseña tiene que echar a quien ya estuviera dentro: si no,
  // una sesión robada seguiría viva justo después de cambiarla por eso mismo.
  await sesionesRepo.revocarDeUsuario(usuario.id);

  await auditoria.registrar({
    usuarioId: usuario.id,
    accion: 'cambiar-clave',
    entidad: 'usuario',
    entidadId: String(usuario.id),
    // Jamás la clave, ni en claro ni troceada: la auditoría la lee cualquiera
    // con acceso a la base, que es justo de quien la protege el hash.
    detalle: { porConsola: true, generada, avisos: motivos },
  });

  console.log(`\n  Contraseña cambiada para ${actualizado.email}`);
  console.log(`    nombre:     ${actualizado.nombre}`);
  console.log(`    rol:        ${actualizado.rol}`);
  console.log(`    contraseña: ${clave}`);
  console.log('\n  Las sesiones abiertas se han cerrado: hay que volver a entrar.');

  if (motivos.length) {
    console.log('\n  AVISO — esta contraseña es débil:');
    for (const m of motivos) console.log(`    · ${m}`);
    console.log('\n  Vale para trabajar en local. ANTES DE DESPLEGAR hay que cambiarla:');
    console.log(`    node --env-file=.env scripts/cambiar-clave.js ${email}`);
    console.log('  (sin el segundo argumento genera una fuerte).');
  } else if (generada) {
    console.log('\n  Apúntela ahora: no vuelve a mostrarse.');
  }
  console.log('');
} finally {
  await cerrarPool();
}
