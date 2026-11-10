-- ============================================================================
--  004 — Los bloques guardan la CLAVE del hueco de imagen, no la ruta
--
--  Si guardaran la ruta, sustituir una imagen desde el panel no cambiaría nada
--  en el sitio: el archivo nuevo puede tener otra extensión (.svg -> .webp) y
--  el bloque seguiría apuntando al viejo. La clave no cambia nunca.
-- ============================================================================

BEGIN;

-- Campos de imagen de primer nivel.
UPDATE bloques
   SET datos = jsonb_set(datos, '{imagen}',
       to_jsonb(regexp_replace(datos->>'imagen', '^/img/(.+)[.][a-z]+$', '\1')))
 WHERE datos ? 'imagen'
   AND datos->>'imagen' LIKE '/img/%';

-- Campos de imagen dentro de las listas de tarjetas.
UPDATE bloques
   SET datos = jsonb_set(datos, '{tarjetas}', (
         SELECT jsonb_agg(
                  CASE WHEN t->>'imagen' LIKE '/img/%'
                       THEN jsonb_set(t, '{imagen}',
                            to_jsonb(regexp_replace(t->>'imagen', '^/img/(.+)[.][a-z]+$', '\1')))
                       ELSE t END
                  ORDER BY orden)
           FROM jsonb_array_elements(datos->'tarjetas') WITH ORDINALITY AS a(t, orden)))
 WHERE datos ? 'tarjetas';

COMMIT;
