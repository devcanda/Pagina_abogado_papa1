-- 011 · Un hueco de fondo VERTICAL por lámina, para móvil
--
-- El fondo de escritorio es apaisado (1920×1080) y en el teléfono la franja es
-- alta y estrecha: `object-fit: cover` recorta por los lados y solo deja a la
-- vista entre el 32 % y el 39 % del ancho. Medido en la lámina laboral, ahí
-- cabe el abogado y nadie más, así que se pierde a quién le está explicando el
-- contrato: justo el contexto que el titular da por supuesto.
--
-- No se arregla moviendo el encuadre. Los dos personajes abarcan el 52 % del
-- lienzo y en móvil caben 39 %: no entran, se ponga el recorte donde se ponga.
-- Hace falta otra imagen, compuesta en vertical.
--
-- ── Por qué 800×1270 ──────────────────────────────────────────────────────
-- Es la relación de la franja en el teléfono (medido: 390×556 y 360×627, entre
-- 0,57 y 0,70). Con una imagen de esa proporción, `cover` enseña el ANCHO
-- COMPLETO y solo recorta un poco de alto, que es lo contrario de lo que pasa
-- hoy.
--
-- El campo es opcional: una lámina sin fondo móvil sigue usando el de
-- escritorio, igual que hasta ahora.

BEGIN;

INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido)
VALUES
  ('fondo-movil-1', '/img/fondo-movil-1.png', '',
   'Fondo vertical de la lámina 1 del slider (móvil)', 800, 1270),
  ('fondo-movil-2', '/img/fondo-movil-2.png', '',
   'Fondo vertical de la lámina 2 del slider (móvil)', 800, 1270),
  ('fondo-movil-3', '/img/fondo-movil-3.png', '',
   'Fondo vertical de la lámina 3 del slider (móvil)', 800, 1270)
ON CONFLICT (clave) DO NOTHING;

COMMIT;
