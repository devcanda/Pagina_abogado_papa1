/**
 * Punto de control visual del sitio.
 *
 *   node herramientas/visual.mjs capturar <url> <carpeta>
 *   node herramientas/visual.mjs comparar <carpeta-base> <carpeta-nueva>
 *
 * `capturar` guarda una imagen por vista. `comparar` las enfrenta píxel a
 * píxel y escribe una imagen de diferencias por cada vista que no coincida.
 *
 * Sirve para responder a una sola pregunta antes y después de cualquier
 * refactor: ¿cambió algo que el visitante pueda ver?
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { leerPNG, escribirPNG } from './png.mjs';

/** Las vistas que componen el punto de control. */
export const VISTAS = [
  { nombre: 'portada-escritorio', ruta: '/', ancho: 1440, alto: 900 },
  { nombre: 'portada-movil', ruta: '/', ancho: 390, alto: 844 },
  { nombre: 'corporativa-escritorio', ruta: '/quienes-somos/', ancho: 1440, alto: 900 },
  { nombre: 'corporativa-movil', ruta: '/quienes-somos/', ancho: 390, alto: 844 },
  { nombre: 'landing-escritorio', ruta: '/demanda-laboral/', ancho: 1440, alto: 900 },
  { nombre: 'landing-movil', ruta: '/demanda-laboral/', ancho: 390, alto: 844 },
  { nombre: 'error-404', ruta: '/no-existe/', ancho: 1440, alto: 900 },
];

// Umbrales: por debajo de esto se considera ruido de renderizado, no un cambio
// real. El suavizado de fuentes varía un poco entre ejecuciones.
const TOLERANCIA_CANAL = 12;   // diferencia por canal que se ignora
// Umbral ABSOLUTO, no porcentual. Un porcentaje engaña: una palabra cambiada
// son ~2.000 píxeles, que sobre una portada de 7,9 millones es un 0,03% y
// pasaría desapercibida. Medido: dos capturas idénticas dan 0 píxeles de
// diferencia, así que cualquier cosa por encima de un puñado es real.
const UMBRAL_PIXELES = 150;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Alto real del documento.
 *
 * No basta con `Page.getLayoutMetrics`: contra un Chrome recién arrancado
 * devuelve a veces el alto del viewport en lugar del del contenido, y la
 * captura sale recortada. Eso convertía el punto de control en algo que falla
 * unas veces sí y otras no, que es peor que no tenerlo.
 *
 * Se contrasta con `scrollHeight` y se repite hasta que dos lecturas seguidas
 * coincidan y no sean sospechosamente iguales al alto de la ventana.
 */
async function medirAlto(enviar, altoVista) {
  let previo = 0;
  for (let intento = 0; intento < 12; intento++) {
    const { contentSize } = await enviar('Page.getLayoutMetrics');
    const { result } = await enviar('Runtime.evaluate', {
      expression: 'document.documentElement.scrollHeight',
      returnByValue: true,
    });
    const alto = Math.ceil(Math.max(contentSize.height, result?.value ?? 0));

    if (alto !== altoVista && alto === previo) return alto;
    previo = alto;
    await dormir(250);
  }
  return previo;
}

async function conectar() {
  const lista = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const destino = lista.find((t) => t.type === 'page');
  if (!destino) throw new Error('No hay ninguna pestaña; ¿arrancó Chrome con --remote-debugging-port=9222?');
  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 0;
  const pendientes = new Map();
  const eventos = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m.result); pendientes.delete(m.id); }
    else if (m.method && eventos.has(m.method)) { eventos.get(m.method)(); eventos.delete(m.method); }
  };
  const enviar = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pendientes.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const esperar = (nombre) => new Promise((r) => eventos.set(nombre, r));
  return { enviar, esperar, cerrar: () => ws.close() };
}

