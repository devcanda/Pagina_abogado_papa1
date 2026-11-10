/**
 * Pruebas de la pantalla de bloques del panel.
 *
 * En Node y no con curl porque `curl -F` falla al leer archivos en Git Bash
 * sobre Windows, y aquí hace falta control exacto sobre el cuerpo.
 */
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
comprobar('salen los 8 bloques de la portada', fichas.length === 8, `${fichas.length} fichas`);

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
const antes = (await bloquesPublicos()).length;
const apagado = await visibilidad(7, false);
comprobar('se puede apagar un bloque', apagado.estado === 200 && apagado.datos.data?.visible === false,
  apagado.datos.data?.rotulo ?? apagado.datos.error ?? '');

const despues = (await bloquesPublicos()).length;
comprobar('la API deja de servirlo', despues === antes - 1, `${antes} -> ${despues} bloques`);

const htmlApagado = await (await pedir('/panel/bloques')).text();
comprobar('la ficha sigue en el panel, atenuada',
  /class="bloque apagado" data-bloque="7"/.test(htmlApagado));

const encendido = await visibilidad(7, true);
comprobar('se vuelve a encender', encendido.estado === 200 && encendido.datos.data?.visible === true);
comprobar('la API lo sirve otra vez', (await bloquesPublicos()).length === antes);

console.log('\n══ Validación y permisos ══');
comprobar('sin token CSRF se rechaza', (await visibilidad(7, false, false)).estado === 403);
comprobar('bloque inexistente da 404', (await visibilidad(999999, false)).estado === 404);
comprobar('id no numérico da 400', (await visibilidad('abc', false)).estado === 400);

const sinCampo = await pedir('/panel/bloques/7/visibilidad', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
  body: JSON.stringify({}),
});
comprobar('sin el campo «visible» da 400', sinCampo.status === 400);

const noBooleano = await pedir('/panel/bloques/7/visibilidad', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': csrf },
  body: JSON.stringify({ visible: 'si' }),
});
comprobar('«visible» que no es booleano da 400', noBooleano.status === 400);

console.log('\n══ Estado final ══');
const final = await bloquesPublicos();
comprobar('la portada queda con sus 8 bloques', final.length === 8, `${final.length} bloques`);

const fallos = resultados.filter((r) => !r.bien);
console.log(`\n  ${resultados.length - fallos.length}/${resultados.length} comprobaciones correctas`);
process.exitCode = fallos.length ? 1 : 0;
