/**
 * Compone el fondo de ESCRITORIO de la franja «Perito avaluador».
 *
 *   ORIGEN=docs/imagenes-origen/fondo-perito-campo.jpg \
 *   SALIDA=frontend/public/img/fondo-perito.webp \
 *   node herramientas/componer-fondo-perito.mjs
 *
 * ── Por qué no vale redimensionar y ya ────────────────────────────────────
 * La franja es mucho más apaisada que el lienzo: a 1920px el navegador solo
 * enseña la banda `y 193-887` de los 1080, es decir 694px de 1080. El
 * topógrafo ocupa casi todo el alto del original, así que a tamaño completo se
 * le corta la gorra por arriba y las botas por abajo. Es el mismo problema que
 * tuvo la lámina 2 de la cabecera, y se resuelve igual: ENCOGER la foto y
 * rellenar lo que sobra con la misma escena desenfocada.
 *
 * ── La diferencia con la herramienta del hero ─────────────────────────────
 * Allí el texto está a la izquierda y la foto va anclada a la DERECHA. Aquí el
 * texto está a la derecha, así que la foto va anclada a la IZQUIERDA y lo que
 * se desvanece es su borde derecho. No es la misma pieza con otros números.
 *
 * ── La escala se CALCULA, no se adivina ───────────────────────────────────
 * Se declara dónde empieza y acaba el sujeto en el ORIGINAL (`FRENTE` y
 * `PIES`) y el guion deduce cuánto hay que encoger para que quepa en la banda
 * con `AIRE` px de margen arriba y abajo. Así, si mañana cambia la foto, se
 * miden dos números y el encuadre sale solo.
 */
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const ORIGEN = process.env.ORIGEN ?? 'docs/imagenes-origen/fondo-perito-campo.jpg';
const SALIDA = process.env.SALIDA ?? 'frontend/public/img/fondo-perito.webp';

const W = 1920;
const H = 1080;
/*
 * Banda que el navegador enseña a 1920px. Sale de medir la página, no de
 * redondear: la seccion es de 1905x689 y `object-fit: cover` recorta arriba y
 * abajo. A anchos menores se ve MAS alto y el recorte pasa a los lados, asi
 * que disenar para esta banda —la mas estrecha— cubre todos los casos.
 */
const BANDA_ARRIBA = Number(process.env.BANDA_ARRIBA ?? 193);
const BANDA_ABAJO = Number(process.env.BANDA_ABAJO ?? 887);

// Del ORIGINAL: lo más alto y lo más bajo del sujeto que no se puede perder.
const FRENTE = Number(process.env.FRENTE ?? 150);   // coronilla de la gorra
const PIES = Number(process.env.PIES ?? 1495);      // suela de las botas
const AIRE = Number(process.env.AIRE ?? 18);        // margen dentro de la banda

// Desvanecidos sobre la base, para que no se vea el canto de la foto.
/*
 * Las plumas son ANCHAS a proposito. El cielo de esta foto es casi blanco y la
 * base va oscura: con un desvanecido corto, la frontera entre los dos se ve
 * como un resplandor, no como una transicion. Cuanto mas separados esten los
 * dos brillos, mas larga tiene que ser la rampa.
 */
const PLUMA_DERECHA = Number(process.env.PLUMA_DERECHA ?? 560);
const PLUMA_ARRIBA = Number(process.env.PLUMA_ARRIBA ?? 200);
const PLUMA_ABAJO = Number(process.env.PLUMA_ABAJO ?? 160);
// Base: se regulan por separado para poder probar sin tocar el guion.
const BASE_BRILLO = Number(process.env.BASE_BRILLO ?? 0.5);
const BASE_TINTE = Number(process.env.BASE_TINTE ?? 0.58);

const org = await sharp(ORIGEN).metadata();

/*
 * Escala. Primero cuánto mediría la foto a sangre (`cover` sobre el lienzo) y
 * luego cuánto hay que encogerla para que el sujeto quepa en la banda.
 */
const sangre = Math.max(W / org.width, H / org.height);
const altoSujeto = (PIES - FRENTE) * sangre;          // px de lienzo a sangre
const disponible = (BANDA_ABAJO - BANDA_ARRIBA) - AIRE * 2;
const k = Number(process.env.ESCALA ?? Math.min(1, disponible / altoSujeto));

// Base: la misma escena muy desenfocada y oscurecida. NO un color plano: el
// bloque macizo fue justo la queja del cliente en la lámina 1 del hero.
const base = await sharp(ORIGEN)
  .resize(W, H, { fit: 'cover' })
  .blur(55)
  .modulate({ brightness: BASE_BRILLO, saturation: 0.5 })
  .png()
  .toBuffer();
