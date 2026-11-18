-- ───────────────────────────────────────────────────────────────────────────
-- 025 · La lámina del bufete pone los 26 AÑOS por delante
--
-- Petición del cliente (18-11-2026): que la lámina 2 note los 26 años de
-- ejercicio y que transmita confianza a quien está mirando la página con
-- intención de contratar.
--
-- ── Por qué el número va en el TITULAR y en cifra ──────────────────────────
-- Decía «Más de 20 años» dentro del subtítulo. Dos problemas:
--
--   1. **«Más de 20» se queda corto por seis años.** La chapa del bloque de
--      abajo ya dice 26, así que el sitio se estaba vendiendo por debajo de lo
--      que tiene, y de paso daba dos cifras distintas en la misma pantalla.
--   2. **Una cifra redonda se lee como publicidad; una exacta, como un dato.**
--      «Más de 20» es lo que escribe cualquiera; «26» es una fecha concreta
--      que alguien puede comprobar.
--
-- Va en el titular y no en el subtítulo porque el cliente pidió que se NOTE:
-- en el subtítulo la cifra se lee a medias.
--
-- Se escribe «26» y no «veintiséis» por lo mismo que en la chapa: un número en
-- cifra detiene la vista dentro de una frase, y además iguala las dos
-- menciones de la portada.
--
-- ── Lo que aporta la confianza, y lo que NO se promete ─────────────────────
-- El titular trae el RESPALDO (26 años) y la CONTINUIDAD (el mismo abogado al
-- frente todo ese tiempo). El subtítulo convierte las dos cosas en lo que
-- quien mira va a recibir:
--
--   · «quien le escucha el primer día es quien le responde ante el juez» —
--     se conserva del texto anterior porque es la mejor línea que tenía: pone
--     una imagen concreta donde «sin intermediarios» solo ponía una abstracción.
--   · «qué puede esperar de su caso y qué no, sin promesas que nadie puede
--     cumplir» — es lo nuevo, y es lo que construye confianza ante alguien que
--     está decidiendo si contrata. Un bufete que dice de antemano que no va a
--     prometer resultados es más creíble que uno que los promete.
--
-- NO SE PROMETE NINGÚN RESULTADO, y aquí se dice con todas las letras.
--
-- No se menciona el año de fundación aunque SÍ está confirmado —«Desde el año
-- 2000» aparece en `/quienes-somos/` y en el bloque «Sobre el bufete», y es de
-- donde salen los 26—. Se deja fuera porque una fecha obliga a quien lee a
-- hacer la resta, y el titular tiene que entregar el dato ya hecho.
--
-- **Los dos números van atados: 26 y 2000.** Cambiar uno sin el otro deja el
-- sitio diciéndose a sí mismo que no.
--
-- Tampoco se repiten los honorarios: ya están en el bloque «Sobre el bufete»
-- («Sabrá lo que cuesta antes de decidir»), y decirlo dos veces en la misma
-- página gasta espacio sin añadir nada.
--
-- ── El botón ───────────────────────────────────────────────────────────────
-- «Consulta ahora» → «Hablar con el abogado». Nombra justo lo que el titular
-- acaba de prometer —que le atiende el titular, no un intermediario— en lugar
-- de una acción genérica. Las tres láminas quedan con botones distintos y cada
-- uno nombra su acción: «Revisar mi liquidación», «Hablar con el abogado»,
-- «Solicitar un avalúo». El destino no cambia: /contacto/.
--
-- ── Medidas ────────────────────────────────────────────────────────────────
-- El registro declara `titulo` max 90, `subtitulo` max 240 y `textoBoton`
-- max 30, y `sanearDatos` recorta SIN AVISAR. Estos miden 38, 226 y 21.
--
-- El alto de la cabecera lo fija la lámina MÁS LARGA, así que los textos de
-- las tres van parejos o aparece un hueco muerto bajo los botones. Quedan:
-- titulares de 38, 38 y 42; subtítulos de 220, 226 y 235.
--
-- ── Por qué no se escribe `laminas->1` ─────────────────────────────────────
-- El ORDEN DE LAS LÁMINAS ES CONTENIDO y se cambia desde el panel. Se busca
-- por su rótulo y se escribe en el índice que resulte. `WITH ORDINALITY`
-- devuelve `bigint` y `jsonb -> int` no lo acepta: hay que castear a `::int`.
--
-- Se escribe con `||` sobre la lámina para CONSERVAR sus colores, su velo y
-- sus dos imágenes de fondo.
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
        'titulo',     '26 años con el mismo abogado al frente',
        'subtitulo',  'Atención directa del abogado titular en Tuluá: quien le escucha el primer día es quien le responde ante el juez. Sabrá desde esa primera conversación qué puede esperar de su caso y qué no, sin promesas que nadie puede cumplir.',
        'textoBoton', 'Hablar con el abogado'
      )
    )
FROM objetivo o
WHERE b.id = o.id;

COMMIT;
