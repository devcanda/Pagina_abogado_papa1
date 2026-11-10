-- 010 · Un hueco de imagen de FONDO por cada lámina del slider
--
-- La lámina ya tenía su foto recortada (la figura sobre la cuña). Esto es otra
-- cosa: la imagen que ocupa toda la franja por detrás del texto. Son dos
-- piezas distintas y conviven, así que son dos huecos distintos.
--
-- ── Por qué tres huecos y no uno ──────────────────────────────────────────
-- Un hueco compartido haría que cambiar el fondo de una lámina cambiara el de
-- las tres, que es justo lo contrario de lo que se pide. Las láminas son tres
-- como máximo (el tope del registro), así que tres huecos cubren el caso.
--
-- ── Por qué 1920×1080 ─────────────────────────────────────────────────────
-- Es un fondo a sangre: se recorta con `object-fit: cover`, así que manda el
-- ancho. 1920 cubre la pantalla de escritorio habitual sin estirarse; más
-- ancho solo añade peso en la zona que decide el LCP. El panel reduce y
-- convierte a WebP en el navegador antes de subir, así que lo que llegue al
-- servidor ya viene a esa medida.
--
-- ── El archivo inicial es un PNG de 1×1 transparente ──────────────────────
-- La columna `archivo` no admite nulos y el panel necesita algo que enseñar
-- como miniatura; una ruta a un archivo inexistente dejaría un recuadro roto.
-- El relleno pesa 68 bytes y **el sitio público nunca lo pide**: ninguna
-- lámina apunta a estos huecos hasta que alguien los elige a mano. Al subir
-- una foto, el servidor escribe el `.webp` y actualiza la ruta.

BEGIN;

INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido)
VALUES
  ('fondo-lamina-1', '/img/fondo-lamina-1.png', '',
   'Fondo de pantalla de la lámina 1 del slider', 1920, 1080),
  ('fondo-lamina-2', '/img/fondo-lamina-2.png', '',
   'Fondo de pantalla de la lámina 2 del slider', 1920, 1080),
  ('fondo-lamina-3', '/img/fondo-lamina-3.png', '',
   'Fondo de pantalla de la lámina 3 del slider', 1920, 1080)
ON CONFLICT (clave) DO NOTHING;

COMMIT;

-- Comprobación: tres huecos nuevos, ninguno asignado todavía.
--   SELECT clave, archivo, ancho_sugerido, alto_sugerido
--     FROM medios WHERE clave LIKE 'fondo-lamina-%' ORDER BY clave;
