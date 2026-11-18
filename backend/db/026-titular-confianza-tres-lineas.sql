-- ───────────────────────────────────────────────────────────────────────────
-- 026 · El titular de la lámina de confianza baja a TRES líneas
--
-- Corrige a la 025, que dejó «26 años con el mismo abogado al frente».
-- El texto era correcto; la MEDIDA no.
--
-- ── Qué pasó ───────────────────────────────────────────────────────────────
-- Ese titular tiene 38 caracteres, exactamente los mismos que el de la lámina
-- laboral, y aun así rompía en CUATRO líneas donde el otro rompe en tres:
--
--   «26 años con el / mismo / abogado al / frente»
--
-- Dos palabras cargadas de emes —«mismo abogado»— no caben juntas en una
-- línea, así que «mismo» se quedó solo y arrastró «frente» a una cuarta.
--
-- **Un titular de más no es un titular más alto: es una CABECERA más alta.**
-- Las tres láminas comparten celda de rejilla, así que el alto lo fija la más
-- larga y esa cuarta línea estiró la cabecera ENTERA —las tres láminas— de
-- 750 a 828 px, 78 px que empujan hacia abajo todo lo que viene después.
--
-- Medido antes y después, con el titular sustituido sobre la página ya
-- compilada (`herramientas` del taller, sin tocar la base):
--
--   | Titular                                  | car | líneas |
--   |------------------------------------------|-----|--------|
--   | 26 años con el mismo abogado al frente   |  38 |   4    |
--   | 26 años dando la cara por sus derechos   |  38 |   3    |
--   | 26 años dando la cara por usted          |  31 |   3    |
--
-- **La regla que sale de aquí: el número de caracteres NO predice el número
-- de líneas.** Dos titulares de 38 caracteres dan 4 y 3 líneas según las
-- letras que lleven. El tope del registro (90) evita que se trunque, no que
-- rompa mal. Antes de dar por bueno un titular hay que CONTAR SUS LÍNEAS en
-- la página, a 1280 px o más, que es donde la columna es más estrecha en
-- relación con el cuerpo de letra.
--
-- Solo afecta de 1280 px para arriba: a 1024 los tres titulares ocupan cuatro
-- líneas y a 390 los tres ocupan tres, así que ahí no había penalización.
--
-- ── Por qué este texto ─────────────────────────────────────────────────────
-- «Dar la cara por alguien» es responder por él delante de quien sea, que es
-- literalmente lo que explica el subtítulo que va debajo: quien le escucha el
-- primer día es quien le responde ante el juez. El titular pone la promesa en
-- una imagen y el subtítulo la demuestra.
--
-- Se descartó «por sus derechos» —que también entra en tres líneas— porque
-- repite la chapa del bloque de abajo, «26 años defendiendo sus derechos».
-- «Por usted» no repite nada y es más cercano.
--
-- La continuidad («el mismo abogado») no se pierde: la dice el subtítulo con
-- un hecho concreto en vez de con una abstracción.
--
-- El subtítulo y el botón de la 025 se quedan como están.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

WITH objetivo AS (
  SELECT b.id,
         (t.i - 1)::int AS idx
  FROM bloques b,
       LATERAL jsonb_array_elements(b.datos -> 'laminas') WITH ORDINALITY AS t(lamina, i)
  WHERE b.tipo = 'cabecera'
    AND t.lamina ->> 'rotulo' = 'Abogado de confianza'
)
UPDATE bloques b
SET datos = jsonb_set(
      b.datos,
      ARRAY['laminas', o.idx::text],
      (b.datos -> 'laminas' -> o.idx) || jsonb_build_object(
        'titulo', '26 años dando la cara por usted'
      )
    )
FROM objetivo o
WHERE b.id = o.id;

COMMIT;
