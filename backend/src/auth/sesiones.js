import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import * as sesionesRepo from '../repositories/sesiones.repo.js';
import { env } from '../config/env.js';

/**
 * Sesiones en cookie, con el token hasheado en la base.
 *
 * Lo que viaja en la cookie es el token; lo que se guarda es su SHA-256. Así,
 * quien consiga leer la tabla `sesiones` no puede suplantar a nadie: tendría
 * los hashes, no los tokens.
 */

export const COOKIE_SESION = 'candamil_sesion';
export const COOKIE_CSRF = 'candamil_csrf';
const DURACION_HORAS = 12;

const hashDe = (token) => createHash('sha256').update(token).digest('hex');

function serializarCookie(nombre, valor, { maxAge, httpOnly = true }) {
  const partes = [
    `${nombre}=${valor}`,
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (httpOnly) partes.push('HttpOnly');
  // `Secure` solo en producción: en local se trabaja por http y el navegador
  // descartaría la cookie.
  if (env.isProd) partes.push('Secure');
  return partes.join('; ');
}

/** Crea la sesión y devuelve las cabeceras `Set-Cookie` que hay que enviar. */
export async function iniciar(usuario, req) {
  const token = randomBytes(32).toString('hex');
  const csrf = randomBytes(24).toString('hex');
  const expiraEn = new Date(Date.now() + DURACION_HORAS * 3600 * 1000);

  await sesionesRepo.crear({
    usuarioId: usuario.id,
    hashToken: hashDe(token),
    expiraEn,
    ip: req.ip,
    agente: (req.get('user-agent') ?? '').slice(0, 300),
  });

  const maxAge = DURACION_HORAS * 3600;
  return [
    serializarCookie(COOKIE_SESION, token, { maxAge }),
    // El token anti-CSRF tiene que ser legible por el formulario, así que no
    // es httpOnly. No es un secreto de sesión: solo prueba que la petición
    // nace de una página nuestra.
    serializarCookie(COOKIE_CSRF, csrf, { maxAge, httpOnly: false }),
  ];
}

export async function cerrar(token) {
  if (token) await sesionesRepo.revocar(hashDe(token));
}

export function cookiesDeCierre() {
  return [
    serializarCookie(COOKIE_SESION, '', { maxAge: 0 }),
    serializarCookie(COOKIE_CSRF, '', { maxAge: 0, httpOnly: false }),
  ];
}

export async function usuarioDeToken(token) {
  if (!token) return null;
  return sesionesRepo.buscarViva(hashDe(token));
}

/** Lee las cookies de la cabecera sin depender de `cookie-parser`. */
export function leerCookies(req) {
  const crudo = req.headers.cookie;
  if (!crudo) return {};
  return Object.fromEntries(
    crudo.split(';').map((p) => {
      const i = p.indexOf('=');
      return i === -1
        ? [p.trim(), '']
        : [p.slice(0, i).trim(), decodeURIComponent(p.slice(i + 1).trim())];
    }),
  );
}

/** Comparación en tiempo constante de dos tokens anti-CSRF. */
export function csrfCoincide(cookie, enviado) {
  if (!cookie || !enviado || cookie.length !== enviado.length) return false;
  return timingSafeEqual(Buffer.from(cookie), Buffer.from(enviado));
}
