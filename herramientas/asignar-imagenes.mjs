/**
 * Asigna imágenes reales a los huecos del sitio.
 *
 *   node herramientas/asignar-imagenes.mjs
 *
 * Toma las fotografías rescatadas del WordPress, las ajusta al tamaño exacto
 * que pide cada hueco y las sube **por el panel**, con sesión y token CSRF
 * como lo haría una persona. Así el camino completo queda ejercitado, no solo
 * el resultado.
 *
 * El ajuste se hace en el navegador con `canvas`, igual que en el panel: no
 * hace falta ninguna librería de imagen en el servidor.
 *
 * Requiere Chrome con `--remote-debugging-port=9222` y la API en marcha.
 *
 * Para VOLVER a los marcadores:
 *   node herramientas/asignar-imagenes.mjs --revertir
 * Devuelve cada hueco a su `.svg` y borra los `.webp` generados.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';

const API = 'http://localhost:3000';
const PUERTO = 4350;
const ORIGEN = 'docs/contenido-wordpress/imagenes';

/**
 * Qué foto va en qué hueco.
 *
 * El criterio es la proporción: una foto apaisada en un hueco vertical se
 * recorta tanto que deja de verse lo que importa.
 */
const ASIGNACIONES = [
  { clave: 'hero-abogado',         archivo: 'profile1_1.jpg',   alt: 'Diego Antonio Candamil, abogado titular' },
  { clave: 'sobre-nosotros',       archivo: 'Fondo-2_2.jpg',    alt: 'Despacho de Candamil Asociados' },
  { clave: 'area-laboral',         archivo: 'Laboral1.png',     alt: 'Derecho laboral' },
  { clave: 'area-civil',           archivo: 'civil-1.png',      alt: 'Derecho civil' },
  { clave: 'area-familia',         archivo: 'familia1.png',     alt: 'Derecho de familia' },
  { clave: 'area-penal',           archivo: 'penal-1.png',      alt: 'Derecho penal' },
  { clave: 'area-inmobiliario',    archivo: 'urbano-1.png',     alt: 'Derecho inmobiliario' },
  { clave: 'area-administrativo',  archivo: 'derecho_peticion.png', alt: 'Derecho administrativo' },
  { clave: 'caso-1',               archivo: 'labo1-e1744233550201.jpg', alt: 'Caso laboral' },
  { clave: 'caso-2',               archivo: 'TULUA-PAGINA.jpg', alt: 'Caso civil' },
  { clave: 'caso-3',               archivo: 'h4_2.jpg',         alt: 'Caso de familia' },
];

const TIPOS = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.html': 'text/html' };