const tinte = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 10, g: 36, b: 67, alpha: BASE_TINTE } },
}).png().toBuffer();
const fondo = await sharp(base).composite([{ input: tinte, blend: 'over' }]).png().toBuffer();

// La foto, encogida. Se mantiene la proporción del ORIGINAL: no se da por
// hecho ningún lienzo de partida.
const fw = Math.round(W * sangre * k * (org.width / Math.max(W / sangre, org.width)) || 0);
const anchoFoto = Math.round(org.width * sangre * k);
const altoFoto = Math.round(org.height * sangre * k);

const foto = await sharp(ORIGEN).resize(anchoFoto, altoFoto).png().toBuffer();

/*
 * Colocación. Horizontal: pegada a la IZQUIERDA, que es donde está el sujeto y
 * donde el texto no llega. Vertical: se centra el SUJETO en la banda, no la
 * foto en el lienzo; son cosas distintas y la segunda deja la cabeza fuera.
 */
const izq = 0;
const centroSujeto = ((FRENTE + PIES) / 2) * sangre * k;
const arr = Math.round((BANDA_ARRIBA + BANDA_ABAJO) / 2 - centroSujeto);

/*
 * Molde de transparencia para los tres bordes que quedan al aire.
 *
 * Se calcula PIXEL A PIXEL, no con un SVG de tres rectangulos.
 *
 * El primer intento fue eso ultimo, apilandolos con `mix-blend-mode:
 * multiply`. **sharp no soporta `mix-blend-mode`**: los tres degradados se
 * compusieron en modo normal, que SUMA opacidad, y el molde salio opaco de
 * punta a punta. Resultado: cantos duros arriba, abajo y a la derecha, justo
 * lo que el desvanecido venia a evitar.
 *
 * Multiplicar tres rampas es una linea de aritmetica; con un degradado por
 * canal alfa no hay forma de equivocarse.
 */
const rampa = (d, ancho) => (ancho <= 0 ? 1 : Math.min(1, Math.max(0, d / ancho)));
const mascara = Buffer.alloc(anchoFoto * altoFoto * 4);
for (let y = 0; y < altoFoto; y++) {
  const aArriba = rampa(y, PLUMA_ARRIBA);
  const aAbajo = rampa(altoFoto - 1 - y, PLUMA_ABAJO);
  for (let x = 0; x < anchoFoto; x++) {
    const a = aArriba * aAbajo * rampa(anchoFoto - 1 - x, PLUMA_DERECHA);
    const i = (y * anchoFoto + x) * 4;
    mascara[i] = 255; mascara[i + 1] = 255; mascara[i + 2] = 255;
    mascara[i + 3] = Math.round(a * 255);
  }
}
const molde = await sharp(mascara, { raw: { width: anchoFoto, height: altoFoto, channels: 4 } })
  .png().toBuffer();

/*
 * `.png()` en TODOS los pasos intermedios, no solo al final. El origen es un
 * JPEG y sharp devuelve el formato de entrada: sin esto, un `toBuffer()` a
 * mitad de la cadena da un JPEG, que no tiene canal alfa, y el desvanecido se
 * hornea en NEGRO en vez de dejar ver la base.
 */
const fotoSuave = await sharp(foto)
  .composite([{ input: molde, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(fondo)
  .composite([{ input: fotoSuave, left: izq, top: arr }])
  .webp({ quality: 80 })
  .toFile(SALIDA);

// Dónde queda el sujeto, en coordenadas del lienzo. Es la comprobación: si
// estos dos números no están dentro de la banda, el encuadre está mal.
const sujetoArriba = Math.round(arr + FRENTE * sangre * k);
const sujetoAbajo = Math.round(arr + PIES * sangre * k);
const meta = await sharp(SALIDA).metadata();
console.log(`origen      ${org.width}x${org.height}`);
console.log(`escala      ${k.toFixed(3)}  (foto ${anchoFoto}x${altoFoto}, en x ${izq}-${izq + anchoFoto}, y ${arr}-${arr + altoFoto})`);
console.log(`banda       y ${BANDA_ARRIBA}-${BANDA_ABAJO}`);
console.log(`sujeto      y ${sujetoArriba}-${sujetoAbajo}  ${sujetoArriba >= BANDA_ARRIBA && sujetoAbajo <= BANDA_ABAJO ? 'DENTRO' : '*** FUERA ***'}`);
console.log(`salida      ${SALIDA}  ${meta.width}x${meta.height}  ${(meta.size / 1024).toFixed(0)}KB`);
