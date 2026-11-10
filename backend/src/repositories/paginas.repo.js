import { query } from '../config/db.js';

// Columnas que el frontend necesita. Evitamos SELECT * para que un cambio de
// esquema no filtre campos internos al cliente sin que nadie lo note.
const CAMPOS = `
  id, slug, titulo, contenido, imagen_hero, es_landing_page,
  meta_descripcion, actualizado_en
`;

export async function buscarPorSlug(slug) {
  const { rows } = await query(
    `SELECT ${CAMPOS} FROM paginas WHERE slug = $1 AND publicado = TRUE LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

/** Lista ligera: alimenta getStaticPaths() de Astro y el sitemap. */
export async function listarPublicadas() {
  const { rows } = await query(
    `SELECT id, slug, titulo, es_landing_page, meta_descripcion, actualizado_en
       FROM paginas
      WHERE publicado = TRUE
      ORDER BY es_landing_page ASC, slug ASC`,
  );
  return rows;
}
