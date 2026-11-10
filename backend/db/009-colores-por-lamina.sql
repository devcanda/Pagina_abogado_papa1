-- 009 · Cada lámina del slider lleva sus propios colores de texto
--
-- Antes `colorTitulo` y `colorTexto` vivían solo en el bloque, así que los
-- tres titulares compartían color a la fuerza. Son tres mensajes a tres
-- públicos y cada uno lleva ya su propia foto; no hay razón para que no
-- lleven su propio color.
--
-- Los campos del bloque pasan a ser RESERVA (solo valen si no hay láminas),
-- igual que `titulo` o `imagen`. Para que el panel y la página no se
-- contradigan, el color que hubiera en el bloque se copia DENTRO de cada
-- lámina: si se dejara implícito, el componente seguiría usándolo por
-- herencia mientras el panel enseñaría el valor por defecto, y quien editara
-- vería un color distinto del que está publicado.
--
-- Donde no hubiera nada se escribe el valor que el bloque ya pintaba, que es
-- el que el componente usaba por omisión. Así la migración no cambia ni un
-- píxel: solo vuelve explícito lo que estaba implícito.

BEGIN;

UPDATE bloques AS b
   SET datos = jsonb_set(
         b.datos,
         '{laminas}',
         (
           SELECT COALESCE(jsonb_agg(
                    lamina
                    || jsonb_build_object(
                         'colorTitulo', COALESCE(
                           NULLIF(lamina ->> 'colorTitulo', ''),
                           NULLIF(b.datos ->> 'colorTitulo', ''),
                           '#ffffff'),
                         'colorTexto', COALESCE(
                           NULLIF(lamina ->> 'colorTexto', ''),
                           NULLIF(b.datos ->> 'colorTexto', ''),
                           '#dce8f5')
                       )
                    ORDER BY orden
                  ), '[]'::jsonb)
             FROM jsonb_array_elements(b.datos -> 'laminas')
                  WITH ORDINALITY AS t(lamina, orden)
         )
       )
 WHERE b.tipo = 'cabecera'
   AND jsonb_typeof(b.datos -> 'laminas') = 'array'
   AND jsonb_array_length(b.datos -> 'laminas') > 0;

COMMIT;

-- Comprobación: las tres láminas de la portada deben salir con sus dos colores.
--   SELECT jsonb_pretty(datos -> 'laminas') FROM bloques WHERE tipo = 'cabecera';
