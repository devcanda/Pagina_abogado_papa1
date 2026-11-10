/**
 * Prueba de las imágenes dentro del formulario, por el camino real del
 * navegador: la foto tiene que salir junto al texto de su lámina, cambiarse
 * desde ahí y sobrevivir a un guardado de textos.
 */
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
const comprobar = (n, c, d = '') => { res.push(c); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(52)} ${d}`); };

await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Log.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 950, deviceScaleFactor: 1, mobile: false });

await ir('http://localhost:3000/panel/entrar');
await ver(`(()=>{const f=document.querySelector('form');
  f.querySelector('[name=email]').value=${JSON.stringify(process.env.CORREO)};
  f.querySelector('[name=clave]').value=${JSON.stringify(process.env.CLAVE)};
  f.submit();})()`);
await new Promise((r) => setTimeout(r, 2000));

// La prueba escribe sobre el bloque real, así que se guarda una copia y se
// devuelve al final. Una prueba que deja el contenido alterado no es una
// prueba.
const COPIA = sql('SELECT datos::text FROM bloques WHERE id=1');

console.log('\n== Cada lámina trae su foto ==');
await ver('document.querySelector(\'[data-editor="1"]\').open = true');
await new Promise((r) => setTimeout(r, 400));

/*
 * Cada lámina trae el MISMO juego de campos de imagen, sea cual sea.
 *
 * Exigir un número concreto —eran «seis, dos por lámina»— obliga a tocar la
 * prueba cada vez que el registro gana un campo, y ya pasó dos veces: al
 * añadir el fondo y al añadir el fondo de móvil. Lo que no puede cambiar es
 * que las tres láminas lleven lo mismo.
 *
 * A partir de aquí se busca por NOMBRE y no por posición: con varias imágenes
 * por lámina, un índice solo dice dónde estaba el campo el día que se escribió.
 */
const camposPorLamina = await ver(`(() => {
  const juegos = {};
  for (const c of document.querySelectorAll('[data-editor="1"] .grupo-item [data-elegir-imagen]')) {
    const [, i, campo] = c.name.match(/^laminas\\.(\\d+)\\.(.+)$/) ?? [];
    (juegos[i] ??= []).push(campo);
  }
  return Object.values(juegos).map((c) => c.sort().join(','));
})()`) ?? [];
comprobar('las tres láminas llevan el mismo juego de imágenes',
  camposPorLamina.length === 3 && new Set(camposPorLamina).size === 1,
  camposPorLamina[0] ?? '(ninguno)');

/*
 * Cada figura apunta a UN hueco distinto, sin exigir cuál.
 *
 * Antes se comparaba con la lista literal `hero-abogado,hero-perito,...` y la
 * prueba se cayó el día que se reordenaron las láminas, señalando un fallo que
 * no existía. El orden de las láminas es contenido y cambia; lo que no puede
 * cambiar es que cada una tenga su hueco y que no se pisen.
 */
/*
 * Una lámina puede NO llevar figura recortada: si tiene imagen de fondo, la
 * escena cuenta lo mismo y la figura sobra. Pasó con la lámina laboral. Lo que
 * sí tiene que cumplirse es que dos láminas nunca compartan hueco, porque
 * entonces cambiar una foto cambiaría la de otra sin avisar.
 */
const claves = (await ver('[...document.querySelectorAll(\'[data-editor="1"] [name$=".imagen"]\')].map(s=>s.value)')) ?? [];
const puestas = claves.filter(Boolean);
comprobar('ninguna lámina comparte hueco de figura',
  claves.length === 3 && new Set(puestas).size === puestas.length,
  claves.map((c) => c || '(sin figura)').join(', '));

const rutas = await ver('[...document.querySelectorAll(\'[data-editor="1"] [name$=".imagen"]\')].map(s=>s.closest(".campo-imagen").querySelector("img")).filter(Boolean).map(i=>new URL(i.src).pathname).join(",")');
comprobar('cada figura puesta tiene su archivo',
  String(rutas).split(',').filter(Boolean).length === puestas.length, rutas);

// Van en `loading="lazy"`: una miniatura fuera de pantalla NO se descarga, y
// eso es lo que se quiere con veinte fotos en la pantalla. Así que hay que
// traerlas a la vista antes de comprobar que cargan.
const miniaturas = '[...document.querySelectorAll(\'[data-editor="1"] [name$=".imagen"]\')]'
  + '.map(s=>s.closest(".campo-imagen").querySelector("img")).filter(Boolean)';
let cargadas = false;
for (let i = 0; i < 24 && !cargadas; i++) {
  await ver(`(()=>{const v=${miniaturas};
    v[Math.min(${i}, v.length-1)].scrollIntoView({block:'center'});})()`);
  await new Promise((r) => setTimeout(r, 250));
  cargadas = await ver(`${miniaturas}.every(i=>i.naturalWidth>0)`);
}
comprobar('las tres miniaturas cargan de verdad', cargadas === true,
  await ver(`${miniaturas}.map(i=>i.naturalWidth).join(",")`));

comprobar('el desplegable NO ofrece el hueco de pruebas',
  (await ver('document.body.innerHTML.includes("prueba-tecnica")')) === false);

const ofrecidos = await ver('[...document.querySelector(\'[name="laminas.0.imagen"]\').options].map(o=>o.value).filter(Boolean).join(",")');
// El orden lo pone el catálogo (por descripción); lo que importa es QUÉ hay.
comprobar('solo ofrece huecos de la misma medida',
  String(ofrecidos).split(',').sort().join(',') === 'hero-abogado,hero-laboral,hero-perito',
  ofrecidos);

console.log('\n== Y ya no se repiten arriba ==');
/*
 * Ninguna foto sale a la vez en el formulario y en la rejilla.
 *
 * Antes se exigía que la rejilla de la cabecera estuviera VACÍA, y dejó de ser
 * cierto sin que nada se rompiera: al quitarle la figura recortada a las dos
 * primeras láminas, `hero-abogado` se quedó usado solo por el campo de
 * RESERVA del bloque. El formulario no pinta las reservas superadas, así que
 * el panel lo saca en la rejilla —que es lo correcto: si lo callara, esa
 * imagen sería inalcanzable—.
 *
 * Lo que no puede pasar es que la misma foto aparezca en los dos sitios: ahí
 * es donde quien edita toca el control equivocado.
 */
const enRejilla = await ver(`[...document.querySelectorAll('.bloque[data-bloque="1"] .rejilla [data-clave]')]
  .map((m) => m.dataset.clave)`) ?? [];
const enFormulario = await ver(`[...document.querySelectorAll('[data-editor="1"] [data-elegir-imagen]')]
  .map((s) => s.value).filter(Boolean)`) ?? [];
const repetidas = enRejilla.filter((c) => enFormulario.includes(c));
comprobar('ninguna foto sale en el formulario y en la rejilla a la vez',
  repetidas.length === 0,
  `rejilla: ${enRejilla.join(', ') || '(vacía)'}`);
comprobar('el bloque de áreas trae sus seis fotos en el formulario',
  (await ver('document.querySelectorAll(\'[data-editor="4"] .campo-imagen\').length')) === 6,
  `${await ver('document.querySelectorAll(\'[data-editor="4"] .campo-imagen\').length')} campos`);

console.log('\n== Cambiar de hueco repinta la miniatura ==');
const fotoDe = (i) => `document.querySelector('[name="laminas.${i}.imagen"]')`
  + '.closest(".campo-imagen").querySelector("img")';
const antesSrc = await ver(`${fotoDe(1)}.src`);
/*
 * Se elige CUALQUIER hueco que no sea el que ya tiene.
 *
 * Fijar aquí un `hero-abogado` concreto hacía que la prueba no comprobara nada
 * el día que esa lámina ya lo tuviera puesto: la miniatura no cambiaba y el
 * fallo habría sido del test, no del panel.
 */
const otroHueco = await ver(`(()=>{const s=document.querySelector('[name="laminas.1.imagen"]');
  return [...s.options].map(o=>o.value).filter(v=>v && v!==s.value)[0];})()`);
await ver(`(()=>{const s=document.querySelector('[name="laminas.1.imagen"]');
  s.value=${JSON.stringify(otroHueco)}; s.dispatchEvent(new Event('change'));})()`);
await new Promise((r) => setTimeout(r, 300));
const nuevoSrc = await ver(`${fotoDe(1)}.src`);
comprobar('la miniatura sigue al hueco elegido',
  nuevoSrc !== antesSrc && String(nuevoSrc).includes(otroHueco), otroHueco);

/*
 * A partir de aquí se ESCRIBE sobre el bloque real, así que todo va en un
 * `try` con la devolución en el `finally`.
 *
 * No es precaución de más: esta suite destrozó la portada de verdad. La
 * comprobación de «una clave inventada no se cuela» manda unas láminas con
 * `titulo: x/y/z` y nada más, lo que borra textos, colores y rótulos; la
 * devolución estaba al final, suelta, y bastó con que una ejecución no llegara
 * hasta ahí para dejar el contenido en ese estado.
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
  console.log('\n== Guardar conserva lo que toca ==');
  const marca = `Lámina ${Date.now().toString(36)}`;
// Se devuelve la lámina a su hueco original antes de guardar, para que lo que
// se comprueba sea el guardado del TEXTO sin perder la imagen.
const original = JSON.parse(COPIA).laminas[1].imagen;
await ver(`(()=>{const ed=document.querySelector('[data-editor="1"]');
  const s=ed.querySelector('[name="laminas.1.imagen"]');
  s.value=${JSON.stringify(original)}; s.dispatchEvent(new Event('change'));
  ed.querySelector('[name="laminas.1.titulo"]').value=${JSON.stringify(marca)};})()`);
await ver('document.querySelector(\'[data-editor="1"] [data-guardar]\').click()');
for (let i = 0; i < 40; i++) {
  const e = await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent');
  if (e && e !== 'Guardando...') break;
  await new Promise((r) => setTimeout(r, 250));
}
const estado = await ver('document.querySelector(\'[data-editor="1"] .estado-guardado\').textContent');
comprobar('el panel confirma el guardado', /Guardado/.test(estado), estado);

// Se compara contra la COPIA tomada al empezar, no contra una lista escrita a
// mano: qué foto lleva cada lámina es contenido, y el contenido cambia.
const todas = () => sql("SELECT string_agg(l->>'imagen', ',') FROM bloques, jsonb_array_elements(datos->'laminas') l WHERE id=1");
const esperadas = JSON.parse(COPIA).laminas.map((l) => l.imagen).join(',');
comprobar('las tres láminas conservan su imagen', todas() === esperadas, todas());
comprobar('el texto nuevo sí se guardó',
  sql("SELECT datos->'laminas'->1->>'titulo' FROM bloques WHERE id=1") === marca, marca);
comprobar('la reserva de la cabecera no se ha perdido',
  sql("SELECT datos->>'imagen' FROM bloques WHERE id=1") === JSON.parse(COPIA).imagen);

console.log('\n== Una clave inventada no se cuela ==');
/*
 * Dos claves que el servidor debe descartar —una ruta y el hueco de pruebas—
 * y una TERCERA válida, que es el control: si esa también se descartara, la
 * prueba pasaría por el motivo equivocado.
 *
 * El control es la clave que esa lámina ya tiene. Antes estaba escrita a mano
 * y, al reordenarse las láminas, dejó de coincidir: el guardado la cambiaba
 * con toda la razón y la prueba lo denunciaba como fallo.
 */
const control = JSON.parse(COPIA).laminas[2].imagen;
const r = await ver(`(async()=>{
  const r = await fetch('/panel/bloques/1', {method:'POST',
    headers:{'content-type':'application/json','x-csrf-token':CSRF},
    body: JSON.stringify({datos:{laminas:[
      {titulo:'x',imagen:'../../etc/passwd'},
      {titulo:'y',imagen:'prueba-tecnica'},
      {titulo:'z',imagen:${JSON.stringify(control)}}]},variantes:{}})});
  return r.status;})()`);
comprobar('la petición no revienta', r === 200, `HTTP ${r}`);
comprobar('ni la ruta ni el hueco de pruebas quedan guardados',
  todas() === esperadas, todas());

} finally {
  // Se devuelve por la ruta real del panel, no por SQL: así se comprueba de
  // paso que el guardado acepta íntegro lo que ya había.
  console.log('\n== Se deja como estaba ==');
  const vuelta = await devolver();
  comprobar('el contenido original vuelve', vuelta === 200
    && sql("SELECT datos->'laminas'->1->>'titulo' FROM bloques WHERE id=1")
       === JSON.parse(COPIA).laminas[1].titulo,
    JSON.parse(COPIA).laminas[1].titulo);
}

console.log('\n== Sin errores de consola ==');
comprobar('la consola del panel está limpia', errores.length === 0, errores.slice(0, 2).join(' / '));

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
ws.close();
process.exitCode = fallos ? 1 : 0;
