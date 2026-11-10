/**
 * Prueba del editor de textos y colores, por el camino real: formulario del
 * navegador -> guardar -> publicar -> HTML servido.
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
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      errores.push(m.params.entry.text.slice(0, 160));
    }
    if (m.method === 'Runtime.exceptionThrown') {
      errores.push(JSON.stringify(m.params.exceptionDetails.text).slice(0, 160));
    }
    if (m.method && ev.has(m.method)) { ev.get(m.method)(); ev.delete(m.method); }
  }
};
const cdp = (m, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const ver = async (e) => (await cdp('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true })).result?.value;
const ir = async (url) => { const ok = new Promise((r) => ev.set('Page.loadEventFired', r));
  await cdp('Page.navigate', { url }); await ok; await new Promise((r) => setTimeout(r, 600)); };

const res = [];
const comprobar = (n, c, d = '') => { res.push(c); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(48)} ${d}`); };

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });

await ir('http://localhost:3000/panel/entrar');
await ver(`(()=>{const f=document.querySelector('form');
  f.querySelector('[name=email]').value=${JSON.stringify(process.env.CORREO)};
  f.querySelector('[name=clave]').value=${JSON.stringify(process.env.CLAVE)};
  f.submit();})()`);
await new Promise((r) => setTimeout(r, 1800));

console.log('\n== La pantalla trae los formularios ==');
comprobar('un editor por bloque', (await ver(`document.querySelectorAll('[data-editor]').length`)) === 8);
comprobar('campos de texto generados',
  (await ver(`document.querySelectorAll('.campo input[type=text], .campo textarea').length`)) > 40,
  (await ver(`document.querySelectorAll('.campo input[type=text], .campo textarea').length`)) + ' controles');
comprobar('selectores de color', (await ver(`document.querySelectorAll('[data-color]').length`)) >= 16,
  (await ver(`document.querySelectorAll('[data-color]').length`)) + ' colores');
comprobar('las 3 láminas del slider salen anidadas',
  (await ver(`document.querySelectorAll('[data-editor="1"] .grupo-item').length`)) === 3);
// Las imágenes SÍ salen, desde que cada foto vive junto al texto al que
// acompaña. Lo que no puede haber es un campo de texto suelto con la clave: se
// elige de un desplegable con el catálogo, nunca a mano.
comprobar('cada imagen se elige de un desplegable',
  (await ver(`document.querySelectorAll('[data-editor] input[type=text][name$="imagen"]').length`)) === 0
  && (await ver(`document.querySelectorAll('[data-editor] select[data-elegir-imagen]').length`)) > 0,
  (await ver(`document.querySelectorAll('[data-editor] select[data-elegir-imagen]').length`)) + ' desplegables');

console.log('\n== El contraste se mide y se enseña ==');
const marcas = await ver(`[...document.querySelectorAll('[data-editor="1"] [data-contraste]')].map(m=>m.textContent).join(' | ')`);
comprobar('la cabecera muestra su contraste', /:1/.test(marcas), marcas);

// Un color ilegible tiene que marcarse como tal, sin impedir nada.
await ver(`(()=>{const c=document.querySelector('[data-editor="1"] [data-color]');
  c.value='#0a2443'; c.dispatchEvent(new Event('input'));})()`);
await new Promise((r) => setTimeout(r, 200));
const aviso = await ver(`document.querySelector('[data-editor="1"] [data-contraste]').textContent`);
comprobar('un color ilegible se marca ILEGIBLE', /ILEGIBLE/.test(aviso), aviso);
comprobar('pero NO se impide nada',
  (await ver(`document.querySelector('[data-editor="1"] [data-guardar]').disabled`)) === false);

console.log('\n== Editar y guardar ==');
/*
 * Copia del bloque antes de tocarlo.
 *
 * Esta suite escribía sobre el contenido real y NO lo devolvía, así que dejaba
 * el titular y el color de la portada cambiados. La siguiente suite tomaba su
 * propia copia de ese estado sucio y fallaba por algo que no era suyo: una
 * prueba que ensucia convierte a las demás en mentirosas.
 */
