/**
 * Pruebas de la pantalla de bloques del panel.
 *
 * En Node y no con curl porque `curl -F` falla al leer archivos en Git Bash
 * sobre Windows, y aquí hace falta control exacto sobre el cuerpo.
 */
import { execFileSync } from 'node:child_process';

/* Para comparar lo que enseña el panel con lo que hay de verdad en la base. */
const sql = (q) => execFileSync('docker', ['exec', '-i', 'candamil-db-dev', 'psql',
  '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A', '-c', q], { encoding: 'utf8' }).trim();

/* Cuantos bloques sirve la portada ANTES de que esta suite toque nada. */
const VISIBLES_AL_EMPEZAR = Number(sql('SELECT count(*) FROM bloques WHERE visible'));

const BASE = process.env.BASE ?? 'http://localhost:3000';
const CORREO = process.env.CORREO;
const CLAVE = process.env.CLAVE;

if (!CORREO || !CLAVE) {
  console.error('Faltan CORREO y CLAVE en el entorno.');
  process.exit(2);
}

let cookies = '';
const guardarCookies = (r) => {
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const [par] = c.split(';');
    const [nombre] = par.split('=');
    const resto = cookies.split('; ').filter((x) => x && !x.startsWith(nombre + '='));
    cookies = [...resto, par].join('; ');
  }
};

const pedir = async (ruta, opciones = {}) => {
  const r = await fetch(BASE + ruta, {
    redirect: 'manual',
    ...opciones,
    // Se envía `Origin` como lo haría un navegador real: sin esto, las pruebas
    // no detectarían un fallo de CORS que sí rompe el acceso desde el navegador.
    headers: { cookie: cookies, origin: BASE, ...(opciones.headers ?? {}) },
  });
  guardarCookies(r);
  return r;
};

const resultados = [];
const comprobar = (nombre, cond, detalle = '') => {
  resultados.push({ nombre, bien: Boolean(cond) });
  console.log(`  ${cond ? 'ok' : '!!'} ${nombre.padEnd(48)} ${detalle}`);
};

const visibilidad = async (id, visible, conCsrf = true) => {
  const r = await pedir(`/panel/bloques/${id}/visibilidad`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(conCsrf ? { 'x-csrf-token': csrf } : {}),
    },
    body: JSON.stringify({ visible }),
  });
  return { estado: r.status, datos: await r.json().catch(() => ({})) };
};

const bloquesPublicos = async () => {
  const r = await fetch(`${BASE}/api/paginas/inicio/bloques`);
  const j = await r.json();
  return (j.data ?? j).bloques ?? [];
};

console.log('\n══ Control de acceso ══');
comprobar('sin sesión, /panel/bloques redirige',
  (await pedir('/panel/bloques', { headers: { accept: 'text/html' } })).status === 302);
let csrf = null;
comprobar('sin sesión no se puede apagar un bloque',
  (await visibilidad(1, false, false)).estado === 401);

console.log('\n══ Acceso ══');
csrf = ((await (await pedir('/panel/entrar')).text()).match(/[a-f0-9]{48}/) ?? [])[0];
const entrar = await pedir('/panel/entrar', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: CORREO, clave: CLAVE }),
});
comprobar('entra y va a /panel/bloques',
  entrar.status === 302 && entrar.headers.get('location') === '/panel/bloques',
  entrar.headers.get('location') ?? '');

comprobar('el enlace viejo /panel/imagenes redirige',
  (await pedir('/panel/imagenes', { headers: { accept: 'text/html' } })).status === 302);

const html = await (await pedir('/panel/bloques')).text();
csrf = (html.match(/const CSRF = "([a-f0-9]{48})"/) ?? [])[1];

console.log('\n══ La pantalla se agrupa por bloques ══');
const fichas = [...html.matchAll(/data-bloque="(\d+)"/g)].map((m) => Number(m[1]));
/*
 * Contra la BASE, no contra un número escrito a mano.
 *
 * Aquí ponía `=== 8`. Se añadió el bloque de redes sociales y la prueba se
 * puso roja denunciando un fallo que no existía: la pantalla enseñaba
 * exactamente los bloques que hay, que es lo que tiene que hacer. Una prueba
 * que nombra contenido obliga a tocarla cada vez que cambia la portada, y
 * acaba ignorándose.
 *
 * Los ocultos TAMBIÉN salen, atenuados: si desaparecieran, nadie podría
 * volver a encenderlos.
 */
const cuantosEnLaBase = Number(sql('SELECT count(*) FROM bloques'));
comprobar('sale una ficha por cada bloque de la portada',
  fichas.length === cuantosEnLaBase, `${fichas.length} fichas · ${cuantosEnLaBase} en la base`);

const rotulos = [...html.matchAll(/<h2>([^<]+)<span class="tipo">/g)].map((m) => m[1]);
comprobar('con los rótulos en castellano llano',
  rotulos.includes('Slider principal') && rotulos.includes('Bloque de servicios del índice'),
  rotulos.slice(0, 3).join(' · '));

/*
 * Las fotos del slider tienen que estar DENTRO de la ficha del bloque 1.
 *
 * Cuáles son se pregunta a la base, no se escriben aquí. La lista literal
 * `hero-abogado, hero-perito, hero-laboral` se quedó obsoleta dos veces: al
 * reordenar las láminas y al quitarle la figura a la primera, que pasó a
 * llevar solo imagen de fondo. Lo que importa es el agrupado, no el catálogo.
 */
const trozoSlider = html.slice(html.indexOf('data-bloque="1"'), html.indexOf('data-bloque="2"'));
// `fetch` directo y no `pedir`: ese ayudante manda `Origin` a propósito para
// vigilar el CORS del panel, y la API rechaza ese origen con toda la razón.
const cabecera = (await (await fetch(`${BASE}/api/paginas/inicio/bloques`)).json())
  .data.bloques.find((b) => b.tipo === 'cabecera');
