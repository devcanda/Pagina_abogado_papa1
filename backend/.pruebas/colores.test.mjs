/**
 * Prueba de los colores por lámina y del fondo de la franja.
 *
 * Lo que se comprueba no es que el formulario tenga controles, sino que dos
 * láminas puedan acabar con colores distintos en el HTML servido, y que el
 * contraste se mida contra el fondo elegido y no contra el navy congelado.
 */
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const sql = (q) => execFileSync('docker', ['exec', '-i', 'candamil-db-dev', 'psql',
  '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A', '-c', q], { encoding: 'utf8' }).trim();

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
  await cdp('Page.navigate', { url }); await ok; await new Promise((r) => setTimeout(r, 700));
};

const res = [];
const comprobar = (n, c, d = '') => { res.push(c); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(54)} ${d}`); };

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });

await ir('http://localhost:3000/panel/entrar');
await ver(`(()=>{const f=document.querySelector('form');
  if(!f) return;
  f.querySelector('[name=email]').value=${JSON.stringify(process.env.CORREO)};
  f.querySelector('[name=clave]').value=${JSON.stringify(process.env.CLAVE)};
  f.submit();})()`);
await new Promise((r) => setTimeout(r, 2000));
if (!(await ver('Boolean(document.querySelector(\'[data-editor="1"]\'))'))) {
  await ir('http://localhost:3000/panel/bloques');
}

// Se escribe sobre el bloque real: copia antes, vuelta al final.
const COPIA = sql('SELECT datos::text FROM bloques WHERE id=1');

await ver('document.querySelector(\'[data-editor="1"]\').open = true');
await new Promise((r) => setTimeout(r, 400));

console.log('\n== Cada lámina tiene SUS colores ==');
/*
 * Lo que se comprueba es que CADA lámina lleve su propio juego completo, no un
 * número concreto de campos.
 *
 * Antes esta prueba exigía «seis, dos por lámina» y el nombre exacto de cada
 * ruta. Se rompió el día que el registro ganó un color más, avisando de un
 * fallo que no existía. Una prueba atada al catálogo de campos obliga a
 * tocarla cada vez que se añade uno, y acaba ignorándose.
 */
const laminas = await ver('document.querySelectorAll(\'[data-editor="1"] .grupo-item\').length');
const rutas = await ver('[...document.querySelectorAll(\'[data-editor="1"] .grupo-item [data-color]\')].map(c=>c.name)');
const porLamina = {};
for (const r of rutas ?? []) {
  const [, i, campo] = r.match(/^laminas\.(\d+)\.(.+)$/) ?? [];
  (porLamina[i] ??= []).push(campo);
}
const juegos = Object.values(porLamina).map((c) => c.sort().join(','));
comprobar('cada lámina lleva su propio juego de colores',
  juegos.length === laminas && laminas > 0 && new Set(juegos).size === 1,
  `${laminas} láminas · campos: ${juegos[0] ?? '(ninguno)'}`);
comprobar('entre ellos, el del titular y el del texto',
  (juegos[0] ?? '').includes('colorTitulo') && (juegos[0] ?? '').includes('colorTexto'));

comprobar('los colores sueltos del bloque ya no se pintan',
  (await ver('Boolean(document.querySelector(\'[data-editor="1"] > .cuerpo-editor > .campo-color [name="colorTitulo"]\'))')) === false);

console.log('\n== El fondo de la franja se elige ==');
comprobar('hay fondo y cuña',
  (await ver('Boolean(document.querySelector(\'[data-editor="1"] [name="colorFondo"]\'))'))
  && (await ver('Boolean(document.querySelector(\'[data-editor="1"] [name="colorCuna"]\'))')));
comprobar('el fondo NO enseña contraste contra sí mismo',
  (await ver('Boolean(document.querySelector(\'[data-editor="1"] [name="colorFondo"]\').closest(".campo-color").querySelector("[data-contraste]"))')) === false);

console.log('\n== El contraste se mide contra el fondo ELEGIDO ==');
const antes = await ver('document.querySelector(\'[name="laminas.0.colorTitulo"]\').closest(".campo-color").querySelector("[data-contraste]").textContent');
// Blanco sobre navy es legible; sobre blanco, no. Si el número no cambia, es
// que se sigue midiendo contra el tono congelado del registro.
await ver(`(()=>{const f=document.querySelector('[name="colorFondo"]');
  f.value='#ffffff'; f.dispatchEvent(new Event('input'));})()`);
await new Promise((r) => setTimeout(r, 250));
const despues = await ver('document.querySelector(\'[name="laminas.0.colorTitulo"]\').closest(".campo-color").querySelector("[data-contraste]").textContent');
comprobar('cambiar el fondo vuelve a medir las láminas',
  antes !== despues && /ILEGIBLE/.test(despues), `${antes} → ${despues}`);

await ver(`(()=>{const f=document.querySelector('[name="colorFondo"]');
  f.value='#0a2443'; f.dispatchEvent(new Event('input'));})()`);
await new Promise((r) => setTimeout(r, 250));
comprobar('y al volver al navy, vuelve a ser legible',
  /legible/.test(await ver('document.querySelector(\'[name="laminas.0.colorTitulo"]\').closest(".campo-color").querySelector("[data-contraste]").textContent')));

/*
 * A partir de aquí se ESCRIBE sobre el bloque real: `try` con la devolución
 * en el `finally`, como manda la regla del proyecto. Una suite hermana se
 * saltó esto y dejó la portada con los textos borrados.
 */
let devuelto = false;
const devolver = async () => {
  if (devuelto) return 200;
  devuelto = true;
  return ver(`(async()=>{
    const r = await fetch('/panel/bloques/1', {method:'POST',
      headers:{'content-type':'application/json','x-csrf-token':CSRF},
      body: JSON.stringify({datos: ${COPIA}, variantes:{}})});
    return r.status;})()`);
};

try {
  console.log('\n== Dos láminas con colores distintos ==');
  await ver(`(()=>{
  const t = document.querySelector('[name="laminas.1.colorTitulo"]');
  t.value = '#d98a8c'; t.dispatchEvent(new Event('input'));
  const f = document.querySelector('[name="colorCuna"]');
  f.value = '#134782'; f.dispatchEvent(new Event('input'));
})()`);
await ver('document.querySelector(\'[data-editor="1"] [data-guardar]\').click()');
for (let i = 0; i < 40; i++) {
  const e = await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent');
  if (e && e !== 'Guardando...') break;
  await new Promise((r) => setTimeout(r, 250));
}
comprobar('el panel confirma el guardado',
  /Guardado/.test(await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent')),
  await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent'));

const guardados = sql("SELECT string_agg(l->>'colorTitulo', ',') FROM bloques, jsonb_array_elements(datos->'laminas') l WHERE id=1");
comprobar('en la base, la lámina 2 tiene otro color',
  guardados === '#ffffff,#d98a8c,#ffffff', guardados);

console.log('\n== Y llega distinto a la página publicada ==');
await ver('document.querySelector(\'[data-publicar-boton]\').click()');
for (let i = 0; i < 90; i++) {
  if (!(await ver('document.querySelector(\'[data-publicar-boton]\').disabled'))) break;
  await new Promise((r) => setTimeout(r, 1000));
}
await new Promise((r) => setTimeout(r, 500));
const html = await readFile('../frontend/dist/index.html', 'utf8');
const h1 = [...html.matchAll(/<h1[^>]*style="([^"]*)"/g)].map((m) => m[1]);
comprobar('los tres h1 llevan su propio color', h1.length === 3, h1.join(' | '));
comprobar('y el de la lámina 2 es el distinto',
  h1.filter((x) => /d98a8c/.test(x)).length === 1, h1.filter((x) => /d98a8c/.test(x)).join());
comprobar('el fondo de la franja sale en el HTML',
  /<section[^>]*cabecera[^>]*background-color:\s*#0a2443/i.test(html)
  || /background-color:\s*#0a2443/.test(html.slice(0, html.indexOf('</section>'))));

} finally {
  console.log('\n== Se deja como estaba ==');
  const vuelta = await devolver();
  // Se compara contra la COPIA, no contra un valor escrito a mano: así la
  // prueba no da por hecho de qué color estaba la portada el día que se
  // escribió.
  comprobar('el contenido original vuelve', vuelta === 200
    && sql("SELECT string_agg(l->>'colorTitulo', ',') FROM bloques, jsonb_array_elements(datos->'laminas') l WHERE id=1")
       === JSON.parse(COPIA).laminas.map((l) => l.colorTitulo).join(','),
    JSON.parse(COPIA).laminas.map((l) => l.colorTitulo).join(','));
}

console.log('\n== Sin errores de consola ==');
comprobar('la consola del panel está limpia', errores.length === 0, errores.slice(0, 2).join(' / '));

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
ws.close();
process.exitCode = fallos ? 1 : 0;