const COPIA = sql('SELECT datos::text FROM bloques WHERE id=1');
const marca = 'Texto ' + Date.now().toString(36);
await ver(`(()=>{
  const ed = document.querySelector('[data-editor="1"]');
  ed.open = true;
  ed.querySelector('[name="laminas.0.titulo"]').value = ${JSON.stringify(marca)};
  // El color del titular vive AHORA dentro de cada lámina: el suelto del bloque
  // pasó a ser reserva y el panel no lo pinta mientras haya láminas.
  const c = ed.querySelector('[name="laminas.0.colorTitulo"]');
  c.value = '#d98a8c'; c.dispatchEvent(new Event('input'));
})()`);
await ver(`document.querySelector('[data-editor="1"] [data-guardar]').click()`);
for (let i = 0; i < 40; i++) {
  const e = await ver(`document.querySelector('[data-editor="1"] .estado-guardado').textContent`);
  if (e && e !== 'Guardando...') break;
  await new Promise((r) => setTimeout(r, 250));
}
const estadoGuardado = await ver(`document.querySelector('[data-editor="1"] .estado-guardado').textContent`);
comprobar('el panel confirma el guardado', /Guardado/.test(estadoGuardado), estadoGuardado);

const enBase = sql(`SELECT datos->'laminas'->0->>'titulo' FROM bloques WHERE id=1`);
comprobar('el texto está en la base', enBase === marca, enBase);
const colorEnBase = sql(`SELECT datos->'laminas'->0->>'colorTitulo' FROM bloques WHERE id=1`);
comprobar('el color está en la base', colorEnBase === '#d98a8c', colorEnBase);

console.log('\n== Y llega a la pagina publicada ==');
await ver(`document.querySelector('[data-publicar-boton]').click()`);
for (let i = 0; i < 90; i++) {
  if (!(await ver(`document.querySelector('[data-publicar-boton]').disabled`))) break;
  await new Promise((r) => setTimeout(r, 1000));
}
await new Promise((r) => setTimeout(r, 500));
const html = await readFile('../frontend/dist/index.html', 'utf8');
comprobar('el texto nuevo esta en el HTML', html.includes(marca), marca);
comprobar('el color nuevo esta en el HTML', html.includes('#d98a8c'));

console.log('\n== Se deja como estaba ==');
const vuelta = await ver(`(async()=>{
  const r = await fetch('/panel/bloques/1', {method:'POST',
    headers:{'content-type':'application/json','x-csrf-token':CSRF},
    body: JSON.stringify({datos: ${COPIA}, variantes:{}})});
  return r.status;})()`);
comprobar('el contenido original vuelve', vuelta === 200
  && sql(`SELECT datos->'laminas'->0->>'titulo' FROM bloques WHERE id=1`)
     === JSON.parse(COPIA).laminas[0].titulo,
  JSON.parse(COPIA).laminas[0].titulo);

// Y se vuelve a publicar: si no, el sitio se queda enseñando el texto de la
// prueba hasta la siguiente publicación de alguien.
await ver(`document.querySelector('[data-publicar-boton]').click()`);
for (let i = 0; i < 90; i++) {
  if (!(await ver(`document.querySelector('[data-publicar-boton]').disabled`))) break;
  await new Promise((r) => setTimeout(r, 1000));
}
await new Promise((r) => setTimeout(r, 500));
comprobar('y el HTML servido ya no tiene la marca',
  !(await readFile('../frontend/dist/index.html', 'utf8')).includes(marca));

console.log('\n== Sin errores de consola ==');
comprobar('la consola del panel esta limpia', errores.length === 0, errores.slice(0, 2).join(' / '));

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
ws.close();
process.exitCode = fallos ? 1 : 0;
