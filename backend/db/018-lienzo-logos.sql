-- 018 · El lienzo de los logotipos vuelve a 320×160
--
-- La 016 lo bajó a 320×120 para que un logotipo apaisado llenara la casilla.
-- Resolvía ese caso y rompía el otro: el de Aeronáutica Civil es APILADO
-- (1,38:1, emblema arriba y dos líneas de texto debajo) y en un lienzo tan
-- bajo toca el techo antes de crecer a lo ancho, con lo que se ve bastante
-- más pequeño que sus cuatro vecinos y su línea inferior deja de leerse.
--
-- El lienzo pasa a ser solo el MARCO. Quien decide el tamaño en pantalla es
-- `herramientas/preparar-logos-certificacion.mjs`, que coloca cada logotipo
-- con la misma ÁREA óptica —no con la misma altura—: el apilado queda más
-- alto y estrecho, el apaisado más bajo y ancho, y los cinco pesan igual.
-- Un lienzo de 320×160 admite las dos proporciones; uno de 320×120, no.
--
-- La medida tiene que coincidir con la del registro o el desplegable del
-- panel se queda sin un solo hueco que ofrecer.

BEGIN;
UPDATE medios SET ancho_sugerido = 320, alto_sugerido = 160
 WHERE clave LIKE 'cert-%';
COMMIT;
