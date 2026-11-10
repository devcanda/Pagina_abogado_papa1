/**
 * Prueba varios encuadres de una imagen de fondo SIN tocar el sitio.
 *
 *   node herramientas/previsualizar-fondo.mjs <imagen> [ancho...] [--clave=X] [--lamina=N]
 *
 * Ejemplo:
 *   node herramientas/previsualizar-fondo.mjs docs/imagenes-origen/fondo-laboral-ingenio.jpg 2200 2400 2731
 *
 * Deja una hoja de contactos en `docs/vista-previa-fondo.png` con cada
 * encuadre montado en la cabecera de verdad, en escritorio y en móvil.
 *
 * ── Por qué montarlo de verdad y no simularlo ──────────────────────────────
 * Sobre una foto, lo que decide si el encuadre sirve es dónde cae el texto y
 * cuánto recorta el navegador, y eso depende del alto de la franja, del ancho
 * de la columna y del velo. Dibujar una aproximación daría una respuesta
 * bonita y falsa. Aquí se sustituye el archivo, se mira la página real y se
 * devuelve el archivo a su sitio.
 *
 * ── Qué hace falta ────────────────────────────────────────────────────────
 *   · El sitio en marcha  (npm run dev dentro de frontend/, puerto 4340)
 *   · Chrome con  --remote-debugging-port=9222   (igual que `visual.mjs`)
 *
 * NO pasa por el panel a propósito: así no gasta intentos del limitador de
 * acceso, que corta a los ocho por cuarto de hora y es justo lo que estorba
 * cuando uno está probando encuadres uno detrás de otro.
 */
import {
  copyFileSync, existsSync, writeFileSync, unlinkSync, mkdirSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const sharp = require('sharp');

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = process.env.SITIO ?? 'http://localhost:4340';
const ANCHOS_POR_DEFECTO = [2200, 2400, 2600, 2731];

// Mismo tratamiento que se aplica al subir una foto en color: un punto menos
// de saturación y de brillo, porque el verde a plena pureza pelea con el navy.
const SATURACION = Number(process.env.SATURACION ?? 0.88);
const BRILLO = Number(process.env.BRILLO ?? 0.94);

// ── Argumentos ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const opcion = (nombre, pordefecto) => {
  const a = args.find((x) => x.startsWith(`--${nombre}=`));
  return a ? a.slice(nombre.length + 3) : pordefecto;
};
const sueltos = args.filter((a) => !a.startsWith('--'));
const origen = sueltos[0];
const anchos = sueltos.slice(1).map(Number).filter(Boolean);
const clave = opcion('clave', 'fondo-lamina-1');
const lamina = Number(opcion('lamina', '0'));

if (!origen) {
  console.error('Falta la imagen de origen.');
  console.error('  node herramientas/previsualizar-fondo.mjs <imagen> [ancho...]');
  process.exit(2);
}

// ── Conexión con Chrome ─────────────────────────────────────────────────────
const lista = await (await fetch('http://127.0.0.1:9222/json/list').catch(() => {
  throw new Error('No hay Chrome escuchando en el 9222. Arránquelo con --remote-debugging-port=9222');
})).json();
const pestana = lista.find((x) => x.type === 'page');
if (!pestana) throw new Error('Chrome no tiene ninguna pestaña abierta.');

const ws = new WebSocket(pestana.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pendientes = new Map(); const sucesos = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); }
  else if (m.method && sucesos.has(m.method)) { sucesos.get(m.method)(); sucesos.delete(m.method); }
};
const cdp = (metodo, params = {}) => new Promise((r) => {
  const i = ++id; pendientes.set(i, r);
  ws.send(JSON.stringify({ id: i, method: metodo, params }));
});
const ver = async (expr) => (await cdp('Runtime.evaluate', {
  expression: expr, returnByValue: true, awaitPromise: true,
})).result?.value;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Network.enable');
// Sin esto, el navegador reutiliza la imagen anterior: la ruta no cambia entre
// encuadres, solo el contenido del archivo, y se verían todas iguales.
await cdp('Network.setCacheDisabled', { cacheDisabled: true });

