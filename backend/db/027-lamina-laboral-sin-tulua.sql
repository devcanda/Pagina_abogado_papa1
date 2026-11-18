-- ───────────────────────────────────────────────────────────────────────────
-- 027 · La lámina laboral deja de decir «en Tuluá»
--
-- Petición del cliente (18-11-2026): el bufete no atiende solo Tuluá, atiende
-- en Colombia, y «revisamos sus cuentas en Tuluá» estrechaba el alcance justo
-- en la frase donde se ofrece el trabajo.
--
-- Queda: «…revisamos sus cuentas y reclamamos lo que falte, en conciliación o
-- ante el juez.» 220 → 211 caracteres (tope 240).
--
-- ── Lo que se pierde, para que conste ──────────────────────────────────────
-- Ese «Tuluá» no era decorativo: el proyecto vigila la **coherencia del NAP**
-- porque Google posiciona los negocios locales por cercanía, y el nombre de
-- la ciudad dentro del texto ayuda a esa señal. Se quita a sabiendas.
--
-- El daño es limitado y conviene saber por qué:
--   · La señal fuerte de búsqueda local es la DIRECCIÓN del pie y la ficha de
--     Google Maps, no una mención en un subtítulo. Esas no se tocan.
--   · «Tuluá» sigue en el sitio: en el subtítulo de la lámina 2, en el rótulo
--     de reserva de la cabecera («Bufete en Tuluá»), en el pie y en contacto.
--
-- Si algún día se quiere las dos cosas, la salida no es devolver «en Tuluá»
-- aquí: es decir el alcance real («en todo el país», «desde Tuluá para toda
-- Colombia»), que amplía sin borrar la señal local.
--
-- ── Por qué `replace()` y no reescribir la frase ───────────────────────────
-- Se quita exactamente el trozo pedido y se conserva lo demás TAL COMO ESTÉ.
-- Escribir el subtítulo entero daría por hecho que nadie lo ha tocado desde
-- el panel desde la migración 024; con `replace()`, si alguien lo editó, su
-- texto sobrevive y solo desaparece el « en Tuluá».
--
-- Si el trozo ya no estuviera, la migración no haría nada en silencio: por
-- eso se COMPRUEBA después de aplicarla, no se da por puesta.
--
-- El orden de las láminas es CONTENIDO: se busca por `rotulo`, nunca por
-- `laminas->0`. `WITH ORDINALITY` da `bigint` y hay que castear a `::int`.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

WITH objetivo AS (
  SELECT b.id,
         (t.i - 1)::int AS idx,
         t.lamina ->> 'subtitulo' AS subtitulo
  FROM bloques b,
       LATERAL jsonb_array_elements(b.datos -> 'laminas') WITH ORDINALITY AS t(lamina, i)
  WHERE b.tipo = 'cabecera'
    AND t.lamina ->> 'rotulo' = 'Derecho laboral'
)
UPDATE bloques b
SET datos = jsonb_set(
      b.datos,
      ARRAY['laminas', o.idx::text],
      (b.datos -> 'laminas' -> o.idx) || jsonb_build_object(
        'subtitulo', replace(o.subtitulo, ' en Tuluá', '')
      )
    )
FROM objetivo o
WHERE b.id = o.id;

COMMIT;
