/**
 * Compone el fondo de ESCRITORIO de una lámina de la cabecera.
 *
 *   ORIGEN=../docs/imagenes-origen/fondo-perito-despacho.jpg  *   ESCALA=0.87 PLUMA=100 DESDE=0.48 HASTA=0.62 SALIDA=s3.webp  *   node componer-fondo-hero.mjs
 *
 * La foto nítida va ANCLADA ABAJO Y A LA DERECHA sobre una base borrosa de la
 * misma escena. `ESCALA` la encoge: a 1 ocupa el lienzo entero y el navegador,
 * que a 1920px solo enseña la banda y 156-924, le corta la frente al abogado.
 * Encogerla mete la cabeza dentro de esa banda sin moverla de la derecha.
 *
 * Los bordes izquierdo y superior de la foto se DESVANECEN sobre la base: un
 * corte seco deja una línea visible, igual que pasó en la lámina 1.
 */
// `sharp` ya viene con Astro: es herramienta de AUTORÍA, no del servidor.
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const ORIGEN = process.env.ORIGEN
  ?? new URL('../docs/imagenes-origen/fondo-confianza-despacho.jpg', import.meta.url).pathname.replace(/^\//, '');
// `y` de lo más alto que no se puede perder —la coronilla—, en el ORIGINAL.
const FRENTE = Number(process.env.FRENTE ?? 103);
const W = 1920; const H = 1080;
const k = Number(process.env.ESCALA ?? 0.87);
const SALIDA = process.env.SALIDA ?? `s2-k${Math.round(k * 100)}.webp`;
// Fundido horizontal: la foto no puede asomar antes de que acabe el texto.
const DESDE = Number(process.env.DESDE ?? 0.46);
const HASTA = Number(process.env.HASTA ?? 0.66);
const PLUMA_ARRIBA = Number(process.env.PLUMA ?? 150);   // px de desvanecido superior
/*
 * `SUBIR` despega la foto del borde inferior. Es el único mando que mete en
 * la banda visible lo que haya al PIE de la foto —en la lámina 3, los planos
 * sobre la mesa—: pegada abajo, ese pie cae siempre en los 133px que el
 * navegador recorta, da igual la escala.
 *
 * El hueco que queda debajo lo tapa la base, y por eso lleva su propio
 * desvanecido: a 1440px y por debajo se ve el lienzo entero y un canto seco
 * ahí se nota.
 */
const SUBIR = Number(process.env.SUBIR ?? 0);
const PLUMA_ABAJO = Number(process.env.PLUMA_ABAJO ?? 90);

// Base: la misma escena, muy desenfocada, oscurecida y teñida de navy. No un
// color plano: el bloque macizo fue justo la queja de la lámina 1.
const base = await sharp(ORIGEN)
  .resize(W, H, { fit: 'cover' })
  .blur(55)
  .modulate({ brightness: 0.52, saturation: 0.55 })
  .toBuffer();
const tinte = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 10, g: 36, b: 67, alpha: 0.56 } } })
  .png().toBuffer();
const fondo = await sharp(base).composite([{ input: tinte, blend: 'over' }]).toBuffer();

// La foto, encogida y pegada al borde derecho e inferior.
const fw = Math.round(W * k);
// Del propio archivo: no todas las fotos vienen a 2752x1536.
const org = await sharp(ORIGEN).metadata();
const fh = Math.round(org.height * (W / org.width) * k);
const izq = W - fw;
const arr = H - fh - SUBIR;
/*
 * `.png()` en TODOS los pasos intermedios de la foto, no solo al final.
 * El origen es un JPEG y sharp devuelve el formato de entrada: sin esto,
 * `toBuffer()` da un JPEG, que no tiene alfa, y el desvanecido se hornea en
 * NEGRO en vez de dejar ver la base. Se ve como un bloque negro a la
 * izquierda del abogado.
 */
let foto = await sharp(ORIGEN).resize(fw, fh).ensureAlpha().png().toBuffer();

/*
 * El degradado va en el ALFA (`stop-opacity`), no en el color: `dest-in`
 * multiplica por el alfa del molde, y un degradado de negro a blanco es opaco
 * de punta a punta, así que no recortaría nada.
 */
const mascara = (svg) => sharp(Buffer.from(svg)).png().toBuffer();
// Horizontal, en coordenadas de la FOTO (el porcentaje es del lienzo).
const x0 = Math.max(0, Math.round(W * DESDE) - izq);
const x1 = Math.max(1, Math.round(W * HASTA) - izq);
foto = await sharp(foto).composite([{
  input: await mascara(`<svg width="${fw}" height="${fh}"><defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="${(x0 / fw).toFixed(4)}" stop-color="#fff" stop-opacity="0"/>
      <stop offset="${(x1 / fw).toFixed(4)}" stop-color="#fff" stop-opacity="1"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </linearGradient></defs>
    <rect width="${fw}" height="${fh}" fill="url(#g)"/></svg>`),
  blend: 'dest-in',
}]).png().toBuffer();
// Vertical abajo, solo si se ha despegado del borde inferior.
if (SUBIR > 0 && PLUMA_ABAJO > 0) {
  foto = await sharp(foto).composite([{
    input: await mascara(`<svg width="${fw}" height="${fh}"><defs>
      <linearGradient id="b" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="1"/>
        <stop offset="${(1 - PLUMA_ABAJO / fh).toFixed(4)}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient></defs>
      <rect width="${fw}" height="${fh}" fill="url(#b)"/></svg>`),
    blend: 'dest-in',
  }]).png().toBuffer();
}
// Vertical arriba, solo si la foto no llega al borde de arriba.
if (arr > 0 && PLUMA_ARRIBA > 0) {
  foto = await sharp(foto).composite([{
    input: await mascara(`<svg width="${fw}" height="${fh}"><defs>
      <linearGradient id="v" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="${(PLUMA_ARRIBA / fh).toFixed(4)}" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="1"/>
      </linearGradient></defs>
      <rect width="${fw}" height="${fh}" fill="url(#v)"/></svg>`),
    blend: 'dest-in',
  }]).png().toBuffer();
}

await sharp(fondo).composite([{ input: foto, left: izq, top: arr }])
  .webp({ quality: 76 }).toFile(SALIDA);

const m = await sharp(SALIDA).metadata();
// Dónde queda la frente: en el original está en y≈102.
const frente = Math.round(arr + FRENTE * (W / org.width) * k);
console.log(`${SALIDA}  ${m.width}x${m.height}  ${Math.round(m.size / 1024)} KB`);
console.log(`  foto ${fw}x${fh} en (${izq},${arr}) · escala ${k}`);
/*
 * La banda que de verdad se ve a 1920px, medida en la página con
 * `encuadre.mjs`. Cambió de 156-924 a 133-947 el día que la capa de fondo se
 * estiró para cubrir la fila de mandos: la capa es más alta, así que `cover`
 * recorta menos.
 */
const BANDA = [133, 947];
const pie = Math.round(arr + fh);
console.log(`  frente en y=${frente}  (banda visible ${BANDA[0]}-${BANDA[1]} → `
  + `${frente > BANDA[0] ? `${frente - BANDA[0]}px de aire` : 'CORTADA'})`);
console.log(`  pie de la foto en y=${pie}  (${pie <= BANDA[1] ? 'dentro' : `${pie - BANDA[1]}px por debajo del corte`})`);
