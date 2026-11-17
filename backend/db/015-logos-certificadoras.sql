-- 015 · Logotipos y nombres reales de las entidades certificadoras
--
-- La 014 dejó cinco entradas provisionales («Entidad certificadora 1…5») y
-- cinco huecos con su relleno de 1×1. El cliente entregó los logotipos el
-- 12-11-2026; esto los pone en su sitio.
--
-- ── El orden NO es casual ─────────────────────────────────────────────────
-- Primero las tres de avalúo y después las dos de aviación, que es el mismo
-- orden en que el párrafo presenta las credenciales: los 25 años avaluando y,
-- detrás, el dron. Un sello que aparece antes de que el texto lo explique no
-- dice nada.
--
-- ── Los archivos los prepara una HERRAMIENTA, no se suben crudos ──────────
-- `herramientas/preparar-logos-certificacion.mjs`. Llegaron con fondo blanco
-- macizo y a resoluciones de 220 px a 7178 px. La herramienta quita el fondo
-- por inundación desde los bordes —no con un filtro de color, que agujerearía
-- el escudo claro de Delta Force—, recorta y contiene en el lienzo del hueco, con alfa.
-- Por eso la extensión pasa de `.png` a `.webp` y hay que repuntar `archivo`.
--
-- ── Aeronáutica Civil se queda SIN logotipo, y es deliberado ──────────────
-- El archivo que entregó el cliente es la versión en NEGATIVO: el 63 % de su
-- tinta es blanca y el 33 % es navy #082858. Medido:
--   · sobre la casilla clara, el texto da 1,03:1 → invisible
--   · sobre navy, el disco del emblema da 1,08:1 → invisible
-- No hay color de casilla que lo salve, y recolorear una marca ajena no está
-- sobre la mesa, igual que no se toca el logotipo del cliente. Mientras tanto
-- la entrada lleva solo el nombre, que es justo para lo que se diseñó ese
-- respaldo. **Hay que pedir la versión positiva.**

BEGIN;

UPDATE medios SET archivo = '/img/cert-1.webp',
       alt = 'ARAV · Autorreguladora de Avaluadores',
       descripcion = 'Logotipo de ARAV, Autorreguladora de Avaluadores'
 WHERE clave = 'cert-1';
UPDATE medios SET archivo = '/img/cert-2.webp',
       alt = 'RAA · Registro Abierto de Avaluadores',
       descripcion = 'Logotipo del Registro Abierto de Avaluadores'
 WHERE clave = 'cert-2';
UPDATE medios SET archivo = '/img/cert-3.webp',
       alt = 'Lonja de Colombia',
       descripcion = 'Logotipo de Lonja de Colombia, Apoyo Empresarial'
 WHERE clave = 'cert-3';
UPDATE medios SET alt = 'Aeronáutica Civil',
       descripcion = 'Logotipo de la Aeronáutica Civil (pendiente: solo hay versión en negativo)'
 WHERE clave = 'cert-4';
UPDATE medios SET archivo = '/img/cert-5.webp',
       alt = 'Delta Force · Escuela de Aviación',
       descripcion = 'Logotipo de Delta Force, Escuela de Aviación'
 WHERE clave = 'cert-5';

UPDATE bloques
   SET datos = jsonb_set(datos, '{certificaciones}', jsonb_build_array(
         jsonb_build_object('nombre', 'ARAV · Autorreguladora de Avaluadores', 'imagen', 'cert-1', 'enlace', ''),
         jsonb_build_object('nombre', 'RAA · Registro Abierto de Avaluadores', 'imagen', 'cert-2', 'enlace', ''),
         jsonb_build_object('nombre', 'Lonja de Colombia', 'imagen', 'cert-3', 'enlace', ''),
         jsonb_build_object('nombre', 'Aeronáutica Civil · Unidad Administrativa Especial', 'imagen', '', 'enlace', ''),
         jsonb_build_object('nombre', 'Delta Force · Escuela de Aviación', 'imagen', 'cert-5', 'enlace', '')
       ))
 WHERE tipo = 'servicioDestacado'
   AND datos ? 'certificaciones';

COMMIT;
