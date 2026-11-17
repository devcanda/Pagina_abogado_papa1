/**
 * Prepara los logotipos de los clientes para la franja «Nuestros clientes».
 *
 *   node herramientas/preparar-logos-clientes.mjs <origen> <destino> [...]
 *   node herramientas/preparar-logos-clientes.mjs            (los siete de serie)
 *
 * ── Por qué una herramienta y no el panel ─────────────────────────────────
 * Lo mismo que con los avales del perito: estos archivos llegan una vez, de la
 * web anterior, y hay que tratarlos antes. Es autoría, no una dependencia de
 * ejecución; el panel sigue redimensionando en el navegador.
 *
 * ── Lo que hace a cada uno, en orden ──────────────────────────────────────
 * 1. **Quita el VELO.** Los originales no son transparentes del todo: llevan
 *    blanco a alfa ~38 cubriendo el rectangulo entero. Sobre el navy de la
 *    franja eso no se ve como «nada», se ve como un recuadro palido detras de
 *    cada marca.
 * 2. **Recorta** lo transparente que sobra alrededor.
 * 3. **Coloca con AREA OPTICA igualada** en el lienzo de 320x160.
 * 4. Guarda WebP **con canal alfa**: la tinta es blanca y tiene que servir
 *    sobre cualquier fondo oscuro.
 */
import { argv } from 'node:process';
const { default: sharp } = await import(new URL('../frontend/node_modules/sharp/lib/index.js', import.meta.url).href);

const ANCHO = 320;
const ALTO = 160;
// Margen interior, para que dos logotipos seguidos no se toquen.
const MARGEN = 0.04;
/*
 * AREA optica de cada logotipo dentro del lienzo, en pixeles cuadrados.
 *
 * Igualar el AREA y no la ALTURA. Aqui importa mas que en los avales del
 * perito: alli las proporciones iban de 1,38 a 2,90 y aqui van de **1,00**
 * (Camara de Comercio de Tulua, practicamente cuadrada) a **3,94** (Dixtrital,
 * una tira). Igualando la altura, Dixtrital pesaria cuatro veces mas que la
 * Camara; contenidos a secas en el mismo lienzo, al reves.
 *
 * 23000 NO es un numero redondo y no puede serlo. Con el margen del 4% el
 * hueco util es 307x154, asi que:
 *   · la pieza cuadrada pide  sqrt(A) <= 154        ->  A <= 23716
 *   · la mas apaisada pide    sqrt(A*3,94) <= 307   ->  A <= 23925
 * El tope lo marca la CUADRADA, no la apaisada, que es justo lo contrario de
 * lo que se supondria mirando la tabla.
 */
const AREA = 23000;

/**
 * Reescala el canal alfa para que el velo de fondo pase a transparente
 * CONSERVANDO el antialiasing de los bordes.
 *
 * El suelo se mide en el BORDE del lienzo, que es fondo seguro: se toma la
 * mediana del alfa de la primera y la ultima fila y columna. Fijarlo a mano
 * seria adivinar, y basta con que un archivo llegue con otro velo para que el
 * numero deje de valer.
 *
 * NO se usa un umbral duro (`a < 64 -> 0`). Eso se come la rampa de los
 * bordes de cada letra y el logotipo sale dentado: en una marca ajena, con
 * tipografias finas, se nota a simple vista.
 */
const quitarVelo = (datos, ancho, alto) => {
  const borde = [];
  for (let x = 0; x < ancho; x++) {
    borde.push(datos[(x) * 4 + 3]);
    borde.push(datos[(x + (alto - 1) * ancho) * 4 + 3]);
  }
  for (let y = 0; y < alto; y++) {
    borde.push(datos[(y * ancho) * 4 + 3]);
    borde.push(datos[(ancho - 1 + y * ancho) * 4 + 3]);
  }
  borde.sort((a, b) => a - b);
  const suelo = borde[Math.floor(borde.length / 2)];
  // Un poco por encima de la mediana: el velo no es perfectamente uniforme.
  const corte = Math.min(250, suelo + 6);
  if (corte <= 0) return { datos, suelo, corte };
  const escala = 255 / (255 - corte);
  for (let p = 0; p < ancho * alto; p++) {
    const a = datos[p * 4 + 3];
    datos[p * 4 + 3] = a <= corte ? 0 : Math.min(255, Math.round((a - corte) * escala));
  }
  return { datos, suelo, corte };
};

/*
 * Alfa a partir del cual un pixel cuenta como TINTA y no como resplandor.
 *
 * 128 es la mitad: por debajo, el pixel deja pasar mas fondo que dibujo. No es
 * una cifra fina —el salto entre el halo (alfa bajo) y el trazo (alfa 255) es
 * abrupto en estos archivos—, pero conviene no bajarla: a 64 vuelve a entrar
 * parte del resplandor y la igualacion se desvia otra vez.
 */