/** Captura la cabecera con el pase detenido y la lámina pedida a la vista. */
const capturarCabecera = async (ancho, alto) => {
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: ancho, height: alto, deviceScaleFactor: 1, mobile: ancho < 500,
  });
  const cargada = new Promise((r) => sucesos.set('Page.loadEventFired', r));
  await cdp('Page.navigate', { url: SITIO });
  await cargada;
  await dormir(2500);

  // Pulsar un punto detiene el pase para siempre: sin eso la captura puede
  // pillar la lámina a mitad del relevo, a media opacidad.
  await ver(`document.querySelectorAll('.cabecera-punto')[${lamina}]?.click()`);
  await dormir(2000);
  await ver('window.scrollTo(0, 0)');
  await ver("document.querySelector('astro-dev-toolbar')?.remove()");
  await dormir(600);

  const caja = JSON.parse(await ver(`(() => {
    const s = document.querySelector('.cabecera');
    const r = s.getBoundingClientRect();
    return JSON.stringify({
      x: 0, y: Math.round(r.y + scrollY),
      width: Math.round(r.width), height: Math.round(r.height),
    });
  })()`));
  const foto = await cdp('Page.captureScreenshot', {
    format: 'png', clip: { ...caja, scale: 1 }, captureBeyondViewport: true,
  });
  return Buffer.from(foto.data, 'base64');
};

// ── Preparación ─────────────────────────────────────────────────────────────
const destino = join(RAIZ, 'frontend', 'public', 'img', `${clave}.webp`);
const respaldo = `${destino}.respaldo`;
const habia = existsSync(destino);
if (habia) copyFileSync(destino, respaldo);

const meta = await sharp(join(RAIZ, origen)).metadata();
const aUsar = (anchos.length ? anchos : ANCHOS_POR_DEFECTO).filter((w) => {
  const alto = Math.round(w / (16 / 9));
  if (w > meta.width || alto > meta.height) {
    console.log(`  (se omite ${w}: no cabe en ${meta.width}x${meta.height})`);
    return false;
  }
  return true;
});

console.log(`origen ${meta.width}x${meta.height} · hueco «${clave}» · lámina ${lamina + 1}`);

const filas = [];
try {
  for (const w of aUsar) {
    const alto = Math.round(w / (16 / 9));
    await sharp(join(RAIZ, origen))
      .extract({ left: 0, top: 0, width: w, height: alto })
      .resize(1920, 1080, { kernel: 'lanczos3' })
      .modulate({ saturation: SATURACION, brightness: BRILLO })
      .webp({ quality: 76 })
      .toFile(destino);

    const escritorio = await capturarCabecera(1440, 1000);
    const movil = await capturarCabecera(390, 800);
    filas.push({ w, pct: Math.round((w / meta.width) * 100), escritorio, movil });
    console.log(`  ${w} px (${Math.round((w / meta.width) * 100)} % del original) capturado`);
  }
} finally {
  // Pase lo que pase, el archivo vuelve a ser el que era. Una herramienta de
  // previsualización que deja el sitio cambiado no es de previsualización.
  if (habia) { copyFileSync(respaldo, destino); unlinkSync(respaldo); }
  else if (existsSync(destino)) unlinkSync(destino);
  await cdp('Emulation.clearDeviceMetricsOverride');
  ws.close();
  console.log('· imagen original devuelta a su sitio');
}

// ── Hoja de contactos ───────────────────────────────────────────────────────
const ANCHO_E = 760;
const ANCHO_M = 206;
const SEPARACION = 14;
const ALTO_ROTULO = 34;

const piezas = [];
let y = 0;
for (const f of filas) {
  const e = sharp(f.escritorio).resize({ width: ANCHO_E });
  const m = sharp(f.movil).resize({ width: ANCHO_M });
  const [be, bm] = await Promise.all([e.toBuffer({ resolveWithObject: true }), m.toBuffer({ resolveWithObject: true })]);
  const altoFila = Math.max(be.info.height, bm.info.height);
  piezas.push({ be, bm, altoFila, f, y });
  y += ALTO_ROTULO + altoFila + SEPARACION;
}

const anchoHoja = ANCHO_E + SEPARACION + ANCHO_M + SEPARACION * 2;
const rotulos = piezas.map(({ f, y: yy }) => `
  <text x="${SEPARACION}" y="${yy + 23}" fill="#fff" font-family="sans-serif" font-size="17" font-weight="700">
    ${f.w} px — ${f.pct} % del original
  </text>`).join('');

const fondo = await sharp({
  create: {
    width: anchoHoja, height: Math.max(y, 1), channels: 3, background: '#0a2443',
  },
}).png().toBuffer();

const capas = piezas.flatMap(({ be, bm, f, y: yy }) => [
  { input: be.data, top: yy + ALTO_ROTULO, left: SEPARACION },
  { input: bm.data, top: yy + ALTO_ROTULO, left: SEPARACION * 2 + ANCHO_E },
]);
capas.push({
  input: Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${anchoHoja}" height="${y}">${rotulos}</svg>`,
  ),
  top: 0,
  left: 0,
});

mkdirSync(join(RAIZ, 'docs'), { recursive: true });
const salida = join(RAIZ, 'docs', 'vista-previa-fondo.png');
writeFileSync(salida, await sharp(fondo).composite(capas).png().toBuffer());
console.log(`hoja de contactos: docs/vista-previa-fondo.png (${filas.length} encuadres)`);
