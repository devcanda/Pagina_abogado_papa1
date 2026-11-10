/**
 * Prueba de la imagen de fondo por lámina.
 *
 * Va por el camino real de punta a punta: elegir el hueco en el formulario,
 * SUBIR una foto desde el navegador —con el redimensionado en canvas que hace
 * el panel—, guardar, publicar y comprobar el HTML servido.
 *
 * La subida se prueba aquí y no en las otras suites porque es el único sitio
 * donde el hueco es de estreno: si el redimensionado o el `multipart` se
 * rompieran, lo demás seguiría pasando y nadie se enteraría.
 */
import { readFile, rm, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const sql = (q, vars = {}) => execFileSync('docker', [
  'exec', '-i', 'candamil-db-dev', 'psql', '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A',
  ...Object.entries(vars).flatMap(([k, v]) => ['-v', `${k}=${v}`]),
  // Por la entrada estándar: psql NO sustituye variables en `-c`.
  '-f', '-',
], { encoding: 'utf8', input: q }).trim();

const lista = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const ws = new WebSocket(lista.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); const ev = new Map(); const errores = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); }
  else {
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errores.push(m.params.entry.text.slice(0, 200));
    if (m.method === 'Runtime.exceptionThrown') errores.push(JSON.stringify(m.params.exceptionDetails.text).slice(0, 200));
    if (m.method && ev.has(m.method)) { ev.get(m.method)(); ev.delete(m.method); }
  }
};
const cdp = (m, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ver = async (e) => (await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.value;
const ir = async (url) => {
  const ok = new Promise((r) => ev.set('Page.loadEventFired', r));
  await cdp('Page.navigate', { url }); await ok; await new Promise((r) => setTimeout(r, 800));
};

const res = [];
const comprobar = (n, c, d = '') => { res.push(c); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(54)} ${d}`); };

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });

await ir('http://localhost:3000/panel/bloques');
if (!(await ver('Boolean(document.querySelector(\'[data-editor="1"]\'))'))) {
  console.error('Sin sesión en el navegador. Entre al panel y repita.');
  process.exit(2);
}

const COPIA = sql('SELECT datos::text FROM bloques WHERE id=1');

/*
 * El hueco `fondo-lamina-2` también se GUARDA, no se da por vacío.
 *
 * Esta prueba sube ahí porque es el único camino que ofrece el formulario: el
 * desplegable solo enseña huecos de la medida del campo y nunca los
 * `prueba-*`. Antes la devolución lo dejaba en su relleno de 1×1, que era
 * correcto mientras el hueco estuvo de estreno. El día que la lámina 2
 * estrenó foto, esta prueba se la borró del disco y de la base, y la portada
 * se publicó sin fondo. Igual que con los textos: se repone lo que había, no
 * lo que había el día que se escribió la prueba.
 */
const FILA_MEDIO = sql("SELECT archivo || '|' || coalesce(ancho::text,'') || '|' "
  + "|| coalesce(alto::text,'') || '|' || coalesce(bytes::text,'') "
  + "FROM medios WHERE clave='fondo-lamina-2'");
const RUTA_MEDIO = `../frontend/public${FILA_MEDIO.split('|')[0]}`;
const RESPALDO = `${process.env.TMPDIR ?? '.'}/respaldo-fondo-lamina-2`;
const HABIA_ARCHIVO = existsSync(RUTA_MEDIO);

// Fuera del `try`: el `finally` los usa para comparar, y una `const` declarada
// dentro del bloque no existe ahí. Ya tumbó una devolución a medias.
const estadoFondos = () => JSON.parse(sql(
  "SELECT COALESCE(jsonb_agg(jsonb_build_object('f', l->>'imagenFondo', 'v', l->>'velo')), '[]')::text"
  + " FROM bloques, jsonb_array_elements(datos->'laminas') l WHERE id=1"));
const antesFondos = JSON.parse(COPIA).laminas.map((l) => ({ f: l.imagenFondo ?? '', v: l.velo ?? 'ninguno' }));
if (HABIA_ARCHIVO) {
  await mkdir(process.env.TMPDIR ?? '.', { recursive: true });
  await copyFile(RUTA_MEDIO, RESPALDO);
}
await ver('document.querySelector(\'[data-editor="1"]\').open = true');
await new Promise((r) => setTimeout(r, 400));

console.log('\n== El campo existe en cada lámina ==');
comprobar('tres campos de imagen de fondo',
  (await ver('document.querySelectorAll(\'[data-editor="1"] [name$=".imagenFondo"]\').length')) === 3);
comprobar('tres selectores de velo',
  (await ver('document.querySelectorAll(\'[data-editor="1"] [name$=".velo"]\').length')) === 3);
/*
 * El velo solo puede valer una de las opciones declaradas, y una lámina SIN
 * fondo tiene que estar en «ninguno»: ahí no hay nada que velar y una capa de
 * color sobre el navy liso solo lo ensuciaría.
 *
 * Antes se exigía que las tres empezaran en «ninguno». Dejó de ser cierto en
 * cuanto una lámina estrenó foto de fondo y necesitó su velo.
 */
const velos = (await ver('[...document.querySelectorAll(\'[data-editor="1"] [name$=".velo"]\')].map(s=>s.value)')) ?? [];
const fondosPuestos = (await ver('[...document.querySelectorAll(\'[data-editor="1"] [name$=".imagenFondo"]\')].map(s=>s.value)')) ?? [];
const VALIDOS = ['ninguno', 'ligero', 'medio', 'fuerte', 'opaco'];
comprobar('el velo solo toma valores del catálogo',
  velos.length === 3 && velos.every((v) => VALIDOS.includes(v)), velos.join(', '));
comprobar('una lámina sin fondo se queda sin velo',
  velos.every((v, i) => fondosPuestos[i] || v === 'ninguno'),
  velos.map((v, i) => `${fondosPuestos[i] || '(sin fondo)'}:${v}`).join(' · '));

const opciones = await ver('[...document.querySelector(\'[name="laminas.0.imagenFondo"]\').options].map(o=>o.value).filter(Boolean).sort().join(",")');
comprobar('solo ofrece los huecos de 1920×1080',
  opciones === 'fondo-lamina-1,fondo-lamina-2,fondo-lamina-3', opciones);
comprobar('y la figura recortada sigue ofreciendo los suyos',
  (await ver('[...document.querySelector(\'[name="laminas.0.imagen"]\').options].map(o=>o.value).filter(Boolean).every(v=>v.startsWith("hero-"))')) === true);

/*
 * A partir de aquí se ESCRIBE: en el bloque real y en un hueco real. La
 * devolución va en el `finally`, como manda la regla del proyecto. Sin él,
 * una caída a mitad deja la portada publicada sin su fondo; ya ocurrió.
 */
try {
console.log('\n== Subir la foto desde el navegador ==');
// Se elige el hueco de la lámina 2 y se sube de verdad: el panel reduce la
// imagen en un canvas y la convierte a WebP antes de enviarla.
await ver(`(()=>{const s=document.querySelector('[name="laminas.1.imagenFondo"]');
  s.value='fondo-lamina-2'; s.dispatchEvent(new Event('change'));})()`);
await new Promise((r) => setTimeout(r, 200));
comprobar('al elegir el hueco se habilita «Sustituir la foto»',
  (await ver('document.querySelector(\'[name="laminas.1.imagenFondo"]\').closest(".campo-imagen").querySelector("input[type=file]").disabled')) === false);

const png = await readFile(process.env.FOTO ?? `${process.env.TMPDIR}/fondo-prueba.png`);
const subida = await ver(`(async()=>{
  const bytes = Uint8Array.from(atob(${JSON.stringify(png.toString('base64'))}), c=>c.charCodeAt(0));
  const archivo = new File([bytes], 'fondo.png', {type:'image/png'});
  const entrada = document.querySelector('[name="laminas.1.imagenFondo"]')
    .closest('.campo-imagen').querySelector('input[type=file]');
  const dt = new DataTransfer();
  dt.items.add(archivo);
  entrada.files = dt.files;
  entrada.dispatchEvent(new Event('change'));
  for (let i = 0; i < 60; i++) {
    const e = entrada.closest('.campo-imagen').querySelector('.estado');
    if (e.textContent && !/Ajustando|Subiendo/.test(e.textContent)) return e.textContent;
    await new Promise(r => setTimeout(r, 500));
  }
  return 'sin respuesta';
})()`);
comprobar('la subida termina bien', /Listo/.test(subida), subida);

const medio = sql("SELECT ancho || 'x' || alto || ' ' || archivo FROM medios WHERE clave='fondo-lamina-2'");
comprobar('el servidor guardó un WebP de 1920×1080',
  medio === '1920x1080 /img/fondo-lamina-2.webp', medio);

console.log('\n== Guardar con velo ==');
await ver(`(()=>{const v=document.querySelector('[name="laminas.1.velo"]'); v.value='medio';})()`);
await ver('document.querySelector(\'[data-editor="1"] [data-guardar]\').click()');
for (let i = 0; i < 40; i++) {
  const e = await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent');
  if (e && e !== 'Guardando...') break;
  await new Promise((r) => setTimeout(r, 250));
}
comprobar('el panel confirma el guardado',
  /Guardado/.test(await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent')),
  await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent'));

/*
 * Se comprueba que la lámina TOCADA quede como se pidió y que las demás no se
 * muevan, sea cual sea su estado de partida.
 *
 * Antes se exigía la cadena exacta «-:ninguno  fondo-lamina-2:medio ...», que
 * daba por hecho que ninguna otra lámina tenía fondo. En cuanto la portada
 * estrenó uno de verdad, la prueba empezó a denunciar un fallo inexistente.
 */
const ahoraFondos = estadoFondos();
comprobar('la lámina tocada queda con su fondo y su velo',
  ahoraFondos[1].f === 'fondo-lamina-2' && ahoraFondos[1].v === 'medio',
  JSON.stringify(ahoraFondos[1]));
comprobar('las otras láminas no se han movido',
  JSON.stringify([ahoraFondos[0], ahoraFondos[2]])
    === JSON.stringify([antesFondos[0], antesFondos[2]]),
  JSON.stringify([ahoraFondos[0], ahoraFondos[2]]));

console.log('\n== Y sale así en la página publicada ==');
await ver('document.querySelector(\'[data-publicar-boton]\').click()');
for (let i = 0; i < 90; i++) {
  if (!(await ver('document.querySelector(\'[data-publicar-boton]\').disabled'))) break;
  await new Promise((r) => setTimeout(r, 1000));
}
await new Promise((r) => setTimeout(r, 500));
const html = await readFile('../frontend/dist/index.html', 'utf8');
// Una capa por cada lámina CON fondo: la que acaba de poner la prueba más las
// que ya lo tuvieran.
const conFondo = ahoraFondos.filter((l) => l.f).length;
comprobar('hay una capa de fondo por lámina que lo tiene',
  (html.match(/class="cabecera-fondo"/g) ?? []).length === conFondo,
  `${(html.match(/class="cabecera-fondo"/g) ?? []).length} capas para ${conFondo} láminas con fondo`);
comprobar('con la foto subida', html.includes('/img/fondo-lamina-2.webp'));
comprobar('y con el velo al 0.5', /opacity:\s*0\.5/.test(html));
comprobar('la lámina 2 no es la primera, así que el fondo va en lazy+low',
  /fondo-lamina-2\.webp[^>]*/.test(html)
  && /loading="lazy"[^>]*fondo-lamina-2|fondo-lamina-2[^>]*loading="lazy"/.test(html.replace(/\n/g, ' ')));
/*
 * La prioridad alta es de UNA sola imagen de la primera lámina: su fondo si lo
 * tiene, y si no, su figura. Lo que no puede haber nunca son dos compitiendo.
 *
 * Antes esto nombraba a `hero-abogado`, que era la figura de la primera lámina
 * el día que se escribió. Cuando se reordenó el carrusel dejó de serlo.
 */
const inicio = html.indexOf('cabecera-lamina');
const primera = html.slice(inicio, html.indexOf('cabecera-lamina', inicio + 1));
comprobar('en la primera lámina solo una imagen lleva prioridad alta',
  (primera.match(/fetchpriority="high"/g) ?? []).length === 1,
  `${(primera.match(/fetchpriority="high"/g) ?? []).length} con prioridad alta`);

console.log('\n== El sitio no se desborda a lo ancho ==');
await ir('http://localhost:4340/');
comprobar('sin barra horizontal a 1280',
  (await ver('document.documentElement.scrollWidth <= document.documentElement.clientWidth')) === true,
  `${await ver('document.documentElement.scrollWidth')} vs ${await ver('document.documentElement.clientWidth')}`);
await cdp('Emulation.setDeviceMetricsOverride', { width: 360, height: 760, deviceScaleFactor: 1, mobile: true });
await ir('http://localhost:4340/');
comprobar('sin barra horizontal a 360',
  (await ver('document.documentElement.scrollWidth <= document.documentElement.clientWidth')) === true,
  `${await ver('document.documentElement.scrollWidth')} vs ${await ver('document.documentElement.clientWidth')}`);
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });

/*
 * La capa de fondo llega HASTA ABAJO, cubriendo la fila de flechas y puntos.
 *
 * La capa se ancla a la lámina —que lleva `transform` para el relevo, y un
 * `transform` crea bloque contenedor aunque no haya `position`—, así que por
 * su cuenta termina donde acaba el texto y deja los 4rem de los mandos con el
 * color liso de la sección asomando: una franja de otro color bajo el
 * carrusel. Se arregla estirándola exactamente el alto de los mandos.
 *
 * Se comprueba en VARIOS anchos porque el fallo no dependía del ancho y aun
 * así pasó inadvertido durante días: en las capturas de trabajo el recorte
 * caía justo donde no se notaba.
 */
console.log('\n== El fondo llega hasta debajo de los mandos ==');
for (const ancho of [390, 768, 1280, 1920]) {
  await cdp('Emulation.setDeviceMetricsOverride', { width: ancho, height: 1000, deviceScaleFactor: 1, mobile: ancho < 500 });
  await ir('http://localhost:4340/');
  const caja = JSON.parse(await ver(`JSON.stringify((()=>{
    const f=(s)=>{const e=document.querySelector(s); if(!e) return null;
      const r=e.getBoundingClientRect(); return [Math.round(r.top),Math.round(r.bottom)];};
    return {sec:f('.cabecera'), fondo:f('.cabecera-fondo'), mandos:f('.cabecera-mandos')};
  })())`));
  const { sec, fondo, mandos } = caja;
  comprobar(`a ${ancho}px el fondo llega al final de la franja`,
    Boolean(sec && fondo) && Math.abs(fondo[1] - sec[1]) <= 1,
    `sección ${sec?.join('-')} · fondo ${fondo?.join('-')}`);
  // Y los mandos siguen por encima: la capa es posicionada y, sin su propio
  // `z-index`, se pintaría sobre ellos.
  comprobar(`a ${ancho}px los mandos quedan dentro del fondo`,
    Boolean(mandos && fondo) && mandos[1] <= fondo[1] + 1 && mandos[0] >= fondo[0],
    `mandos ${mandos?.join('-')}`);
}
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });

} finally {
console.log('\n== Se deja como estaba ==');
await ir('http://localhost:3000/panel/bloques');
/*
 * La copia se devuelve con `imagenFondo` y `velo` EXPLÍCITOS, que es como los
 * manda el formulario.
 *
 * No es un apaño del test: el servidor conserva una imagen que no viene en la
 * petición, y eso es deliberado —hay campos de imagen que el formulario no
 * pinta—. Una copia tomada antes de que el campo existiera no los trae, así
 * que mandarla tal cual dejaría el fondo puesto. El panel real siempre los
 * envía, aunque sea vacíos, porque el desplegable está ahí.
 */
const original = JSON.parse(COPIA);
original.laminas = (original.laminas ?? []).map((l) => ({
  imagenFondo: '', velo: 'ninguno', ...l,
}));
const vuelta = await ver(`(async()=>{
  const r = await fetch('/panel/bloques/1', {method:'POST',
    headers:{'content-type':'application/json','x-csrf-token':CSRF},
    body: JSON.stringify({datos: ${JSON.stringify(original)}, variantes:{}})});
  return r.status;})()`);
// Contra la COPIA, no contra «ninguna lámina tiene fondo»: esa condición solo
// era cierta el día en que ninguna lo tenía.
comprobar('el contenido original vuelve', vuelta === 200
  && JSON.stringify(estadoFondos()) === JSON.stringify(antesFondos),
  JSON.stringify(estadoFondos()));

/*
 * Y el hueco vuelve a lo que TENÍA, que no es lo mismo que vaciarlo.
 *
 * La subida se hace sobre `fondo-lamina-2`, un hueco real, porque es el único
 * camino que ofrece el formulario. Lo que la prueba repone es la foto que
 * encontró al empezar: el archivo desde su copia y la fila de `medios` con sus
 * medidas. Si el hueco estaba de estreno, vuelve a su relleno de 1×1.
 */
const [archivoAntes, anchoAntes, altoAntes, bytesAntes] = FILA_MEDIO.split('|');
// Fuera lo que subió la prueba, si no es el mismo archivo que había.
if ('../frontend/public/img/fondo-lamina-2.webp' !== RUTA_MEDIO) {
  await rm('../frontend/public/img/fondo-lamina-2.webp', { force: true });
}
if (HABIA_ARCHIVO) await copyFile(RESPALDO, RUTA_MEDIO);
// Parametrizado, como todo el SQL del proyecto: `NULLIF` devuelve el nulo
// cuando el hueco no tenía medidas, sin interpolar un `NULL` a mano.
sql(`UPDATE medios SET archivo=:'archivo',
       ancho=NULLIF(:'ancho','')::int, alto=NULLIF(:'alto','')::int,
       bytes=NULLIF(:'bytes','')::bigint WHERE clave='fondo-lamina-2'`,
{ archivo: archivoAntes, ancho: anchoAntes, alto: altoAntes, bytes: bytesAntes });
comprobar('el hueco vuelve a la foto que tenía',
  sql("SELECT archivo || '|' || coalesce(ancho::text,'') || '|' "
    + "|| coalesce(alto::text,'') || '|' || coalesce(bytes::text,'') "
    + "FROM medios WHERE clave='fondo-lamina-2'") === FILA_MEDIO
  && existsSync(RUTA_MEDIO) === HABIA_ARCHIVO, FILA_MEDIO);

}

console.log('\n== Sin errores de consola ==');
comprobar('la consola del panel está limpia', errores.length === 0, errores.slice(0, 2).join(' / '));

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
ws.close();
process.exitCode = fallos ? 1 : 0;
