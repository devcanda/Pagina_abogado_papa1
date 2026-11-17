/**
 * Contraste del texto blanco sobre una imagen de fondo, con su velo.
 *
 *   FONDO=frontend/public/img/fondo-perito.webp node herramientas/contraste-fondo.mjs
 *
 * ── Por qué no se mide en el navegador ────────────────────────────────────
 * Se intentó: capturar la página y leer los píxeles bajo el texto. Los números
 * salían distintos en cada pasada porque el fondo va en `loading="lazy"` y en
 * este equipo Chrome no siempre dispara la carga diferida; se estaba midiendo
 * si la foto había llegado, no el contraste.
 *
 * El velo es una capa de color plano con una opacidad conocida y un degradado
 * conocido. Eso se calcula, y el resultado es el mismo todas las veces.
 *
 * ── Lo que se mide ────────────────────────────────────────────────────────
 * Solo la parte del lienzo que el visitante ve Y que queda debajo del texto.
 * Medir la imagen entera daría un número tranquilizador y falso: la mitad
 * izquierda no lleva letras encima.
 */
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const FONDO = process.env.FONDO ?? 'frontend/public/img/fondo-perito.webp';

// Banda del lienzo que se ve. A 1920px es la más estrecha; por eso se usa esa.
const BANDA_ARRIBA = Number(process.env.BANDA_ARRIBA ?? 193);
const BANDA_ABAJO = Number(process.env.BANDA_ABAJO ?? 887);
// Zona del ancho que ocupa el texto, en tanto por uno de la sección.
const TEXTO_DESDE = Number(process.env.TEXTO_DESDE ?? 0.52);
const TEXTO_HASTA = Number(process.env.TEXTO_HASTA ?? 0.98);

// Velo: color y tramos del degradado, iguales que en el componente.
const VELO = [10, 36, 67];
const GRAD_DESDE = Number(process.env.GRAD_DESDE ?? 0.18);  // alfa 0
const GRAD_HASTA = Number(process.env.GRAD_HASTA ?? 0.62);  // alfa 1
const OPACIDAD = { ninguno: 0, ligero: 0.3, medio: 0.5, fuerte: 0.7, opaco: 0.85 };

const aLineal = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminancia = (r, g, b) => 0.2126 * aLineal(r) + 0.7152 * aLineal(g) + 0.0722 * aLineal(b);
// Contra BLANCO, que es el color del titular y del texto de esta franja.
const contraste = (L) => 1.05 / (L + 0.05);

const { data, info } = await sharp(FONDO).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels } = info;

const y0 = Math.max(0, Math.round(BANDA_ARRIBA / 1080 * H));
const y1 = Math.min(H, Math.round(BANDA_ABAJO / 1080 * H));
const x0 = Math.round(TEXTO_DESDE * W);
const x1 = Math.round(TEXTO_HASTA * W);

console.log(`imagen   ${W}x${H}`);
console.log(`zona     x ${x0}-${x1} · y ${y0}-${y1}  (lo que se ve Y lleva texto encima)\n`);
console.log('velo      peor     medio    bajo 4,5:1');
console.log('--------------------------------------');

for (const [nombre, op] of Object.entries(OPACIDAD)) {
  let peor = Infinity; let suma = 0; let n = 0; let flojos = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * channels;
      // Alfa del velo en esta columna: el degradado del componente.
      const t = (x / W - GRAD_DESDE) / (GRAD_HASTA - GRAD_DESDE);
      const alfa = op * Math.min(1, Math.max(0, t));
      const r = data[i] * (1 - alfa) + VELO[0] * alfa;
      const g = data[i + 1] * (1 - alfa) + VELO[1] * alfa;
      const b = data[i + 2] * (1 - alfa) + VELO[2] * alfa;
      const c = contraste(luminancia(r, g, b));
      if (c < peor) peor = c;
      if (c < 4.5) flojos++;
      suma += c; n++;
    }
  }
  const pct = (flojos / n * 100).toFixed(1);
  console.log(`${nombre.padEnd(9)} ${peor.toFixed(2)}:1  ${(suma / n).toFixed(2)}:1   ${pct}%`);
}
