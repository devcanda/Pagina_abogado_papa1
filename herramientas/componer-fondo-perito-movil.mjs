/**
 * Compone el fondo VERTICAL de la franja «Perito avaluador», para móvil.
 *
 *   SALIDA=frontend/public/img/fondo-perito-movil.webp \
 *   node herramientas/componer-fondo-perito-movil.mjs
 *
 * ── Por qué hace falta una imagen aparte ──────────────────────────────────
 * La de escritorio es apaisada y en el teléfono la franja es alta y estrecha:
 * `object-fit: cover` recortaría por los lados y se perdería medio encuadre.
 *
 * ── La banda visible de móvil CAMBIÓ al quitar la figura ──────────────────
 * Con la ilustración enmarcada, la franja medía 390x1040 y de un lienzo 2:3
 * solo se veía el 56 % central del ancho. Sin ella mide **390x721**, y
 * entonces se ve `x 97-927` de los 1024, el 81 %. Es mucho más generoso, y no
 * es un detalle: el ancho visible decide cuánto hay que encoger al sujeto.
 *
 * El número sale de medir la página, no de recordarlo.
 *
 * ── La escala se CALCULA ──────────────────────────────────────────────────
 * Se declara dónde está el sujeto en el ORIGINAL y el guion deduce cuánto
 * encogerlo para que quepa a lo ancho de la banda con `AIRE` px de margen.
 */
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const ORIGEN = process.env.ORIGEN ?? 'docs/imagenes-origen/fondo-perito-campo.jpg';
const SALIDA = process.env.SALIDA ?? 'frontend/public/img/fondo-perito-movil.webp';

const W = 1024;
const H = 1536;
// Lo que el teléfono enseña del lienzo. Medido en la página.
const BANDA_IZQ = Number(process.env.BANDA_IZQ ?? 97);
const BANDA_DER = Number(process.env.BANDA_DER ?? 927);

// Sujeto en el ORIGINAL: del hombro izquierdo del topógrafo a la pata derecha
// del trípode. Es lo que no se puede recortar.
const SUJETO_IZQ = Number(process.env.SUJETO_IZQ ?? 321);
const SUJETO_DER = Number(process.env.SUJETO_DER ?? 1263);
const AIRE = Number(process.env.AIRE ?? 30);

const PLUMA = Number(process.env.PLUMA ?? 200);
const BASE_BRILLO = Number(process.env.BASE_BRILLO ?? 0.5);
const BASE_TINTE = Number(process.env.BASE_TINTE ?? 0.58);

const org = await sharp(ORIGEN).metadata();

/*
 * Ventana vertical 2:3 recortada del original, a toda su altura. Se centra en
 * el SUJETO, no en el lienzo: la escena tiene campo de sobra a la derecha y
 * centrarla dejaría al topógrafo pegado al borde.
 */
const ventanaAncho = Math.round(org.height * (W / H));
const centroSujeto = (SUJETO_IZQ + SUJETO_DER) / 2;
const ventanaIzq = Math.max(0, Math.min(org.width - ventanaAncho, Math.round(centroSujeto - ventanaAncho / 2)));

const recorte = await sharp(ORIGEN)
  .extract({ left: ventanaIzq, top: 0, width: ventanaAncho, height: org.height })
  .png()
  .toBuffer();

// Escala: que el sujeto quepa a lo ancho de la banda con su margen.
const aSangre = W / ventanaAncho;                       // px de lienzo por px de original
const anchoSujeto = (SUJETO_DER - SUJETO_IZQ) * aSangre;
const disponible = (BANDA_DER - BANDA_IZQ) - AIRE * 2;
const k = Number(process.env.ESCALA ?? Math.min(1, disponible / anchoSujeto));

const anchoFoto = Math.round(W * k);
const altoFoto = Math.round(H * k);
const foto = await sharp(recorte).resize(anchoFoto, altoFoto).png().toBuffer();

// Base: la misma escena, desenfocada y oscurecida. No un color plano.
const base = await sharp(recorte)
  .resize(W, H, { fit: 'cover' })
  .blur(55)
  .modulate({ brightness: BASE_BRILLO, saturation: 0.5 })
  .png()
  .toBuffer();
const tinte = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 10, g: 36, b: 67, alpha: BASE_TINTE } },
}).png().toBuffer();
const fondo = await sharp(base).composite([{ input: tinte, blend: 'over' }]).png().toBuffer();

/*
 * Colocación: el SUJETO centrado en la banda visible, no la foto en el
 * lienzo. Son cosas distintas, y la segunda lo deja descentrado en pantalla.
 */
const sujetoEnFoto = ((SUJETO_IZQ - ventanaIzq) + (SUJETO_DER - ventanaIzq)) / 2 * aSangre * k;
const izq = Math.round((BANDA_IZQ + BANDA_DER) / 2 - sujetoEnFoto);
const arr = Math.round((H - altoFoto) / 2);

/*
 * Molde pixel a pixel, por los cuatro bordes. Nada de apilar rectangulos con
 * `mix-blend-mode` en un SVG: sharp no lo soporta y el molde sale opaco, que
 * es como aparecieron cantos duros en la version de escritorio.
 */
const rampa = (d, ancho) => (ancho <= 0 ? 1 : Math.min(1, Math.max(0, d / ancho)));
const mascara = Buffer.alloc(anchoFoto * altoFoto * 4);
for (let y = 0; y < altoFoto; y++) {
  const v = rampa(y, PLUMA) * rampa(altoFoto - 1 - y, PLUMA);
  for (let x = 0; x < anchoFoto; x++) {
    const a = v * rampa(x, PLUMA) * rampa(anchoFoto - 1 - x, PLUMA);
    const i = (y * anchoFoto + x) * 4;
    mascara[i] = 255; mascara[i + 1] = 255; mascara[i + 2] = 255;
    mascara[i + 3] = Math.round(a * 255);
  }
}
const molde = await sharp(mascara, { raw: { width: anchoFoto, height: altoFoto, channels: 4 } })
  .png().toBuffer();

// `.png()` en todos los pasos: el origen es JPEG y sin esto el desvanecido se
// hornea en negro por falta de canal alfa.
const fotoSuave = await sharp(foto).composite([{ input: molde, blend: 'dest-in' }]).png().toBuffer();

await sharp(fondo)
  .composite([{ input: fotoSuave, left: izq, top: arr }])
  .webp({ quality: 80 })
  .toFile(SALIDA);

const sujetoIzqLienzo = Math.round(izq + (SUJETO_IZQ - ventanaIzq) * aSangre * k);
const sujetoDerLienzo = Math.round(izq + (SUJETO_DER - ventanaIzq) * aSangre * k);
const meta = await sharp(SALIDA).metadata();
console.log(`origen      ${org.width}x${org.height}`);
console.log(`ventana     x ${ventanaIzq}-${ventanaIzq + ventanaAncho} del original`);
console.log(`escala      ${k.toFixed(3)}  (foto ${anchoFoto}x${altoFoto}, en x ${izq}, y ${arr})`);
console.log(`banda       x ${BANDA_IZQ}-${BANDA_DER}`);
console.log(`sujeto      x ${sujetoIzqLienzo}-${sujetoDerLienzo}  ${sujetoIzqLienzo >= BANDA_IZQ && sujetoDerLienzo <= BANDA_DER ? 'DENTRO' : '*** FUERA ***'}`);
console.log(`salida      ${SALIDA}  ${meta.width}x${meta.height}`);
