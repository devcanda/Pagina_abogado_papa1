import * as paginasRepo from '../repositories/paginas.repo.js';
import * as bloquesRepo from '../repositories/bloques.repo.js';
import { asyncHandler, noEncontrado } from '../utils/errors.js';

/** GET /api/paginas — índice ligero para getStaticPaths() y el sitemap. */
export const listar = asyncHandler(async (req, res) => {
  const paginas = await paginasRepo.listarPublicadas();
  res.json({ total: paginas.length, data: paginas });
});

/** GET /api/paginas/:slug — contenido completo de una página. */
export const obtenerPorSlug = asyncHandler(async (req, res) => {
  const pagina = await paginasRepo.buscarPorSlug(req.params.slug);
  if (!pagina) throw noEncontrado(`No existe la página "${req.params.slug}"`);

  // Astro consulta esto en build; el cache ayuda si algún día pasamos a SSR.
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json({ data: pagina });
});

/**
 * GET /api/paginas/:slug/bloques — la página con su composición publicada.
 *
 * Va aparte de `/:slug` a propósito: las páginas que todavía no usan bloques
 * siguen sirviéndose por el endpoint de siempre, sin cambiar de contrato.
 */
export const obtenerConBloques = asyncHandler(async (req, res) => {
  const pagina = await bloquesRepo.bloquesPublicados(req.params.slug);
  if (!pagina) throw noEncontrado(`No existe la página "${req.params.slug}"`);
  const medios = await bloquesRepo.mapaMedios();
  res.set('Cache-Control', 'no-store');
  res.json({ data: { ...pagina, medios } });
});