const UMBRAL_TINTA = 128;
/* Pixeles de margen que se dejan alrededor, para no cortar el antialiasing. */
const SANGRADO = 3;

/** Caja que ocupa la tinta solida, con un pequeno sangrado. */
const cajaDeTinta = (datos, ancho, alto) => {
  let x0 = ancho, y0 = alto, x1 = -1, y1 = -1;
  for (let p = 0; p < ancho * alto; p++) {
    if (datos[p * 4 + 3] < UMBRAL_TINTA) continue;
    const x = p % ancho;
    const y = (p - x) / ancho;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  /* Un archivo sin tinta solida se deja entero: mejor eso que recortar a cero. */
  if (x1 < 0) return { left: 0, top: 0, width: ancho, height: alto };
  const left = Math.max(0, x0 - SANGRADO);
  const top = Math.max(0, y0 - SANGRADO);
  return {
    left,
    top,
    width: Math.min(ancho - left, x1 - x0 + 1 + SANGRADO * 2),
    height: Math.min(alto - top, y1 - y0 + 1 + SANGRADO * 2),
  };
};

export const prepararLogo = async (origen, destino) => {
  const base = sharp(origen).ensureAlpha();
  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true });
  const { suelo, corte } = quitarVelo(data, info.width, info.height);

  /*
   * Recorte a la TINTA, no a lo que quede de fondo.
   *
   * Aqui habia un `.trim({ threshold: 1 })`, y fue un error que se vio en la
   * pagina: estas marcas llevan un RESPLANDOR suave alrededor que sobrevive a
   * la limpieza del velo, asi que el recorte se quedaba con el halo y el area
   * optica se igualaba sobre EL HALO. Medido en los archivos publicados: las
   * cajas con halo quedaban iguales (x1,01) mientras la tinta de verdad iba de
   * una a otra **x2,23 en area y x2,86 en altura**. Carmelita se veia al 142%
   * y Dixtrital al 64%. Lo noto el cliente, no la herramienta.
   *
   * Ahora la caja se calcula sobre el alfa SOLIDO (>= UMBRAL_TINTA) y se le
   * deja un sangrado de unos pocos pixeles para no cortar el antialiasing del
   * borde. El halo que quede fuera se descarta: no es dibujo, y pesaba en la
   * cuenta como si lo fuera.
   */
  const caja = cajaDeTinta(data, info.width, info.height);
  const recortado = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract(caja)
    .png()
    .toBuffer({ resolveWithObject: true });

  const util = { ancho: Math.round(ANCHO * (1 - MARGEN * 2)), alto: Math.round(ALTO * (1 - MARGEN * 2)) };
  const { width: tw, height: th } = recortado.info;

  /*
   * Escala por area, SUJETA al lienzo. El tope no es un detalle: sin el, una
   * tira de 3,94:1 se saldria por los lados al pedirle su area.
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
    velo: `suelo ${suelo} corte ${corte}`,
    recorte: `${tw}x${th}`,
    proporcion: (tw / th).toFixed(2),
    colocado: `${dest.ancho}x${dest.alto}`,
    area: Math.round(dest.ancho * dest.alto),
  };
};

/* Los siete de serie, en el orden en que se publican. */
const SERIE = [
  ['Cliente_camara_1.png', 'cliente-1.webp'],
  ['Cliente_ofies_1.png', 'cliente-2.webp'],
  ['Cliente_tradex_1.png', 'cliente-3.webp'],
  ['cliente_carmelita_w.png', 'cliente-4.webp'],
  ['cliente_dixtrital_w.png', 'cliente-5.webp'],
  ['cliente_dolormed_3.png', 'cliente-6.webp'],
  ['cliente_redes_w.png', 'cliente-7.webp'],
];

const pares = argv.slice(2).length
  ? argv.slice(2)
  : SERIE.flatMap(([o, d]) => [
      new URL(`../docs/contenido-wordpress/imagenes/${o}`, import.meta.url).pathname.replace(/^\//, ''),
      new URL(`../frontend/public/img/${d}`, import.meta.url).pathname.replace(/^\//, ''),
    ]);

for (let i = 0; i < pares.length; i += 2) {
  const r = await prepararLogo(pares[i], pares[i + 1]);
  console.log(
    `${pares[i + 1].split('/').pop().padEnd(16)} origen ${r.origen}  velo[${r.velo}]  tinta ${r.recorte} (${r.proporcion}:1)  ->  ${r.colocado}  area ${r.area}`,
  );
}
