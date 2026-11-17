/**
 * Prepara los logotipos de las entidades certificadoras para la franja del
 * perito.
 *
 *   node herramientas/preparar-logos-certificacion.mjs
 *
 * ── Por qué una herramienta y no el panel ─────────────────────────────────
 * El panel redimensiona en el navegador y sirve para el día a día del cliente.
 * Estos cinco archivos llegan una sola vez y hay que tratarlos antes: vienen
 * con fondo blanco macizo, a resoluciones de 220 px a 7178 px, y uno de ellos
 * en negativo. Es autoría, igual que los fondos del hero, no una dependencia
 * de ejecución.
 *
 * ── Lo que hace a cada uno, en orden ──────────────────────────────────────
 * 1. **Quita el fondo blanco por INUNDACIÓN desde los bordes**, no con un
 *    filtro de color. Es la misma regla que los favicons: así desaparece el
 *    blanco de fuera y se conservan los blancos de DENTRO del dibujo, que
 *    están rodeados de color. Un filtro «todo lo claro a transparente» agujerea
 *    el escudo de Delta Force, cuyo campo es gris muy claro.
 * 2. **Recorta lo transparente** que sobra alrededor.
 * 3. **Contiene** en el lienzo del hueco, sin recortar y sin deformar. Un
 *    logotipo recortado pierde letras, y son marcas AJENAS.
 * 4. Guarda WebP **con canal alfa**, para que sirva sobre cualquier color.
 *
 * El lienzo de salida es el mismo que declara el hueco (320×160). No es un
 * capricho: si el archivo tuviera otra proporción, el día que el cliente
 * resubiera ese logotipo desde el panel —que sí contiene en 320×160— el
 * tamaño en pantalla cambiaría sin que nadie tocara el diseño.
 */
import { argv } from 'node:process';
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const ANCHO = 320;
const ALTO = 160;
// Margen interior, para que dos logotipos seguidos no se toquen.
const MARGEN = 0.04;
/*
 * AREA optica que ocupa cada logotipo dentro del lienzo, en pixeles cuadrados.
 *
 * Es lo que iguala, y NO es lo mismo que igualar la altura.
 *
 * Cuatro de estos logotipos son horizontales (de 2,4:1 a 2,9:1) y el de
 * Aeronautica Civil es apilado (1,38:1): emblema arriba y dos lineas de texto
 * debajo. Contenidos todos en el mismo lienzo, el apilado toca el techo antes
 * de crecer a lo ancho y se ve claramente mas pequeno que sus vecinos, con su
 * linea inferior ya ilegible. Es el defecto clasico de una fila de avales.
 *
 * Igualando el AREA, cada marca ocupa la misma superficie: el apilado queda
 * mas alto y mas estrecho, el horizontal mas bajo y mas ancho, y los cinco
 * pesan lo mismo. Es lo que se hace a mano en un sistema de diseno; aqui lo
 * hace la aritmetica, que ademas no se olvida cuando llegue un sexto.
 *
 * El valor sale de que un horizontal de 2,9:1 llene casi el ancho util.
 */
const AREA = 30000;
// Un píxel cuenta como fondo si es casi blanco y casi neutro. El segundo
// requisito importa: el amarillo claro de Delta Force es claro pero NO neutro.
const UMBRAL_CLARO = 236;
const UMBRAL_NEUTRO = 14;

/** Marca como transparente el fondo claro conectado con los bordes. */
const quitarFondo = (datos, ancho, alto) => {
  const esFondo = (i) => {
    const [r, g, b] = [datos[i], datos[i + 1], datos[i + 2]];
    if (datos[i + 3] < 16) return true;
    const max = Math.max(r, g, b); const min = Math.min(r, g, b);
    return min >= UMBRAL_CLARO && max - min <= UMBRAL_NEUTRO;
  };
  /*
   * Pila explícita, no recursión: un lienzo de 7178×3133 son 22 millones de
   * píxeles y una inundación recursiva desborda la pila de Node.
   */
  const visto = new Uint8Array(ancho * alto);
  const pila = [];
  for (let x = 0; x < ancho; x++) { pila.push(x, x + (alto - 1) * ancho); }
  for (let y = 0; y < alto; y++) { pila.push(y * ancho, ancho - 1 + y * ancho); }
  while (pila.length) {
    const p = pila.pop();
    if (visto[p]) continue;
    visto[p] = 1;
    if (!esFondo(p * 4)) continue;
    datos[p * 4 + 3] = 0;
    const x = p % ancho; const y = (p - x) / ancho;
    if (x > 0) pila.push(p - 1);
    if (x < ancho - 1) pila.push(p + 1);
    if (y > 0) pila.push(p - ancho);
    if (y < alto - 1) pila.push(p + ancho);
  }
  return datos;
};

export const prepararLogo = async (origen, destino) => {
  const base = sharp(origen).ensureAlpha();
  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
  const limpio = quitarFondo(data, info.width, info.height);

  // `.png()` en los pasos intermedios: sin él sharp devuelve el formato de
  // entrada y un JPEG no tiene canal alfa, así que la transparencia recién
  // ganada se pierde en el siguiente `toBuffer`.
  const recortado = await sharp(limpio, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toBuffer({ resolveWithObject: true });

  const util = { ancho: Math.round(ANCHO * (1 - MARGEN * 2)), alto: Math.round(ALTO * (1 - MARGEN * 2)) };
  const { width: tw, height: th } = recortado.info;

  /*
   * Escala por area, sujeta al lienzo. El tope no es un detalle: sin el, un
   * logotipo muy apaisado se saldria por los lados al pedirle su area.
   */
  const escala = Math.min(
    Math.sqrt(AREA / (tw * th)),
    util.ancho / tw,
    util.alto / th,
  );
  const dest = { ancho: Math.max(1, Math.round(tw * escala)), alto: Math.max(1, Math.round(th * escala)) };

  const sobraX = ANCHO - dest.ancho;
  const sobraY = ALTO - dest.alto;
  await sharp(recortado.data)
    .resize(dest.ancho, dest.alto, { fit: 'fill' })
    .extend({
      top: Math.floor(sobraY / 2), bottom: Math.ceil(sobraY / 2),
      left: Math.floor(sobraX / 2), right: Math.ceil(sobraX / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(destino);

  return {
    origen: `${info.width}x${info.height}`,
    recorte: `${tw}x${th}`,
    colocado: `${dest.ancho}x${dest.alto}`,
    area: Math.round(dest.ancho * dest.alto),
  };
};

if (argv[2]) {
  const pares = argv.slice(2);
  for (let i = 0; i < pares.length; i += 2) {
    const r = await prepararLogo(pares[i], pares[i + 1]);
    console.log(`${pares[i + 1]}  origen ${r.origen} → tinta ${r.recorte} → colocado ${r.colocado} (area ${r.area}) en ${ANCHO}x${ALTO}`);
  }
}
