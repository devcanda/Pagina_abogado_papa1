import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'node:crypto';

import * as usuariosRepo from '../repositories/usuarios.repo.js';
import * as mediosRepo from '../repositories/medios.repo.js';
import * as bloquesRepo from '../repositories/bloques.repo.js';
import * as publicacionesRepo from '../repositories/publicaciones.repo.js';
import * as auditoria from '../repositories/auditoria.repo.js';
import { verificar, gastarTiempoEquivalente } from '../auth/claves.js';
import {
  iniciar, cerrar, cookiesDeCierre, COOKIE_SESION, COOKIE_CSRF,
} from '../auth/sesiones.js';
import { exigirSesion, exigirCsrf, exigirRol } from '../middlewares/panel.js';
import { guardar, claveValida, LIMITE_BYTES } from '../services/imagenes.service.js';
import { compilar } from '../services/compilacion.service.js';
import { BLOQUES, sanearDatos, sanearVariantes } from '../../../frontend/src/bloques/registro.js';
import { vistaEntrar } from './vistas.js';
import { vistaBloques } from './vistaBloques.js';
import { asyncHandler } from '../utils/errors.js';

export const panelRouter = Router();

/**
 * Política de seguridad de contenido propia del panel.
 *
 * `helmet` pone por defecto `script-src 'self'`, que prohíbe el JavaScript en
 * línea. El panel lleva el suyo dentro de la página —el que redimensiona las
 * imágenes antes de subirlas y el que mueve los interruptores— así que esa
 * política lo bloqueaba ENTERO: ni se subían imágenes desde el navegador ni
 * respondían los interruptores. Desde Node sí funcionaba, porque un `fetch`
 * de servidor no aplica CSP; por eso las pruebas pasaban y el navegador no.
 *
 * Se arregla con un «nonce» distinto en cada petición en vez de abrir la
 * política con `unsafe-inline`: así solo se ejecuta el script que sirve este
 * servidor, y uno inyectado por otra vía sigue sin ejecutarse.
 */
