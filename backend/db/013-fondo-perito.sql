-- 013 · Huecos de fondo para el bloque «Perito avaluador»
--
-- El bloque pasa a admitir una fotografía a sangre por detrás del texto, como
-- las láminas de la cabecera. Petición del cliente (12-11-2026).
-- Ver `specs/007-fondo-perito/`.
--
-- ── Por qué la figura enmarcada se retira al poner fondo ──────────────────
-- Medido en la página: la figura es un `<img>` OPACO que ocupa su columna
-- entera, del 2 % al 48 % del ancho, y el texto va del 52 % al 98 %. Entre
-- 1024 y 1280 px no queda un solo punto libre, así que una foto detrás no se
-- vería en ningún sitio. O la figura, o el fondo.
--
-- No se pierde nada: la clave de la figura se conserva en el bloque y elegir
-- «— sin imagen —» en el fondo devuelve el diseño anterior entero.
--
-- ── Por qué 1920×1080 y 1024×1536 ─────────────────────────────────────────
-- La franja es más apaisada que 16:9, así que de un lienzo de 1920×1080
-- `object-fit: cover` solo deja ver la banda `y 193-887`. En el teléfono la
-- franja es alta y estrecha y de un lienzo vertical de 1024×1536 se ve la
-- banda `x 224-800`. Los dos números salen de medir la página, no de redondear.
--
-- ── Nacen con un PNG de 1×1 transparente ──────────────────────────────────
-- La columna `archivo` no admite nulos, y una ruta a un archivo que no existe
-- deja un recuadro roto en el panel. El sitio público nunca los pide: el
-- bloque no apunta a estos huecos hasta que alguien los elige, y mientras
-- tanto se sigue pintando la figura de siempre.
--
-- Esta migración NO toca el contenido del bloque. La portada se publica
-- exactamente igual que antes de aplicarla.

BEGIN;

INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido)
VALUES
  ('fondo-perito', '/img/fondo-perito.png', '',
   'Fondo de la franja de perito avaluador (escritorio)', 1920, 1080),
  ('fondo-perito-movil', '/img/fondo-perito-movil.png', '',
   'Fondo de la franja de perito avaluador (móvil)', 1024, 1536)
ON CONFLICT (clave) DO NOTHING;

COMMIT;

-- Comprobación: los dos huecos existen y ningún bloque los usa todavía.
--   SELECT clave, ancho_sugerido, alto_sugerido FROM medios
--    WHERE clave LIKE 'fondo-perito%';
