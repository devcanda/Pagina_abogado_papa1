import { writeFile, rename, mkdir, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

/**
 * Escritura de las imágenes que sube el panel.
 *
 * El redimensionado y la conversión a WebP ocurren en el navegador del editor,
 * antes de subir. Aquí NO se confía en eso: se valida igualmente el tipo por
 * los bytes de cabecera y el tamaño, porque el cliente puede ser cualquiera.
 */

const MAXIMO_BYTES = 2 * 1024 * 1024;

// Firmas reales de archivo. La extensión del nombre no se mira nunca: un
// `.php` renombrado a `.webp` la pasaría sin problema.
const FIRMAS = [
  { tipo: 'webp', ext: 'webp', comprobar: (b) =>
      b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { tipo: 'png', ext: 'png', comprobar: (b) =>
      b.length > 8 && b.toString('hex', 0, 8) === '89504e470d0a1a0a' },
  { tipo: 'jpeg', ext: 'jpg', comprobar: (b) =>
      b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
];

/** Carpeta donde Apache sirve las imágenes. En local, `frontend/public/img`. */
export const carpetaMedios = () =>
  resolve(env.carpetaMedios ?? '../frontend/public/img');

/** Clave segura: solo lo que puede formar parte de un nombre de archivo. */
export function claveValida(clave) {
  return typeof clave === 'string' && /^[a-z0-9][a-z0-9-]{0,48}$/.test(clave);
}

function identificar(buffer) {
  const f = FIRMAS.find((x) => x.comprobar(buffer));
  if (!f) {
    throw new HttpError(400,
      'El archivo no es una imagen válida. Se aceptan WebP, PNG y JPEG.');
  }
  return f;
}

/** Dimensiones leídas del propio archivo, no de lo que diga el cliente. */
function dimensiones(buffer, tipo) {
  try {
    if (tipo === 'png') {
      return { ancho: buffer.readUInt32BE(16), alto: buffer.readUInt32BE(20) };
    }
    if (tipo === 'webp') {
      const formato = buffer.toString('ascii', 12, 16);
      if (formato === 'VP8X') {
        return {
          ancho: 1 + buffer.readUIntLE(24, 3),
          alto: 1 + buffer.readUIntLE(27, 3),
        };
      }
      if (formato === 'VP8L') {
        const b = buffer.readUInt32LE(21);
        return { ancho: 1 + (b & 0x3fff), alto: 1 + ((b >> 14) & 0x3fff) };
      }
      if (formato === 'VP8 ') {
        return {
          ancho: buffer.readUInt16LE(26) & 0x3fff,
          alto: buffer.readUInt16LE(28) & 0x3fff,
        };
      }
    }
    if (tipo === 'jpeg') {
      let i = 2;
      while (i < buffer.length - 9) {
        if (buffer[i] !== 0xff) { i++; continue; }
        const marca = buffer[i + 1];
        // SOF0..SOF15, saltando los que no llevan dimensiones.
        if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) {
          return { alto: buffer.readUInt16BE(i + 5), ancho: buffer.readUInt16BE(i + 7) };
        }
        i += 2 + buffer.readUInt16BE(i + 2);
      }
    }
  } catch {
    // Un archivo malformado no debe tumbar la subida: se guarda sin medidas.
  }
  return { ancho: null, alto: null };
}

/**
 * Guarda la imagen con el nombre que decide el SERVIDOR a partir de la clave.
 * El nombre que envía el cliente se descarta por completo.
 *
 * La escritura es atómica: primero un temporal, luego un renombrado. Así
 * ningún visitante llega a ver un archivo a medio escribir.
 */
export async function guardar({ clave, buffer }) {
  if (!claveValida(clave)) throw new HttpError(400, 'Clave de imagen no válida');
  if (!buffer?.length) throw new HttpError(400, 'No se recibió ningún archivo');
  if (buffer.length > MAXIMO_BYTES) {
    throw new HttpError(413,
      `La imagen pesa ${Math.round(buffer.length / 1024)} KB y el máximo son ${MAXIMO_BYTES / 1024} KB.`);
  }

  const { tipo, ext } = identificar(buffer);
  const { ancho, alto } = dimensiones(buffer, tipo);

  const carpeta = carpetaMedios();
  await mkdir(carpeta, { recursive: true });

  const nombre = `${clave}.${ext}`;
  const destino = join(carpeta, nombre);
  const temporal = join(carpeta, `.${clave}.${randomBytes(6).toString('hex')}.tmp`);

  await writeFile(temporal, buffer);
  try {
    await rename(temporal, destino);
  } catch (err) {
    await unlink(temporal).catch(() => {});
    throw err;
  }

  return { archivo: `/img/${nombre}`, ancho, alto, bytes: buffer.length, tipo };
}

export const LIMITE_BYTES = MAXIMO_BYTES;
