-- 014 · Entidades que certifican el servicio de peritaje
--
-- El avalúo lo respalda el aval de otras entidades, así que la franja del
-- perito gana una fila de logotipos bajo las dos columnas.
-- Petición del cliente (12-11-2026). Ver `specs/008-certificaciones-perito/`.
--
-- ── Por qué a lo ANCHO y no dentro de la columna de texto ─────────────────
-- Medido en la página: la columna de texto ocupa del 52 % al 98 % del ancho,
-- o sea el 46 %. Cinco logotipos ahí salen a unos 80 px cada uno y no se lee
-- ninguno. A lo ancho de la sección caben a 220 px.
--
-- ── Los huecos son de 320×160 y se CONTIENEN, no se recortan ──────────────
-- El panel reduce con `cover`, que recorta el lado largo. A una fotografía le
-- sienta bien; a un logotipo le corta letras. Y son marcas AJENAS: recortarlas
-- o recolorearlas no es una cuestión de gusto. El campo declara
-- `ajuste: 'contener'`, que el panel ya entiende desde esta misma tanda.
--
-- ── Las cinco entradas nacen SIN logotipo, y es correcto ──────────────────
-- Llevan solo el nombre, que es el texto alternativo. Mientras no haya
-- logotipo el componente pinta ese nombre en su casilla: la franja se ve y se
-- puede valorar el espacio desde el primer día, y el día de mañana un
-- logotipo que falte deja el nombre en vez de un hueco roto.
--
-- **Los nombres son provisionales.** Hay que sustituirlos por los de las
-- entidades reales antes de publicar en el hosting.

BEGIN;

INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido)
VALUES
  ('cert-1', '/img/cert-1.png', '', 'Logotipo de entidad certificadora 1', 320, 160),
  ('cert-2', '/img/cert-2.png', '', 'Logotipo de entidad certificadora 2', 320, 160),
  ('cert-3', '/img/cert-3.png', '', 'Logotipo de entidad certificadora 3', 320, 160),
  ('cert-4', '/img/cert-4.png', '', 'Logotipo de entidad certificadora 4', 320, 160),
  ('cert-5', '/img/cert-5.png', '', 'Logotipo de entidad certificadora 5', 320, 160)
ON CONFLICT (clave) DO NOTHING;

-- Rótulo y cinco entradas de reserva, solo con nombre.
UPDATE bloques
   SET datos = datos
     || jsonb_build_object('tituloCertificaciones', 'Avalado y certificado por')
     || jsonb_build_object('certificaciones', jsonb_build_array(
          jsonb_build_object('nombre', 'Entidad certificadora 1', 'imagen', '', 'enlace', ''),
          jsonb_build_object('nombre', 'Entidad certificadora 2', 'imagen', '', 'enlace', ''),
          jsonb_build_object('nombre', 'Entidad certificadora 3', 'imagen', '', 'enlace', ''),
          jsonb_build_object('nombre', 'Entidad certificadora 4', 'imagen', '', 'enlace', ''),
          jsonb_build_object('nombre', 'Entidad certificadora 5', 'imagen', '', 'enlace', '')
        ))
 WHERE tipo = 'servicioDestacado'
   AND NOT (datos ? 'certificaciones');

COMMIT;

-- Comprobación: cinco entradas, ninguna con logotipo todavía.
--   SELECT jsonb_array_length(datos->'certificaciones') FROM bloques
--    WHERE tipo = 'servicioDestacado';
