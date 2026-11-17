-- 012 · Bloque de redes sociales en la portada
--
-- Sustituye en la portada a la franja de cifras y preguntas frecuentes por una
-- que enseña la actividad en redes: los últimos vídeos de TikTok en vertical,
-- un vídeo de YouTube apaisado y la fanpage de Facebook.
--
-- Petición del cliente (11-11-2026). Ver `specs/006-redes-sociales/`.
--
-- ── El bloque viejo se OCULTA, no se borra ────────────────────────────────
-- `cifrasYPreguntas` guarda las respuestas a «¿cuánto cuesta la primera
-- consulta?» y «¿cómo se acuerdan los honorarios?»: texto que costó escribir y
-- que responde justo las dudas que frenan a alguien antes de llamar a un
-- abogado. Apagarlo deja la ficha a la vista en el panel, atenuada, y volver a
-- encenderlo es un clic. Borrarlo perdería el texto para siempre.
--
-- ── Por qué ocupa el mismo orden ──────────────────────────────────────────
-- La portada alterna franjas claras y oscuras, y esa alternancia es la que le
-- da ritmo. El bloque que se va es claro y el que entra también, así que
-- ponerlo en su sitio mantiene la secuencia; colocarlo al final dejaría dos
-- oscuras seguidas.
--
-- ── Las URLs de los perfiles NO están aquí ────────────────────────────────
-- TikTok y Facebook se leen de `frontend/src/data/contacto.js`, que es la
-- fuente única de los datos de contacto y de donde los toma también la barra
-- superior. Solo el vídeo de YouTube es contenido editable desde el panel,
-- porque es lo único que cambia. Nace vacío: hasta que alguien pegue un
-- enlace, el componente no pinta esa parte.

BEGIN;

-- El bloque nuevo toma el orden del que se apaga, en la misma página.
INSERT INTO bloques (revision_id, tipo, orden, rotulo, visible, datos, variantes)
SELECT
  b.revision_id,
  'redesSociales',
  b.orden,
  'Redes sociales',
  TRUE,
  jsonb_build_object(
    'etiqueta',  'Sígalo en sus redes',
    'titulo',    'Lo que publica,',
    'destacado', 'de primera mano.',
    'youtubeVideo', ''
  ),
  '{}'::jsonb
FROM bloques b
WHERE b.tipo = 'cifrasYPreguntas'
  AND NOT EXISTS (SELECT 1 FROM bloques x WHERE x.tipo = 'redesSociales');

-- Y el viejo se apaga. Sigue en la base con su contenido intacto.
UPDATE bloques SET visible = FALSE WHERE tipo = 'cifrasYPreguntas';

COMMIT;

-- Comprobación: los dos existen, uno encendido y el otro apagado.
--   SELECT tipo, orden, visible, rotulo FROM bloques ORDER BY orden, id;
