-- ───────────────────────────────────────────────────────────────────────────
-- 022 · El tercer punto del bloque del abogado cambia de redacción
--
-- Petición del cliente (18-11-2026). Decía «La primera valoración de su caso
-- no tiene costo.» y pasa a «Dé el primer paso conociendo su panorama legal.»
--
-- El cambio NO es cosmético: el punto dejaba de prometer gratuidad. Eso es
-- deliberado —un bufete no tiene por qué comprometerse por escrito a no
-- cobrar la primera consulta— y de paso el punto deja de competir con el
-- botón: ahora invita a dar el paso en vez de anunciar un precio.
--
-- Se escribe el ARRAY ENTERO porque `jsonb_build_array` no sabe sustituir un
-- elemento suelto; los otros dos puntos se repiten tal cual para no perderlos.
--
-- Se escribe con `||` para CONSERVAR lo que no se nombra aquí.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE bloques
SET datos = datos || jsonb_build_object(
  'puntos', jsonb_build_array(
    'Atención directa del abogado titular, sin intermediarios.',
    'Sabrá lo que cuesta antes de decidir: honorarios por escrito.',
    'Dé el primer paso conociendo su panorama legal.'
  )
)
WHERE tipo = 'textoConImagen'
  AND rotulo = 'Sobre el bufete';

COMMIT;
