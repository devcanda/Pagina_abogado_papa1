import { query } from '../config/db.js';

/**
 * Mapa clave -> ruta actual de cada imagen.
 *
 * Los bloques guardan la CLAVE del hueco, no la ruta. Si guardaran la ruta,
 * sustituir una imagen desde el panel no cambiaría nada: el archivo nuevo
 * puede tener otra extensión y el bloque seguiría apuntando al viejo.
 */
export async function mapaMedios() {
  const { rows } = await query('SELECT clave, archivo, alt FROM medios');
  return Object.fromEntries(rows.map((m) => [m.clave, { archivo: m.archivo, alt: m.alt }]));
}

/**
 * Bloques de la revisión PUBLICADA de una página.
 * Devuelve `null` si la página no existe o nunca se publicó, para que el
 * frontend pueda distinguir "no hay página" de "página vacía".
 */
export async function bloquesPublicados(slug) {
  const { rows } = await query(
    `SELECT p.id, p.slug, p.titulo, p.meta_descripcion, p.imagen_hero,
            p.es_landing_page, p.revision_publicada,
            COALESCE(
              (SELECT json_agg(json_build_object(
                        'id', b.id, 'tipo', b.tipo, 'orden', b.orden,
                        'datos', b.datos, 'variantes', b.variantes)
                      ORDER BY b.orden)
                 FROM bloques b
                WHERE b.revision_id = p.revision_publicada
                  -- Un bloque apagado desde el panel no se sirve. Sigue en la
                  -- revisión con su orden y su contenido: volver a encenderlo
                  -- es un clic, no reconstruirlo.
                  AND b.visible = TRUE),
              '[]'::json
            ) AS bloques
       FROM paginas p
      WHERE p.slug = $1 AND p.publicado = TRUE
      LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

/** Bloques de una revisión concreta. Lo usa la vista previa de borradores. */
export async function bloquesDeRevision(revisionId) {
  const { rows } = await query(
    `SELECT b.id, b.tipo, b.orden, b.datos, b.variantes
       FROM bloques b WHERE b.revision_id = $1 ORDER BY b.orden`,
    [revisionId],
  );
  return rows;
}

/**
 * Bloques de la portada tal como los ve el panel: con su rótulo, su estado y
 * las CLAVES de imagen que menciona cada uno.
 *
 * Las claves se sacan recorriendo el propio JSON del bloque y cruzándolo con
 * la tabla `medios`. No hay ninguna tabla de asignación que mantener, así que
 * el panel enseña siempre la estructura real: el día que una imagen cambie de
 * bloque, aparecerá en el bloque nuevo sin que nadie actualice nada.
 *
 * Se devuelven los bloques de la revisión PUBLICADA, visibles u ocultos: una
 * ficha apagada tiene que seguir a la vista o nadie podrá volver a encenderla.
 */
export async function bloquesParaPanel(slug) {
  const { rows } = await query(
    `SELECT b.id, b.tipo, b.orden, b.rotulo, b.visible, b.datos
       FROM bloques b
       JOIN paginas p ON p.revision_publicada = b.revision_id
      WHERE p.slug = $1
      ORDER BY b.orden`,
    [slug],
  );
  return rows;
}

export async function cambiarVisibilidad({ id, visible }) {
  const { rows } = await query(
    `UPDATE bloques SET visible = $2 WHERE id = $1
      RETURNING id, tipo, rotulo, visible`,
    [id, visible],
  );
  return rows[0] ?? null;
}

export async function buscarBloque(id) {
  const { rows } = await query(
    'SELECT id, tipo, rotulo, visible FROM bloques WHERE id = $1', [id]);
  return rows[0] ?? null;
}

/**
 * Claves de imagen que menciona un bloque, en orden de aparición.
 *
 * Recorre en recursión porque hay campos de grupo —las láminas del slider, las
 * tarjetas de servicios— con las imágenes anidadas dentro.
 *
 * El criterio es «cadena que coincide EXACTAMENTE con una clave existente».
 * Para que un texto libre se colara tendría que ser idéntico a una clave de la
 * biblioteca; las claves son `^[a-z0-9][a-z0-9-]{0,48}$` y los bloques guardan
 * la clave y no la ruta, así que la coincidencia es exacta.
 */
export function clavesDeImagen(datos, clavesConocidas) {
  const encontradas = [];
  const recorrer = (valor) => {
    if (typeof valor === 'string') {
      if (clavesConocidas.has(valor) && !encontradas.includes(valor)) encontradas.push(valor);
    } else if (Array.isArray(valor)) {
      valor.forEach(recorrer);
    } else if (valor && typeof valor === 'object') {
      Object.values(valor).forEach(recorrer);
    }
  };
  recorrer(datos);
  return encontradas;
}

/** El bloque entero, con sus datos. Lo necesita el guardado para conservar imágenes. */
export async function buscarBloqueCompleto(id) {
  const { rows } = await query(
    'SELECT id, tipo, orden, rotulo, visible, datos, variantes FROM bloques WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function guardarContenido({ id, datos, variantes }) {
  const { rows } = await query(
    `UPDATE bloques SET datos = $2, variantes = $3 WHERE id = $1
      RETURNING id, tipo, rotulo, visible, datos, variantes`,
    [id, JSON.stringify(datos), JSON.stringify(variantes)],
  );
  return rows[0] ?? null;
}