// ─── Vuelta a los marcadores ───────────────────────────────────────────────
if (process.argv.includes('--revertir')) {
  const { unlink } = await import('node:fs/promises');
  const { query, cerrarPool } = await import('../backend/src/config/db.js');
  for (const a of ASIGNACIONES) {
    await query(
      `UPDATE medios SET archivo = '/img/' || $1 || '.svg', alt = '',
              ancho = NULL, alto = NULL, bytes = NULL, usuario_id = NULL,
              actualizado_en = NOW()
        WHERE clave = $1`, [a.clave]);
    await unlink(`frontend/public/img/${a.clave}.webp`).catch(() => {});
    console.log(`  revertido  ${a.clave}`);
  }
  await cerrarPool();
  console.log('
  Recompile el frontend para verlo.');
  process.exit(0);
}

// ─── Servidor local ────────────────────────────────────────────────────────
// Las imágenes y la página conversora tienen que compartir origen: un canvas
// que dibuja una imagen de otro origen queda "contaminado" y `toBlob` falla.
const PAGINA = `<!doctype html><meta charset="utf-8"><title>conversor</title>
<script>
window.convertir = (archivo, ancho, alto) => new Promise((ok, mal) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = ancho; c.height = alto;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    // Recorte tipo "cover": se llena el hueco y sobra por el lado largo.
    const e = Math.max(ancho / img.width, alto / img.height);
    const w = img.width * e, h = img.height * e;
    ctx.drawImage(img, (ancho - w) / 2, (alto - h) / 2, w, h);
    const intentar = (q) => c.toBlob((b) => {
      if (!b) return mal(new Error('toBlob vacío'));
      if (b.size <= 2 * 1024 * 1024 || q <= 0.5) {
        const lector = new FileReader();
        lector.onload = () => ok(lector.result.split(',')[1]);
        lector.readAsDataURL(b);
      } else intentar(q - 0.1);
    }, 'image/webp', q);
    intentar(0.9);
  };
  img.onerror = () => mal(new Error('no se pudo cargar ' + archivo));
  img.src = '/' + archivo;
});
</script>`;

const servidor = createServer(async (req, res) => {
  const ruta = decodeURIComponent(req.url.split('?')[0]);
  if (ruta === '/' || ruta === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(PAGINA);
  }
  try {
    const datos = await readFile(join(ORIGEN, basename(ruta)));
    res.writeHead(200, { 'content-type': TIPOS[extname(ruta).toLowerCase()] ?? 'application/octet-stream' });
    res.end(datos);
  } catch {
    res.writeHead(404).end('no está');
  }
});
await new Promise((r) => servidor.listen(PUERTO, r));

// ─── Chrome ────────────────────────────────────────────────────────────────
const lista = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const destino = lista.find((t) => t.type === 'page');
if (!destino) {
  console.error('No hay pestaña de Chrome. Arránquelo con --remote-debugging-port=9222');
  process.exit(2);
}
const ws = new WebSocket(destino.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let idCdp = 0;
const pendientes = new Map();
const eventos = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); }
  else if (m.method && eventos.has(m.method)) { eventos.get(m.method)(); eventos.delete(m.method); }
};
const cdp = (method, params = {}) =>
  new Promise((r) => { const i = ++idCdp; pendientes.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await cdp('Page.enable');
const cargado = new Promise((r) => eventos.set('Page.loadEventFired', r));
await cdp('Page.navigate', { url: `http://localhost:${PUERTO}/` });
await cargado;

// ─── Sesión en el panel ────────────────────────────────────────────────────
let cookies = '';
const guardar = (r) => {
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const [par] = c.split(';'); const [n] = par.split('=');
    cookies = [...cookies.split('; ').filter((x) => x && !x.startsWith(n + '=')), par].join('; ');
  }
};
const pedir = async (ruta, o = {}) => {
  const r = await fetch(API + ruta, { redirect: 'manual', ...o,
    headers: { cookie: cookies, origin: API, ...(o.headers ?? {}) } });
  guardar(r); return r;
};

const correo = process.env.CORREO;
const clave = process.env.CLAVE;
if (!correo || !clave) {
  console.error('Faltan CORREO y CLAVE en el entorno.');
  process.exit(2);
}

let csrf = ((await (await pedir('/panel/entrar')).text()).match(/[a-f0-9]{48}/) ?? [])[0];
const acceso = await pedir('/panel/entrar', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: correo, clave }),
});
if (acceso.status !== 302) {
  console.error(`No se pudo entrar al panel (HTTP ${acceso.status}).`);
  process.exit(1);
}
const htmlPanel = await (await pedir('/panel/imagenes')).text();
csrf = (htmlPanel.match(/const CSRF = "([a-f0-9]{48})"/) ?? [])[1];

// Tamaños que pide cada hueco, según la propia base.
const medidas = Object.fromEntries(
  [...htmlPanel.matchAll(/data-clave="([^"]+)"[\s\S]*?data-ancho="(\d+)" data-alto="(\d+)"/g)]
    .map((m) => [m[1], { ancho: Number(m[2]), alto: Number(m[3]) }]),
);

// ─── Conversión y subida ───────────────────────────────────────────────────
console.log(`\n  Asignando ${ASIGNACIONES.length} imágenes\n`);
let bien = 0;
for (const a of ASIGNACIONES) {
  const m = medidas[a.clave];
  if (!m) { console.log(`  !! ${a.clave.padEnd(22)} el panel no muestra ese hueco`); continue; }

  const { result } = await cdp('Runtime.evaluate', {
    expression: `window.convertir(${JSON.stringify(a.archivo)}, ${m.ancho}, ${m.alto})`,
    awaitPromise: true,
    returnByValue: true,
  });
  if (!result?.value) { console.log(`  !! ${a.clave.padEnd(22)} no se pudo convertir`); continue; }

  const bytes = Buffer.from(result.value, 'base64');
  const cuerpo = new FormData();
  cuerpo.append('imagen', new Blob([bytes], { type: 'image/webp' }), `${a.clave}.webp`);
  const r = await pedir(`/panel/imagenes/${a.clave}`, {
    method: 'POST', body: cuerpo, headers: { 'x-csrf-token': csrf },
  });
  const d = await r.json().catch(() => ({}));

  if (r.status === 200) {
    bien++;
    console.log(`  ok ${a.clave.padEnd(22)} ${a.archivo.slice(0, 26).padEnd(28)} `
      + `${d.data.ancho}×${d.data.alto}  ${Math.round(d.data.bytes / 1024)} KB`);
  } else {
    console.log(`  !! ${a.clave.padEnd(22)} HTTP ${r.status}  ${d.error ?? ''}`);
  }
}

console.log(`\n  ${bien}/${ASIGNACIONES.length} asignadas`);
ws.close();
servidor.close();
