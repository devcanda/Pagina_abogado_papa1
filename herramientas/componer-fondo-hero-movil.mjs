/**
 * Compone el fondo VERTICAL de una lámina de la cabecera (800x1270).
 *
 *   ORIGEN=../docs/imagenes-origen/fondo-perito-despacho.jpg \
 *   CORTE=0.38 VELO=0.62 HASTA=0.74 FIN=0.88 SALIDA=s3-movil.webp \
 *   node componer-fondo-hero-movil.mjs
 *
 * En móvil la franja es alta y estrecha: `cover` sobre la imagen apaisada solo
 * deja ver entre el 32 % y el 39 % del ancho, y ahí no cabe la escena. Por eso
 * cada lámina lleva su propio archivo vertical, servido con `<picture>`.
 *
 * La tira se recorta del original, se escala al ancho del lienzo y se PEGA
 * ABAJO; lo que queda arriba lo cubre la base borrosa. Encima va un velo
 * vertical, porque el texto ocupa todo el ancho y debajo de él la foto puede
 * ser blanca.
 */
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const ORIGEN = process.env.ORIGEN
  ?? new URL('../docs/imagenes-origen/fondo-perito-despacho.jpg', import.meta.url).pathname.replace(/^\//, '');
const W = 800; const H = 1270;
const CORTE = Number(process.env.CORTE ?? 0.38);   // desde dónde se recorta, en tanto por uno
/*
 * `ALTO` recorta por ABAJO, y es el único mando que baja un objeto dentro del
 * encuadre. La tira va pegada al borde inferior, así que lo que haya debajo
 * del elemento importante —aquí la mesa y los planos— lo empuja hacia arriba,
 * justo detrás del botón. Quitando ese sobrante, el objeto cae al fondo.
 */
const ALTO = Number(process.env.ALTO ?? 1);        // alto del original que se conserva
const PLUMA = Number(process.env.PLUMA ?? 0.20);   // desvanecido superior de la tira
const VELO = Number(process.env.VELO ?? 0.62);     // alfa del velo vertical
const HASTA = Number(process.env.HASTA ?? 0.74);   // hasta dónde va a plena fuerza
const FIN = Number(process.env.FIN ?? 0.88);       // dónde termina de irse
const SALIDA = process.env.SALIDA ?? 'fondo-movil.webp';

const org = await sharp(ORIGEN).metadata();
const base = await sharp(ORIGEN).resize(W, H, { fit: 'cover' }).blur(55)
  .modulate({ brightness: 0.52, saturation: 0.55 }).png().toBuffer();
const tinte = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 10, g: 36, b: 67, alpha: 0.56 } } })
  .png().toBuffer();
const fondo = await sharp(base).composite([{ input: tinte }]).png().toBuffer();

// La tira: del corte al borde derecho, alto completo, escalada al ancho.
const x0 = Math.round(org.width * CORTE);
const cw = org.width - x0;
const ch = Math.round(org.height * ALTO);
const th = Math.round(ch * (W / cw));
// `.png()` en cada paso: el origen es JPEG y sin esto se pierde el alfa.
let tira = await sharp(ORIGEN).extract({ left: x0, top: 0, width: cw, height: ch })
  .resize(W, th).ensureAlpha().png().toBuffer();
const plumaPx = Math.max(1, Math.round(th * PLUMA));
tira = await sharp(tira).composite([{
  input: await sharp(Buffer.from(`<svg width="${W}" height="${th}"><defs>
    <linearGradient id="v" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="${(plumaPx / th).toFixed(4)}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient></defs><rect width="${W}" height="${th}" fill="url(#v)"/></svg>`)).png().toBuffer(),
  blend: 'dest-in',
}]).png().toBuffer();

// Velo vertical: el texto ocupa todo el ancho, así que lo de debajo se apaga.
const velo = await sharp(Buffer.from(`<svg width="${W}" height="${H}"><defs>
  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#0a2443" stop-opacity="${VELO}"/>
    <stop offset="${HASTA}" stop-color="#0a2443" stop-opacity="${VELO}"/>
    <stop offset="${FIN}" stop-color="#0a2443" stop-opacity="0"/>
    <stop offset="1" stop-color="#0a2443" stop-opacity="0"/>
  </linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`)).png().toBuffer();

await sharp(fondo)
  .composite([{ input: tira, left: 0, top: H - th }, { input: velo }])
  .webp({ quality: 78 }).toFile(SALIDA);
const m = await sharp(SALIDA).metadata();
console.log(`${SALIDA}  ${m.width}x${m.height}  tira ${W}x${th} pegada abajo (hueco de ${H - th}px arriba)`);
