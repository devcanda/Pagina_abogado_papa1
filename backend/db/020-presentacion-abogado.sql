-- ───────────────────────────────────────────────────────────────────────────
-- 020 · El bloque «Sobre el bufete» pasa a presentar AL ABOGADO
--
-- Petición del cliente (17-11-2026). El bloque lleva el retrato del abogado
-- principal y no decía quién era: hablaba de «un abogado titular» en
-- abstracto. Quien busca abogado quiere un nombre y una cara, no una
-- categoría.
--
-- El texto pasa a PRIMERA PERSONA, que es como ya habla la página de contacto
-- («Entiendo que contactar a un abogado puede parecer intimidante…») y es
-- coherente con lo que el bloque promete: le atiende una persona, no una
-- empresa.
--
-- Los datos no se inventan: salen de la biografía de la web anterior, en
-- `docs/contenido-wordpress/quienes-somos.md` — «Diego A. Candamil R.,
-- abogado especialista», ejerciendo «desde el año 2000».
--
-- El botón decía «Conocer al equipo» mientras el texto vendía «atención
-- directa del titular, sin intermediarios»: se contradecían, y además el
-- bloque de equipo se retiró de la portada. Pasa a «Conocer mi trayectoria».
--
-- Se escribe con `||` sobre el JSON existente para CONSERVAR lo que no se
-- nombra aquí (imagen, cifra, colores, puntos). Reemplazar el objeto entero
-- borraría lo que alguien haya ajustado desde el panel.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE bloques
SET datos = datos || jsonb_build_object(
  'etiqueta',    'Sobre el abogado',
  'titulo',      'Su caso lo lleva un abogado,',
  'destacado',   'no una oficina.',
  'texto',       $t$Soy Diego A. Candamil R. y ejerzo en Tuluá desde el año 2000. Atiendo personalmente cada proceso —laboral, civil, de familia y administrativo— desde la primera llamada hasta la sentencia. Usted sabrá siempre quién lleva su caso, porque soy yo.$t$,
  'nombre',      'Diego A. Candamil R.',
  'cargo',       'Abogado especialista · Tuluá',
  'textoBoton',  'Conocer mi trayectoria'
)
WHERE tipo = 'textoConImagen'
  AND rotulo = 'Sobre el bufete';

COMMIT;
