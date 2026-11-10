/**
 * Catálogo cerrado de iconos para las tarjetas.
 *
 * El panel ofrece esta lista y nada más: el editor elige uno por su nombre,
 * nunca pega un SVG. Así no puede meter marcado arbitrario en la página.
 *
 * Para añadir uno nuevo: una entrada aquí y aparece solo en el selector.
 */
export const ICONOS = {
  "maletin": {
    "nombre": "Maletín",
    "trazo": "M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2m0 4h4V4h-4z"
  },
  "columnas": {
    "nombre": "Columnas",
    "trazo": "M12 2 2 7v2h20V7zM4 11v7H2v2h20v-2h-2v-7h-2v7h-3v-7h-2v7H8v-7z"
  },
  "familia": {
    "nombre": "Familia",
    "trazo": "M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6M5 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m14 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M12 12c2.7 0 5 1.6 5 3.6V20H7v-4.4c0-2 2.3-3.6 5-3.6M4 15.5c.4-.5 1-1 1.7-1.3A6 6 0 0 0 5 17v3H1v-2.3c0-1.2 1.3-2.2 3-2.2m16 0c1.7 0 3 1 3 2.2V20h-4v-3c0-1-.3-2-.7-2.8.7.3 1.3.8 1.7 1.3"
  },
  "balanza": {
    "nombre": "Balanza",
    "trazo": "M14.1 2.6 9.9 6.8l1.4 1.4-5.7 5.7-1.4-1.4-1.4 1.4 5.7 5.7 1.4-1.4-1.4-1.4 5.7-5.7 1.4 1.4 4.2-4.2zM3 20h10v2H3z"
  },
  "casa": {
    "nombre": "Casa",
    "trazo": "M12 3 2 11h3v10h5v-6h4v6h5V11h3zm0 2.7 5 4V19h-1v-6H8v6H7v-9.3z"
  },
  "documento": {
    "nombre": "Documento",
    "trazo": "M4 2h12l4 4v16H4zm11 1.5V7h3.5zM7 10h10v2H7zm0 4h10v2H7zm0 4h6v2H7z"
  }
};

export const CLAVES_ICONO = Object.keys(ICONOS);

/** Trazo de un icono; cae a la balanza si la clave no existe. */
export const trazoIcono = (clave) =>
  (ICONOS[clave] ?? ICONOS.balanza).trazo;