const suyas = [...new Set(
  (cabecera.datos.laminas ?? []).flatMap((l) => [l.imagen, l.imagenFondo]).filter(Boolean),
)];
const fuera = suyas.filter((c) => !trozoSlider.includes(`data-clave="${c}"`));
comprobar('todas las fotos del slider van bajo «Slider principal»',
  suyas.length > 0 && fuera.length === 0,
  `${suyas.length} fotos${fuera.length ? ` · fuera: ${fuera.join(', ')}` : ''}`);

const trozoServicios = html.slice(html.indexOf('data-bloque="4"'), html.indexOf('data-bloque="5"'));
const enServicios = (trozoServicios.match(/data-clave="area-/g) ?? []).length;
comprobar('las 6 áreas van bajo «Bloque de servicios del índice»', enServicios === 6,
  `${enServicios} de 6`);

// La franja de compromiso (3) es solo texto. Antes se reconocía por un aviso
// de «este bloque no lleva imágenes»; ese aviso desapareció cuando las fotos
// pasaron al formulario, porque ya no hay rejilla vacía que explicar. Lo que
// importa sigue siendo lo mismo: que el bloque salga y se pueda editar.
comprobar('un bloque sin imágenes también sale, y se puede editar',
  html.includes('data-bloque="3"') && html.includes('data-editor="3"'));

console.log('\n══ Apagar y encender ══');
/*
 * El bloque sobre el que se prueba el interruptor se ELIGE, no se escribe.
 *
 * Aqui estaba clavado el id 7, que es <<Casos resueltos>>. Dos fallos en uno,
 * y los dos costaron contenido publicado:
 *
 *  - Una prueba NO puede nombrar contenido. Que bloque ocupa el id 7 lo decide
 *    quien edita la portada, no esta suite.
 *  - Daba por hecho que empezaba ENCENDIDO: apagaba y <<devolvia>> encendiendo.
 *    El dia que el cliente apago ese bloque, la prueba lo dejo VISIBLE y la
 *    portada volvio a ensenar una seccion retirada a peticion suya. Lo vio el,
 *    no la suite.
 *
 * Ahora se toma el primero que este encendido y se devuelve su estado REAL en
 * un `finally`, que es la regla de siempre en este proyecto.
 */
const ID_INTERRUPTOR = Number(sql('SELECT id FROM bloques WHERE visible ORDER BY orden, id LIMIT 1'));
const VISIBLE_ANTES = sql(`SELECT visible FROM bloques WHERE id=${ID_INTERRUPTOR}`) === 't';

try {
  const antes = (await bloquesPublicos()).length;
  const apagado = await visibilidad(ID_INTERRUPTOR, false);
  comprobar('se puede apagar un bloque', apagado.estado === 200 && apagado.datos.data?.visible === false,
    apagado.datos.data?.rotulo ?? apagado.datos.error ?? '');

  const despues = (await bloquesPublicos()).length;
  comprobar('la API deja de servirlo', despues === antes - 1, `${antes} -> ${despues} bloques`);

  const htmlApagado = await (await pedir('/panel/bloques')).text();
  comprobar('la ficha sigue en el panel, atenuada',
    new RegExp(`class="bloque apagado" data-bloque="${ID_INTERRUPTOR}"`).test(htmlApagado));

  const encendido = await visibilidad(ID_INTERRUPTOR, true);
  comprobar('se vuelve a encender', encendido.estado === 200 && encendido.datos.data?.visible === true);
  comprobar('la API lo sirve otra vez', (await bloquesPublicos()).length === antes);
} finally {
  /* Se devuelve el estado que TENIA, no el que la prueba supone. */
  await visibilidad(ID_INTERRUPTOR, VISIBLE_ANTES);
  const vuelto = sql(`SELECT visible FROM bloques WHERE id=${ID_INTERRUPTOR}`) === 't';
  comprobar('el interruptor vuelve a como estaba', vuelto === VISIBLE_ANTES,
    `visible: ${VISIBLE_ANTES}`);
}

console.log('\n══ Validación y permisos ══');
comprobar('sin token CSRF se rechaza', (await visibilidad(ID_INTERRUPTOR, false, false)).estado === 403);
comprobar('bloque inexistente da 404', (await visibilidad(999999, false)).estado === 404);
comprobar('id no numérico da 400', (await visibilidad('abc', false)).estado === 400);

const sinCampo = await pedir(`/panel/bloques/${ID_INTERRUPTOR}/visibilidad`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
  body: JSON.stringify({}),
});
comprobar('sin el campo «visible» da 400', sinCampo.status === 400);

const noBooleano = await pedir(`/panel/bloques/${ID_INTERRUPTOR}/visibilidad`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
  body: JSON.stringify({ visible: 'si' }),
});
comprobar('«visible» que no es booleano da 400', noBooleano.status === 400);

console.log('\n══ Estado final ══');
/*
 * Se compara con lo que HABIA, no con un numero escrito a mano.
 *
 * Aqui ponia `=== 8`, y eso es nombrar contenido: cuantas franjas tiene la
 * portada lo decide quien la edita desde el panel. En cuanto el cliente apago
 * una, esta comprobacion se puso roja denunciando un fallo que no existia.
 */
const final = await bloquesPublicos();
comprobar('la portada queda con los bloques que tenia', final.length === VISIBLES_AL_EMPEZAR,
  `${final.length} de ${VISIBLES_AL_EMPEZAR} bloques`);

const fallos = resultados.filter((r) => !r.bien);
console.log(`\n  ${resultados.length - fallos.length}/${resultados.length} comprobaciones correctas`);
process.exitCode = fallos.length ? 1 : 0;
