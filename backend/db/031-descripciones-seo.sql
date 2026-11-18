-- ───────────────────────────────────────────────────────────────────────────
-- 031 · Las dos descripciones que viven en la base entran en rango
--
-- Spec 014. Google corta el fragmento alrededor de los 160 caracteres: por
-- debajo de 120 se desaprovecha y por encima de 160 lo que sobra no se ve.
--
--   portada           113 -> 148
--   demanda-laboral    93 -> 144
--
-- ── La portada ────────────────────────────────────────────────────────────
-- Decía «Bufete de abogados con 26 años de experiencia en derecho laboral,
-- civil y de familia. Primera consulta sin costo.»
--
-- Dos cambios:
--
-- 1. **Empieza por «Abogados en Tuluá, Valle del Cauca».** Lo primero del
--    fragmento es lo que se lee, y la intención que trae quien busca un
--    abogado es local. «Bufete de abogados con 26 años» gasta el principio en
--    hablar de nosotros.
--
-- 2. **Se retira «Primera consulta sin costo», y conviene saber por qué.**
--    La única página que explicaba esa promesa era «Cifras y preguntas
--    frecuentes», borrada en la migración `030`. Una promesa de precio en el
--    resultado de Google, sin ninguna página que la sostenga, es la clase de
--    cosa que un visitante reclama. **Si el bufete sigue ofreciéndola, lo
--    correcto es volver a explicarla en una página y entonces anunciarla
--    aquí**, no al revés.
--
-- Se añade «avalúos certificados», que es la otra línea de negocio y no
-- aparecía en el fragmento de la portada.
--
-- ── La landing ────────────────────────────────────────────────────────────
-- Se mantiene el TUTEO: toda la landing habla de tú, al revés que el resto
-- del sitio. Es una decisión de esa página y no se toca de pasada.
--
-- Se le añade la zona —«en Tuluá y el Valle del Cauca»— y dos palabras por
-- las que la gente busca de verdad: cesantías y primas.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE paginas
SET meta_descripcion =
      'Abogados en Tuluá, Valle del Cauca. 26 años en derecho laboral, civil '
      || 'y de familia, y avalúos certificados. Atención directa del abogado titular.'
WHERE slug = 'inicio';

UPDATE paginas
SET meta_descripcion =
      'Despido sin justa causa en Tuluá y el Valle del Cauca: calcula y '
      || 'reclama tu indemnización, cesantías y primas. Evaluación gratuita en 24 horas.'
WHERE slug = 'demanda-laboral';

COMMIT;