async function capturar(base, carpeta) {
  mkdirSync(carpeta, { recursive: true });
  const { enviar, esperar, cerrar } = await conectar();
  await enviar('Page.enable');

  // Capturar como si el visitante pidiera menos movimiento. El sitio ya respeta
  // esa preferencia desactivando el desplazamiento suave y las animaciones, así
  // que esto hace las capturas deterministas sin inventar nada: sin ello, la
  // cabecera fija sale a distinta altura y la franja rotatoria en distinta
  // palabra según el instante exacto del disparo.
  await enviar('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });

  // Calentamiento: una navegación que se descarta, para que la primera vista
  // real no cargue con el arranque en frío del servidor ni con la primera
  // descarga de la fuente.
  {
    const cargado = esperar('Page.loadEventFired');
    await enviar('Page.navigate', { url: base.replace(/\/$/, '') + VISTAS[0].ruta });
    await cargado;
    await dormir(2500);
  }

  for (const v of VISTAS) {
    await enviar('Emulation.setDeviceMetricsOverride',
      { width: v.ancho, height: v.alto, deviceScaleFactor: 1, mobile: v.ancho < 700 });
    const cargado = esperar('Page.loadEventFired');
    await enviar('Page.navigate', { url: base.replace(/\/$/, '') + v.ruta });
    await cargado;

    // Esperar a que la serif esté aplicada DE VERDAD.
    //
    // No basta con `document.fonts.ready` ni con `fonts.check()`: ambos pueden
    // dar por buena la fuente antes de que el navegador repinte el texto, y la
    // captura sale con los titulares en Georgia. Eso daba un 1,7% de falso
    // positivo en la primera pasada tras arrancar el servidor.
    //
    // Se comprueba por el efecto, no por la promesa: se mide el ancho de un
    // titular hasta que dos lecturas seguidas coinciden. Si la fuente cambia,
    // el ancho cambia.
    await enviar('Runtime.evaluate', {
      expression: `(async () => {
        const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
        const cuadro = () => new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)));
        const ancho = () => {
          const t = document.querySelector('h1, h2, .titular, .titular-claro');
          return t ? Math.round(t.getBoundingClientRect().width * 100) : -1;
        };

        await document.fonts.ready;
        let previo = -2;
        for (let i = 0; i < 80; i++) {
          if (document.fonts.check('700 1rem "Playfair Display"')) {
            await cuadro();
            const actual = ancho();
            if (actual === previo) return 'estable';
            previo = actual;
          }
          await dormir(120);
        }
        return 'agotado';
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });

    await dormir(600);                        // imágenes diferidas

    // Recorre la página para disparar lo que carga de forma diferida.
    const alto = await medirAlto(enviar, v.alto);
    for (let y = 0; y < alto; y += v.alto) {
      await enviar('Runtime.evaluate',
        { expression: `window.scrollTo({ top: ${y}, behavior: 'instant' })` });
      await dormir(120);
    }
    await enviar('Runtime.evaluate',
      { expression: "window.scrollTo({ top: 0, behavior: 'instant' })" });
    await dormir(700);

    // El recorrido puede haber cargado imágenes diferidas y cambiado el alto.
    const altoFinal = await medirAlto(enviar, v.alto);

    const { data } = await enviar('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: v.ancho, height: altoFinal, scale: 1 },
    });
    const destino = join(carpeta, `${v.nombre}.png`);
    writeFileSync(destino, Buffer.from(data, 'base64'));
    console.log(`  ${v.nombre.padEnd(26)} ${v.ancho}x${altoFinal}`);
  }
  cerrar();
}

function comparar(dirBase, dirNueva) {
  const dirDiff = join(dirNueva, 'diferencias');
  let fallos = 0, comparadas = 0;

  for (const archivo of readdirSync(dirBase).filter((f) => f.endsWith('.png'))) {
    const a = join(dirBase, archivo);
    const b = join(dirNueva, archivo);
    if (!existsSync(b)) { console.log(`  !! ${archivo}: no existe en la captura nueva`); fallos++; continue; }

    const base = leerPNG(a);
    const nueva = leerPNG(b);
    comparadas++;

    if (base.ancho !== nueva.ancho || base.alto !== nueva.alto) {
      console.log(`  !! ${basename(archivo, '.png').padEnd(26)} cambió de tamaño: `
        + `${base.ancho}x${base.alto} -> ${nueva.ancho}x${nueva.alto}`);
      fallos++;
      continue;
    }

    const total = base.ancho * base.alto;
    const rgba = Buffer.alloc(total * 4);
    let distintos = 0;

    for (let i = 0; i < total; i++) {
      const oa = i * base.canales, ob = i * nueva.canales;
      let maxDif = 0;
      for (let c = 0; c < 3; c++) {
        maxDif = Math.max(maxDif, Math.abs(base.datos[oa + c] - nueva.datos[ob + c]));
      }
      const d = i * 4;
      if (maxDif > TOLERANCIA_CANAL) {
        distintos++;
        rgba[d] = 255; rgba[d + 1] = 0; rgba[d + 2] = 0; rgba[d + 3] = 255;
      } else {
        // Lo que no cambió queda en gris claro, para ver dónde está lo que sí.
        const gris = 230 + ((base.datos[oa] + base.datos[oa + 1] + base.datos[oa + 2]) / 3) * 0.1;
        rgba[d] = rgba[d + 1] = rgba[d + 2] = Math.min(255, gris);
        rgba[d + 3] = 255;
      }
    }

    const pct = (distintos / total) * 100;
    const nombre = basename(archivo, '.png').padEnd(26);
    if (distintos > UMBRAL_PIXELES) {
      mkdirSync(dirDiff, { recursive: true });
      escribirPNG(join(dirDiff, archivo), base.ancho, base.alto, rgba);
      console.log(`  !! ${nombre} ${distintos} píxeles (${pct.toFixed(3)}%)  -> diferencias/${archivo}`);
      fallos++;
    } else {
      console.log(`  ok ${nombre} ${distintos} píxeles de diferencia`);
    }
  }

  console.log(`\n  ${comparadas} vistas comparadas, ${fallos} con diferencias`);
  return fallos;
}

const [, , orden, arg1, arg2] = process.argv;
if (orden === 'capturar') {
  console.log(`Capturando ${VISTAS.length} vistas de ${arg1}`);
  await capturar(arg1, arg2);
} else if (orden === 'comparar') {
  console.log(`Comparando ${arg2} contra la línea base ${arg1}`);
  process.exitCode = comparar(arg1, arg2) > 0 ? 1 : 0;
} else {
  console.log('Uso:\n  node herramientas/visual.mjs capturar <url> <carpeta>'
    + '\n  node herramientas/visual.mjs comparar <carpeta-base> <carpeta-nueva>');
  process.exitCode = 2;
}