panelRouter.use((req, res, next) => {
  res.locals.nonce = randomBytes(16).toString('base64');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    `script-src 'self' 'nonce-${res.locals.nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    // `blob:` hace falta: el panel dibuja la imagen elegida en un canvas para
    // redimensionarla, y para eso la carga desde un `URL.createObjectURL`. Sin
    // esto, toda subida falla con «el archivo no es una imagen».
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; '));
  next();
});

/** Token anti-CSRF: el de la sesión si existe, o uno nuevo para el formulario. */
function tokenCsrf(req, res) {
  const existente = req.cookiesPanel?.[COOKIE_CSRF];
  if (existente) return existente;
  const nuevo = randomBytes(24).toString('hex');
  res.append('Set-Cookie',
    `${COOKIE_CSRF}=${nuevo}; Path=/; SameSite=Lax; Max-Age=43200`);
  return nuevo;
}

// Un panel con contraseña es el sitio evidente para probar miles de claves.
const limiteAcceso = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espere unos minutos.' },
});

// ─── Acceso ─────────────────────────────────────────────────────────────────
panelRouter.get('/entrar', (req, res) => {
  if (req.usuario) return res.redirect('/panel/bloques');
  res.type('html').send(vistaEntrar({ csrf: tokenCsrf(req, res) }));
});

panelRouter.post('/entrar', limiteAcceso, exigirCsrf, asyncHandler(async (req, res) => {
  const { email = '', clave = '' } = req.body ?? {};
  const usuario = await usuariosRepo.buscarPorEmail(email);

  // Mismo mensaje y mismo tiempo tanto si el correo no existe como si la clave
  // falla: de lo contrario se puede averiguar qué cuentas son válidas.
  if (!usuario) {
    await gastarTiempoEquivalente();
    return res.status(401).type('html').send(
      vistaEntrar({ error: 'Correo o contraseña incorrectos.', email, csrf: tokenCsrf(req, res) }));
  }

  const correcta = await verificar(clave, usuario.hash_clave);
  if (!correcta || !usuario.activo) {
    await auditoria.registrar({
      usuarioId: usuario.id, accion: 'acceso-fallido', entidad: 'usuario',
      entidadId: String(usuario.id), detalle: { ip: req.ip },
    });
    return res.status(401).type('html').send(
      vistaEntrar({ error: 'Correo o contraseña incorrectos.', email, csrf: tokenCsrf(req, res) }));
  }

  for (const cookie of await iniciar(usuario, req)) res.append('Set-Cookie', cookie);
  await usuariosRepo.registrarAcceso(usuario.id);
  await auditoria.registrar({
    usuarioId: usuario.id, accion: 'acceso', entidad: 'usuario',
    entidadId: String(usuario.id), detalle: { ip: req.ip },
  });
  res.redirect('/panel/bloques');
}));

panelRouter.post('/salir', asyncHandler(async (req, res) => {
  await cerrar(req.cookiesPanel?.[COOKIE_SESION]);
  for (const cookie of cookiesDeCierre()) res.append('Set-Cookie', cookie);
  res.redirect('/panel/entrar');
}));

// ─── Bloques de la portada ──────────────────────────────────────────────────
panelRouter.get('/', exigirSesion, (req, res) => res.redirect('/panel/bloques'));

// La pantalla se llamaba «imágenes» y ahora se organiza por bloques. Se
// mantiene la redirección porque el enlace viejo está en la guía de edición y
// en los marcadores de quien ya venía usando el panel.
panelRouter.get('/imagenes', exigirSesion, (req, res) => res.redirect('/panel/bloques'));

panelRouter.get('/bloques', exigirSesion, asyncHandler(async (req, res) => {
  const [medios, bloques] = await Promise.all([
    mediosRepo.listar(),
    bloquesRepo.bloquesParaPanel('inicio'),
  ]);

  const porClave = new Map(medios.map((m) => [m.clave, m]));
  const clavesConocidas = new Set(porClave.keys());
  const usadas = new Set();

  const conImagenes = bloques.map((b) => {
    const claves = bloquesRepo.clavesDeImagen(b.datos, clavesConocidas);
    claves.forEach((c) => usadas.add(c));
    return { ...b, imagenes: claves.map((c) => porClave.get(c)) };
  });

  // Lo que no usa ningún bloque no se calla: se enseña aparte. Si se omitiera,
  // una imagen huérfana sería invisible para siempre desde el panel.
  const sueltas = medios.filter((m) => !usadas.has(m.clave));

  res.type('html').send(vistaBloques({
    usuario: req.usuario,
    bloques: conImagenes,
    sueltas,
    medios,
    publicacion: await publicacionesRepo.ultima(),
    csrf: tokenCsrf(req, res),
    nonce: res.locals.nonce,
  }));
}));

// ─── Publicar ───────────────────────────────────────────────────────────────
/**
 * Lanza la recompilación del sitio.
 *
 * Responde EN CUANTO coge el candado, sin esperar a que termine: una
 * compilación tarda segundos y dejar la petición abierta la expone a que
 * cualquier proxy por el medio la corte por tiempo. El panel pregunta luego
 * por el estado.
 */
panelRouter.post('/publicar', exigirSesion, exigirRol('admin'), exigirCsrf,
  asyncHandler(async (req, res) => {
    const abierta = await publicacionesRepo.abrir({ usuarioId: req.usuario.id });
    if (!abierta) {
      return res.status(409).json({
        error: 'Ya hay una publicación en marcha. Espere a que termine.',
        data: await publicacionesRepo.ultima(),
      });
    }

    await auditoria.registrar({
      usuarioId: req.usuario.id,
      accion: 'publicar',
      entidad: 'publicacion',
      entidadId: String(abierta.id),
      detalle: {},
    });

    // Deliberadamente SIN `await`: la respuesta sale ya y la compilación sigue
    // en segundo plano. El `catch` es obligatorio, no decorativo: una promesa
    // rechazada sin capturar tumba el proceso de Node entero.
    compilar()
      .then((r) => publicacionesRepo.cerrar({
        id: abierta.id,
        estado: r.ok ? 'hecha' : 'fallida',
        salida: r.salida,
      }))
      .catch((error) => publicacionesRepo.cerrar({
        id: abierta.id,
        estado: 'fallida',
        salida: `Error inesperado: ${error.message}`,
      }).catch(() => {}));

    res.status(202).json({ data: abierta });
  }));

panelRouter.get('/publicar/estado', exigirSesion, asyncHandler(async (req, res) => {
  res.json({ data: await publicacionesRepo.ultima() });
}));

/**
 * Cruza lo que llega del formulario con lo que ya estaba guardado.
 *
 * Hacen falta dos cosas que el saneado por sí solo no puede dar, porque solo
 * conserva lo que ve y un campo ausente desaparece del dato:
 *
 *   · **Conservar lo que el formulario no envía.** Son los campos de RESERVA
 *     superados por un grupo —los sueltos de la cabecera cuando ya hay
 *     láminas—, que el panel no pinta a propósito. Sin esto, guardar textos
 *     dejaría la cabecera sin reserva y vaciar `laminas` algún día la dejaría
 *     en blanco.
 *   · **Comprobar que una clave de imagen existe de verdad.** El registro
 *     valida la FORMA de la clave, que es lo único que puede saber desde el
 *     frontend; el catálogo está aquí. Una clave que no existe se descarta y
 *     se queda la de antes, en vez de dejar el bloque apuntando a un hueco
 *     inventado. De paso cierra el único camino por el que una lámina real
 *     podría acabar apuntando a `prueba-*`, el hueco que usan las pruebas.
 *
 * Es recursiva por los grupos: cada lámina tiene su propia imagen.
 */
function conciliar(campos, enviado, guardado, clavesDeMedios) {
  const salida = { ...enviado };

  for (const [clave, campo] of Object.entries(campos)) {
    const antes = guardado?.[clave];

    if (campo.tipo === 'imagen') {
      const pedida = salida[clave];
      if (pedida === undefined) {
        if (antes !== undefined) salida[clave] = antes;
      } else if (pedida !== '' && !clavesDeMedios.has(pedida)) {
        salida[clave] = antes ?? '';
      }
      continue;
    }

    if (campo.tipo === 'grupo' && Array.isArray(salida[clave])) {
      const listaAntes = Array.isArray(antes) ? antes : [];
      salida[clave] = salida[clave].map((item, i) =>
        conciliar(campo.campos, item, listaAntes[i], clavesDeMedios));
      continue;
    }

    const reservaSuperada = campo.reserva
      && Array.isArray(guardado?.[campo.reserva])
      && guardado[campo.reserva].length;
    if (reservaSuperada && antes !== undefined) salida[clave] = antes;
  }

  return salida;
}

/**
 * Guarda el contenido de un bloque.
 *
 * El cuerpo llega como el objeto ya reconstruido por el panel y pasa SIEMPRE
 * por `sanearDatos`, que es quien decide qué campos existen y qué forma tienen
 * según el registro. Nada que el navegador invente puede colarse: un campo no
 * declarado se descarta, un color mal formado vuelve a su valor por defecto y
 * un texto se recorta a su tope.
 *
 * Es el mismo saneado que usa el renderizador, así que lo que se guarda y lo
 * que se pinta no pueden divergir.
 */
panelRouter.post('/bloques/:id', exigirSesion, exigirCsrf,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Identificador de bloque no válido' });
    }

    const bloque = await bloquesRepo.buscarBloqueCompleto(id);
    if (!bloque) return res.status(404).json({ error: 'No existe ese bloque' });
    if (!BLOQUES[bloque.tipo]) {
      return res.status(409).json({ error: `El bloque es de un tipo que ya no existe: ${bloque.tipo}` });
    }

    const clavesDeMedios = new Set((await mediosRepo.listar()).map((m) => m.clave));
    const entrada = conciliar(
      BLOQUES[bloque.tipo].campos, req.body?.datos, bloque.datos, clavesDeMedios);

    const datos = sanearDatos(bloque.tipo, entrada);
    const variantes = sanearVariantes(bloque.tipo, req.body?.variantes);

    const actualizado = await bloquesRepo.guardarContenido({ id, datos, variantes });

    await auditoria.registrar({
      usuarioId: req.usuario.id,
      accion: 'editar-bloque',
      entidad: 'bloque',
      entidadId: String(id),
      detalle: { tipo: bloque.tipo, rotulo: bloque.rotulo,
                 campos: Object.keys(datos).length },
    });

    res.json({ data: actualizado });
  }));

/**
 * Encender o apagar un bloque.
 *
 * Solo administradores. Sustituir una imagen se ve de un vistazo; apagar un
 * bloque hace desaparecer una franja entera de la página y quien pasa por allí
 * no tiene por qué notar que falta.
 */
panelRouter.post('/bloques/:id/visibilidad', exigirSesion, exigirRol('admin'), exigirCsrf,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Identificador de bloque no válido' });
    }
    if (typeof req.body?.visible !== 'boolean') {
      return res.status(400).json({ error: 'Falta «visible» (verdadero o falso)' });
    }

    const antes = await bloquesRepo.buscarBloque(id);
    if (!antes) return res.status(404).json({ error: 'No existe ese bloque' });

    const actualizado = await bloquesRepo.cambiarVisibilidad({ id, visible: req.body.visible });

    await auditoria.registrar({
      usuarioId: req.usuario.id,
      accion: req.body.visible ? 'mostrar-bloque' : 'ocultar-bloque',
      entidad: 'bloque',
      entidadId: String(id),
      detalle: { tipo: antes.tipo, rotulo: antes.rotulo, antes: antes.visible },
    });

    res.json({ data: actualizado });
  }));

/**
 * Lee el cuerpo `multipart/form-data` sin añadir `multer`.
 *
 * El panel sube un único archivo con un único campo: el formato es tan acotado
 * que una dependencia más (y su superficie de ataque) no se justifica.
 */
function leerMultipart(req) {
  return new Promise((resolver, rechazar) => {
    const tipo = req.get('content-type') ?? '';
    const m = tipo.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!m) return rechazar(new Error('Petición sin límite de multipart'));
    const limite = Buffer.from(`--${m[1] ?? m[2]}`);

    const trozos = [];
    let total = 0;
    let excedido = false;
    // Tope absoluto de drenaje: pasado esto sí se corta, porque un cliente
    // podría enviar sin fin.
    const TOPE_DRENAJE = 20 * 1024 * 1024;

    req.on('data', (t) => {
      total += t.length;

      // Al pasarse NO se corta la conexión: se deja de acumular pero se sigue
      // consumiendo hasta el final. Si se destruye el flujo a media subida, el
      // cliente recibe ECONNRESET y nunca llega a leer el 413, que es
      // justamente el mensaje que necesita para entender qué pasó.
      if (total > LIMITE_BYTES + 4096) {
        excedido = true;
        trozos.length = 0;
      }
      if (total > TOPE_DRENAJE) {
        rechazar(Object.assign(new Error('Envío desmedido'), { status: 413 }));
        req.destroy();
        return;
      }
      if (!excedido) trozos.push(t);
    });

    req.on('error', rechazar);
    req.on('end', () => {
      if (excedido) {
        return rechazar(Object.assign(
          new Error(`La imagen supera el máximo de ${LIMITE_BYTES / 1024} KB.`),
          { status: 413 }));
      }
      const cuerpo = Buffer.concat(trozos);
      const inicio = cuerpo.indexOf(limite);
      if (inicio === -1) return rechazar(new Error('Cuerpo multipart mal formado'));

      const finCabeceras = cuerpo.indexOf('\r\n\r\n', inicio);
      if (finCabeceras === -1) return rechazar(new Error('Cuerpo multipart mal formado'));

      const siguiente = cuerpo.indexOf(limite, finCabeceras);
      const fin = siguiente === -1 ? cuerpo.length : siguiente - 2; // sin el \r\n previo
      resolver(cuerpo.subarray(finCabeceras + 4, fin));
    });
  });
}

panelRouter.post('/imagenes/:clave', exigirSesion, exigirCsrf,
  asyncHandler(async (req, res) => {
    const { clave } = req.params;
    if (!claveValida(clave)) {
      return res.status(400).json({ error: 'Clave de imagen no válida' });
    }
    const existente = await mediosRepo.buscar(clave);
    if (!existente) {
      return res.status(404).json({ error: `No existe el hueco de imagen "${clave}"` });
    }

    const buffer = await leerMultipart(req);
    const guardada = await guardar({ clave, buffer });

    const actualizado = await mediosRepo.actualizarArchivo({
      clave,
      archivo: guardada.archivo,
      ancho: guardada.ancho,
      alto: guardada.alto,
      bytes: guardada.bytes,
      usuarioId: req.usuario.id,
    });

    await auditoria.registrar({
      usuarioId: req.usuario.id,
      accion: 'sustituir-imagen',
      entidad: 'medio',
      entidadId: clave,
      detalle: { antes: existente.archivo, despues: guardada.archivo, bytes: guardada.bytes },
    });

    res.json({ data: { ...actualizado, ancho: guardada.ancho, alto: guardada.alto } });
  }));
