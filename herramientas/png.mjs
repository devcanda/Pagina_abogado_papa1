/**
 * Lectura y escritura de PNG con solo la biblioteca estándar de Node.
 *
 * Se escribe a mano en vez de usar `sharp` o `pngjs` a propósito: esta
 * herramienta tiene que poder ejecutarse en cualquier máquina y en el servidor
 * sin instalar dependencias nativas, que son la primera fuente de problemas en
 * hosting compartido.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

const FIRMA = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const TABLA_CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** Devuelve {ancho, alto, canales, datos} con los píxeles ya sin filtrar. */
export function leerPNG(ruta) {
  const b = readFileSync(ruta);
  if (!b.subarray(0, 8).equals(FIRMA)) throw new Error(`No es un PNG: ${ruta}`);

  let pos = 8;
  const idat = [];
  let ancho = 0, alto = 0, profundidad = 0, tipoColor = 0;

  while (pos < b.length) {
    const largo = b.readUInt32BE(pos);
    const tipo = b.toString('ascii', pos + 4, pos + 8);
    const cuerpo = b.subarray(pos + 8, pos + 8 + largo);
    if (tipo === 'IHDR') {
      ancho = cuerpo.readUInt32BE(0);
      alto = cuerpo.readUInt32BE(4);
      profundidad = cuerpo[8];
      tipoColor = cuerpo[9];
      if (cuerpo[12] !== 0) throw new Error('PNG entrelazado no soportado');
    } else if (tipo === 'IDAT') {
      idat.push(cuerpo);
    } else if (tipo === 'IEND') break;
    pos += 12 + largo;
  }
  if (profundidad !== 8) throw new Error(`Profundidad ${profundidad} no soportada`);

  const canales = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipoColor];
  const crudo = inflateSync(Buffer.concat(idat));
  const anchoLinea = ancho * canales;
  const datos = Buffer.alloc(alto * anchoLinea);

  let o = 0;
  for (let y = 0; y < alto; y++) {
    const filtro = crudo[o++];
    const linea = crudo.subarray(o, o + anchoLinea);
    o += anchoLinea;
    const destino = y * anchoLinea;
    const previa = destino - anchoLinea;

    for (let x = 0; x < anchoLinea; x++) {
      const a = x >= canales ? datos[destino + x - canales] : 0;
      const bArr = y > 0 ? datos[previa + x] : 0;
      const c = y > 0 && x >= canales ? datos[previa + x - canales] : 0;
      let v = linea[x];
      if (filtro === 1) v += a;
      else if (filtro === 2) v += bArr;
      else if (filtro === 3) v += (a + bArr) >> 1;
      else if (filtro === 4) {
        const p = a + bArr - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - bArr), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? bArr : c;
      }
      datos[destino + x] = v & 0xff;
    }
  }
  return { ancho, alto, canales, datos };
}

/** Escribe RGBA sin filtrar. Suficiente para las imágenes de diferencias. */
export function escribirPNG(ruta, ancho, alto, rgba) {
  const anchoLinea = ancho * 4;
  const crudo = Buffer.alloc(alto * (anchoLinea + 1));
  for (let y = 0; y < alto; y++) {
    crudo[y * (anchoLinea + 1)] = 0;
    rgba.copy(crudo, y * (anchoLinea + 1) + 1, y * anchoLinea, (y + 1) * anchoLinea);
  }
  const trozo = (tipo, datos) => {
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(cuerpo));
    return Buffer.concat([largo, cuerpo, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  writeFileSync(ruta, Buffer.concat([
    FIRMA,
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]));
}
