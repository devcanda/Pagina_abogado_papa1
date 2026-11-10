import {
  COOKIE_SESION, COOKIE_CSRF, leerCookies, usuarioDeToken, csrfCoincide,
} from '../auth/sesiones.js';

/**
 * Carga el usuario de la sesión si lo hay. No bloquea: solo deja
 * `req.usuario` disponible para quien lo necesite.
 */
export async function cargarSesion(req, res, next) {
  try {
    const cookies = leerCookies(req);
    req.cookiesPanel = cookies;
    req.usuario = await usuarioDeToken(cookies[COOKIE_SESION]);
    next();
  } catch (err) {
    next(err);
  }
}

/** Corta el paso a quien no tenga sesión. */
export function exigirSesion(req, res, next) {
  if (req.usuario) return next();

  // Solo se redirige una navegación: un GET que pide HTML. Cualquier otra cosa
  // —una subida, una llamada de datos— recibe 401, que es lo que su código
  // sabe interpretar. Sin esta distinción, un `fetch` con la sesión caducada
  // recibiría el HTML del formulario de acceso y fallaría al leerlo como JSON.
  const esNavegacion = req.method === 'GET' && req.accepts('html');
  if (esNavegacion) return res.redirect('/panel/entrar');

  return res.status(401).json({ error: 'Sesión no iniciada o caducada' });
}

export const exigirRol = (...roles) => (req, res, next) => {
  if (req.usuario && roles.includes(req.usuario.rol)) return next();
  res.status(403).json({ error: 'No tiene permiso para esta acción' });
};

/**
 * Doble envío de token anti-CSRF.
 *
 * Sin esto, una página ajena podría hacer que el navegador del editor envíe
 * un formulario a nuestro panel: la cookie de sesión viaja sola. El atacante
 * no puede leer la cookie `csrf` de otro dominio, así que no puede replicar
 * el campo oculto.
 */
export function exigirCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const enCookie = req.cookiesPanel?.[COOKIE_CSRF];
  const enviado = req.body?._csrf ?? req.get('x-csrf-token');

  if (csrfCoincide(enCookie, enviado)) return next();
  res.status(403).json({ error: 'Token de seguridad no válido. Recargue la página.' });
}
