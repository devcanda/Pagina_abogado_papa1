-- 019 · «Nuestros clientes» en la portada
--
-- Sustituye la franja de cierre —«¿Evaluamos su caso sin costo?»— por una tira
-- horizontal con los logotipos de los clientes del bufete.
--
-- Petición del cliente (17-11-2026). Ver `specs/009-nuestros-clientes/`.
--
-- ── Lo que se pierde, y se pierde a sabiendas ─────────────────────────────
-- La franja que se apaga es el ÚLTIMO botón de la portada: lo último que ve un
-- visitante antes del pie es «Agendar consulta» y el teléfono. Al sustituirla,
-- la portada se queda sin cierre de conversión: después del bloque del perito
-- no hay ninguna acción hasta el pie.
--
-- Se expuso al cliente con tres salidas —conservar el botón debajo de los
-- logotipos, quitarlo, o añadir la franja nueva sin tocar la vieja— y eligió
-- quitarlo. Queda escrito aquí porque es el tipo de decisión que alguien lee
-- dentro de un año y «arregla» sin saber que se tomó.
--
-- El Sticky CTA de móvil y la burbuja de WhatsApp de escritorio siguen en pie,
-- así que la portada no se queda sin vía de contacto; lo que desaparece es el
-- cierre explícito.
--
-- ── El bloque viejo se OCULTA, no se borra ────────────────────────────────
-- Igual que `cifrasYPreguntas` en la 012 y que «Casos resueltos»: queda en la
-- base con su contenido y su orden, atenuado en el panel. Volver a encenderlo
-- es un clic; borrarlo perdería el texto para siempre.
--
-- ── Por qué ocupa el mismo orden ──────────────────────────────────────────
-- La alternancia claro/oscuro marca el ritmo de la portada. El bloque que se
-- va es oscuro y el que entra también —tiene que serlo: los siete logotipos
-- vienen con la tinta en BLANCO—, así que ponerlo en su sitio deja la
-- secuencia como estaba.
--
-- ── Las claves de los huecos van NUMERADAS ────────────────────────────────
-- `cliente-1` … `cliente-7`, no `cliente-dolormed`. Un hueco es un sitio, no
-- una marca: el día que el bufete cambie de cliente se sustituye la foto desde
-- el panel y la clave sigue valiendo. Con el nombre dentro habría que tocar la
-- base para algo que es puro contenido.

BEGIN;

-- Los siete huecos. `ON CONFLICT DO NOTHING` para que reejecutarla no pise un
-- archivo que alguien haya sustituido desde el panel.
INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido)
VALUES
  ('cliente-1', '/img/cliente-1.webp', 'Cámara de Comercio de Tuluá',              'Logotipo de cliente', 320, 160),
  ('cliente-2', '/img/cliente-2.webp', 'Distribuidora OFT Escolar',                'Logotipo de cliente', 320, 160),
  ('cliente-3', '/img/cliente-3.webp', 'Tradex',                                   'Logotipo de cliente', 320, 160),
  ('cliente-4', '/img/cliente-4.webp', 'Carmelita',                                'Logotipo de cliente', 320, 160),
  ('cliente-5', '/img/cliente-5.webp', 'Dixtrital Mega Store',                     'Logotipo de cliente', 320, 160),
  ('cliente-6', '/img/cliente-6.webp', 'DolorMed',                                 'Logotipo de cliente', 320, 160),
  ('cliente-7', '/img/cliente-7.webp', 'Redes IMAT Clínica de Fracturas S.A.S.',   'Logotipo de cliente', 320, 160)
ON CONFLICT (clave) DO NOTHING;

-- El bloque nuevo toma el orden del que se apaga, en la misma página.
INSERT INTO bloques (revision_id, tipo, orden, rotulo, visible, datos, variantes)
SELECT
  b.revision_id,
  'muroClientes',
  b.orden,
  'Nuestros clientes',
  TRUE,
  jsonb_build_object(
    'rotulo', 'Confían en nosotros',
    'titulo', 'Nuestros clientes',
    'clientes', jsonb_build_array(
      jsonb_build_object('nombre', 'Cámara de Comercio de Tuluá',            'imagen', 'cliente-1', 'enlace', ''),
      jsonb_build_object('nombre', 'Distribuidora OFT Escolar',              'imagen', 'cliente-2', 'enlace', ''),
      jsonb_build_object('nombre', 'Tradex',                                 'imagen', 'cliente-3', 'enlace', ''),
      jsonb_build_object('nombre', 'Carmelita',                              'imagen', 'cliente-4', 'enlace', ''),
      jsonb_build_object('nombre', 'Dixtrital Mega Store',                   'imagen', 'cliente-5', 'enlace', ''),
      jsonb_build_object('nombre', 'DolorMed',                               'imagen', 'cliente-6', 'enlace', ''),
      jsonb_build_object('nombre', 'Redes IMAT Clínica de Fracturas S.A.S.', 'imagen', 'cliente-7', 'enlace', '')
    )
  ),
  '{}'::jsonb
FROM bloques b
WHERE b.tipo = 'franjaCierre'
  AND NOT EXISTS (SELECT 1 FROM bloques x WHERE x.tipo = 'muroClientes');

-- Y el viejo se apaga. Sigue en la base con su contenido intacto.
UPDATE bloques SET visible = FALSE WHERE tipo = 'franjaCierre';

COMMIT;

-- Comprobación: los dos existen, uno encendido y el otro apagado.
--   SELECT tipo, orden, visible, rotulo FROM bloques ORDER BY orden, id;
