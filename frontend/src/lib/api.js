/**
 * Cliente de la API de Node. Se ejecuta en el SERVIDOR durante `astro build`,
 * nunca en el navegador: el HTML final ya viaja con el contenido dentro.
 */
// Incluye el prefijo completo (…/api) para que el frontend no asuma dónde
// se montó la app en Passenger: eso lo decide API_BASE_PATH en el backend.
const BASE = (import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');

async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    headers: { Accept: 'application/json' },
    ...opciones,
  });

  if (respuesta.status === 404) return null;

  if (!respuesta.ok) {
    throw new Error(`API ${respuesta.status} en ${ruta}: ${await respuesta.text()}`);
  }

  const json = await respuesta.json();
  return json.data ?? json;
}

/** Una página por slug. Devuelve null si no existe (lo usa el 404 de Astro). */
export const obtenerPagina = (slug) => pedir(`/paginas/${encodeURIComponent(slug)}`);

/** Todas las páginas publicadas. Alimenta getStaticPaths(). */
export async function listarPaginas() {
  try {
    return (await pedir('/paginas')) ?? [];
  } catch (error) {
    // Un build no debe morir por una API caída: avisamos y generamos lo mínimo.
    console.error(`[build] No se pudo leer el índice de páginas: ${error.message}`);
    return [];
  }
}

/**
 * Una página con su composición de bloques publicada.
 * Devuelve null si no existe, para que la ruta pueda decidir qué hacer.
 */
export const obtenerPaginaConBloques = (slug) =>
  pedir(`/paginas/${encodeURIComponent(slug)}/bloques`);
