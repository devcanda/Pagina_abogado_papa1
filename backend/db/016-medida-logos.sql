-- 016 · El hueco de los logotipos pasa a 320×120
--
-- Medido en la página: el hueco útil de una casilla es de 170×64 px en
-- escritorio, o sea 2,66:1. Con un lienzo de 320×160 (2:1) el logotipo se
-- contiene por el ALTO y se queda en 128 px de los 202 que mide la casilla,
-- con un palmo de blanco a cada lado y la línea pequeña ya ilegible.
-- Igualando la proporción del lienzo a la del hueco, lo llena.
--
-- La medida tiene que ser la MISMA que la del registro: el desplegable del
-- panel solo ofrece huecos de la misma medida sugerida, así que si discrepan
-- el campo se queda sin ningún hueco que ofrecer.

BEGIN;
UPDATE medios SET ancho_sugerido = 320, alto_sugerido = 120
 WHERE clave LIKE 'cert-%';
COMMIT;
