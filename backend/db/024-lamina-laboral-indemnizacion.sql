-- ───────────────────────────────────────────────────────────────────────────
-- 024 · La lámina de derecho laboral pregunta por la INDEMNIZACIÓN
--
-- Petición del cliente (18-11-2026). La lámina enseña a un abogado
-- explicándole un contrato a un trabajador, y el texto no recogía esa escena:
-- «Lo que le deben por su trabajo, cobrado» es una afirmación sobre el bufete.
-- El titular pasa a ser una PREGUNTA dirigida a quien mira.
--
-- «Completa» es la palabra que hace el trabajo: casi nadie sale de una empresa
-- sin recibir algo, y casi nadie sabe si lo que recibió era lo que tocaba. La
-- duda es el motivo por el que alguien pulsa.
--
-- El subtítulo apoya la pregunta con el hecho que la sostiene —la
-- indemnización por despido sin justa causa es ADEMÁS de la liquidación, no en
-- vez de ella— y conserva lo que ya funcionaba: las palabras por las que la
-- gente busca (cesantías, primas, horas extras), «Tuluá» para la búsqueda
-- local y la señal de que el bufete litiga, no solo asesora.
--
-- NO SE PROMETE UN RESULTADO. Se ofrece revisar, decir cuánto falta y
-- reclamar; eso es lo que un bufete puede comprometer.
--
-- El botón deja de ser «Consulta ahora» —que además repetía el de la lámina
-- 2— y nombra lo que la pregunta acaba de poner en la cabeza del visitante.
--
-- ── Medidas ────────────────────────────────────────────────────────────────
-- El registro declara `titulo` max 90, `subtitulo` max 240 y `textoBoton`
-- max 30, y `sanearDatos` recorta SIN AVISAR lo que se pase. Estos miden
-- 38, 220 y 22.
--
-- Además, el alto de la cabecera lo fija la lámina MÁS LARGA, así que los
-- textos de las tres van parejos o aparece un hueco muerto bajo los botones.
-- Las otras dos: titulares de 36 y 42, subtítulos de 207 y 235.
--
-- ── Por qué no se escribe `laminas->0` ─────────────────────────────────────
-- El ORDEN DE LAS LÁMINAS ES CONTENIDO y se cambia desde el panel. Una
-- migración que diera por hecho que la laboral va primera reescribiría la
-- lámina equivocada en cuanto alguien reordenara el carrusel. Se busca por su
-- rótulo y se escribe en el índice que resulte.
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
    AND t.lamina ->> 'rotulo' = 'Derecho laboral'
)
UPDATE bloques b
SET datos = jsonb_set(
      b.datos,
      ARRAY['laminas', o.idx::text],
      (b.datos -> 'laminas' -> o.idx) || jsonb_build_object(
        'titulo',     '¿Le pagaron la indemnización completa?',
        'subtitulo',  'Si lo despidieron sin justa causa, la ley le reconoce una indemnización aparte de la liquidación. Cesantías, primas, horas extras: revisamos sus cuentas en Tuluá y reclamamos lo que falte, en conciliación o ante el juez.',
        'textoBoton', 'Revisar mi liquidación'
      )
    )
FROM objetivo o
WHERE b.id = o.id;

COMMIT;
