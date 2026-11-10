/**
 * Pruebas de la publicación.
 *
 * Lo que importa aquí no es que la ruta responda 202, sino que el HTML que
 * acaba en `dist/` contenga el cambio. Se comprueba leyendo el archivo.
 */
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const CORREO = process.env.CORREO;
const CLAVE = process.env.CLAVE;
const DIST = '../frontend/dist/index.html';

if (!CORREO || !CLAVE) { console.error('Faltan CORREO y CLAVE.'); process.exit(2); }

/*
 * `vars` son variables de psql, no texto pegado a la consulta.
 *
 * Antes el titular se metía interpolado (`'"${titulo}"'`). Un titular con un
 * apóstrofo —«El bufete de D'Angelo»— rompía la sentencia, y la regla del
 * proyecto es que el SQL va parametrizado SIEMPRE, también en las pruebas: el
 * día que una de ellas corra sobre contenido de verdad, el apóstrofo llega.
 * `:'nombre'` deja que psql ponga las comillas y escape lo que haga falta.
 */
const sql = (q, vars = {}) => execFileSync('docker', [
  'exec', '-i', 'candamil-db-dev', 'psql', '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A',
  ...Object.entries(vars).flatMap(([k, v]) => ['-v', `${k}=${v}`]),
  // La consulta va por la entrada estándar, no en `-c`: psql NO sustituye
  // variables en `-c`, así que con esa forma `:'titulo'` llegaría tal cual al
  // servidor y daría un error de sintaxis.
  '-f', '-',
], { encoding: 'utf8', input: q }).trim();

let cookies = '';
const g = (r) => { for (const c of r.headers.getSetCookie?.() ?? []) {
  const [par] = c.split(';'); const [n] = par.split('=');
  cookies = [...cookies.split('; ').filter((x) => x && !x.startsWith(n + '=')), par].join('; '); } };
const pedir = async (ruta, o = {}) => {
  const r = await fetch(BASE + ruta, { redirect: 'manual', ...o,
    headers: { cookie: cookies, origin: BASE, ...(o.headers ?? {}) } });
  g(r); return r;
};

const res = [];
const comprobar = (nombre, cond, detalle = '') => {
  res.push(cond);
  console.log(`  ${cond ? 'ok' : '!!'} ${nombre.padEnd(50)} ${detalle}`);
};

const estado = async () => (await (await pedir('/panel/publicar/estado')).json()).data;
const esperarFin = async (max = 120) => {
  for (let i = 0; i < max; i++) {
    const e = await estado();
    if (!e || e.estado !== 'en-marcha') return e;
    await new Promise((r) => setTimeout(r, 1000));
  }
  return null;
};

console.log('\n══ Control de acceso ══');
comprobar('sin sesión no se puede publicar',
  (await pedir('/publicar'.replace(/^/, '/panel'), { method: 'POST' })).status === 401);

console.log('\n══ Acceso ══');
let csrf = ((await (await pedir('/panel/entrar')).text()).match(/[a-f0-9]{48}/) ?? [])[0];
const entrar = await pedir('/panel/entrar', { method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: CORREO, clave: CLAVE }) });
comprobar('entra al panel', entrar.status === 302);
const html = await (await pedir('/panel/bloques')).text();
csrf = (html.match(/const CSRF = "([a-f0-9]{48})"/) ?? [])[1];
comprobar('la pantalla trae el botón de publicar', html.includes('data-publicar-boton'));

console.log('\n══ Sin token CSRF ══');
comprobar('se rechaza', (await pedir('/panel/publicar', { method: 'POST' })).status === 403);

const PONER_TITULO = `UPDATE bloques
     SET datos = jsonb_set(datos, '{laminas,0,titulo}', to_jsonb(:'titulo'::text))
   WHERE tipo = 'cabecera'`;

console.log('\n══ Un cambio llega al HTML ══');
const marca = `Publicación ${Date.now().toString(36)}`;
const antesTitulo = sql(`SELECT datos->'laminas'->0->>'titulo' FROM bloques WHERE tipo='cabecera'`);

/*
 * A partir de aquí la portada está alterada, así que todo va en un `try` con
 * la devolución en el `finally`.
 *
 * No es precaución de más: esta suite se cayó a mitad una vez —el panel
 * respondió una redirección donde se esperaba JSON— y dejó el titular de
 * prueba publicado en el sitio. La suite siguiente tomó su copia de ese estado
 * y falló por algo que no era suyo.
 */
try {
  sql(PONER_TITULO, { titulo: marca });
  comprobar('el cambio está en la base, no en el HTML todavía',
    !(await readFile(DIST, 'utf8')).includes(marca));

  const lanzada = await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': csrf } });
  comprobar('publicar responde en el acto', lanzada.status === 202, `HTTP ${lanzada.status}`);

  const segunda = await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': csrf } });
  comprobar('una segunda pulsación no lanza otra', segunda.status === 409, `HTTP ${segunda.status}`);

  const fin = await esperarFin();
  comprobar('la compilación termina bien', fin?.estado === 'hecha', fin?.estado ?? 'sin respuesta');
  comprobar('el cambio YA está en el HTML servido',
    (await readFile(DIST, 'utf8')).includes(marca), marca);

  console.log('\n══ No quedan directorios a medias ══');
  for (const d of ['../.publicacion/dist-nuevo', '../.publicacion/dist-anterior']) {
    let existe = true;
    try { await access(d); } catch { existe = false; }
    comprobar(`${d} limpio`, !existe);
  }

  console.log('\n══ Un fallo deja el sitio anterior en pie ══');
  sql(`UPDATE bloques SET visible = TRUE WHERE id = 1`);
  const r = await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': csrf } });
  if (r.status === 202) await esperarFin();
  comprobar('tras publicar, el HTML sigue siendo válido',
    (await readFile(DIST, 'utf8')).includes('<!DOCTYPE html>')
    || (await readFile(DIST, 'utf8')).includes('<!doctype html>'));
} finally {
  console.log('\n══ Se deja como estaba ══');
  // Lo primero, y fuera de todo lo que pueda fallar: devolver el contenido.
  sql(PONER_TITULO, { titulo: antesTitulo });
  const final = await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': csrf } });
  if (final.status === 202) await esperarFin();
  comprobar('el titular original vuelve al HTML',
    (await readFile(DIST, 'utf8')).includes(antesTitulo), antesTitulo);
}

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
process.exitCode = fallos ? 1 : 0;
