/**
 * Alta de usuarios del panel desde la línea de comandos.
 *
 *   node --env-file=.env scripts/crear-usuario.js <correo> "<nombre>" [rol]
 *
 * No hay formulario de registro abierto a propósito: una pantalla de "crear
 * cuenta" accesible desde internet es la forma más rápida de que cualquiera
 * entre al panel. Las altas las hace quien tiene acceso al servidor.
 *
 * La contraseña se genera aquí y se muestra UNA vez. No se guarda en claro ni
 * se envía por correo.
 */
import { randomBytes } from 'node:crypto';
import { hashear } from '../src/auth/claves.js';
import * as usuariosRepo from '../src/repositories/usuarios.repo.js';
import { cerrarPool } from '../src/config/db.js';

const [, , email, nombre, rolPedido] = process.argv;

if (!email || !nombre) {
  console.error('Uso: node --env-file=.env scripts/crear-usuario.js <correo> "<nombre>" [admin|editor]');
  process.exit(2);
}

// El primer usuario del sistema es administrador por necesidad: si no, nadie
// podría dar de alta a los demás.
const esPrimero = (await usuariosRepo.contar()) === 0;
const rol = rolPedido ?? (esPrimero ? 'admin' : 'editor');

if (!['admin', 'editor'].includes(rol)) {
  console.error(`Rol no válido: ${rol}. Use "admin" o "editor".`);
  process.exit(2);
}

try {
  if (await usuariosRepo.buscarPorEmail(email)) {
    console.error(`Ya existe un usuario con el correo ${email}.`);
    process.exit(1);
  }

  // 18 bytes en base64url: suficiente entropía y legible para dictarla.
  const clave = randomBytes(18).toString('base64url');
  const usuario = await usuariosRepo.crear({
    email, nombre, hashClave: await hashear(clave), rol,
  });

  console.log('\n  Usuario creado');
  console.log(`    correo:     ${usuario.email}`);
  console.log(`    nombre:     ${usuario.nombre}`);
  console.log(`    rol:        ${usuario.rol}`);
  console.log(`    contraseña: ${clave}`);
  console.log('\n  Apúntela ahora: no vuelve a mostrarse.\n');
} catch (err) {
  console.error(`Error al crear el usuario: ${err.message}`);
  process.exitCode = 1;
} finally {
  await cerrarPool();
}
