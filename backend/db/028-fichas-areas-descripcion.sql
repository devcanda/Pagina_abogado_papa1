-- ───────────────────────────────────────────────────────────────────────────
-- 028 · Las seis fichas de áreas abren una descripción, no una página
--
-- Petición del cliente (18-11-2026). Ver `specs/013-fichas-areas-con-panel/`.
--
-- Las seis tarjetas de la portada llevaban a `/areas/derecho-laboral/`,
-- `-civil/`, `-familia/`, `-penal/`, `-inmobiliario/` y `-administrativo/`.
-- **Ninguna de esas páginas existe**: eran seis 404 en la portada.
--
-- En vez de crear seis páginas, la ficha se abre sobre sí misma y enseña una
-- descripción breve y un botón «Consultar ahora» que lleva a WhatsApp.
--
-- ── Lo que se gana y lo que se pierde ──────────────────────────────────────
-- Se gana el recorrido: de «ficha → página → botón → WhatsApp» a «ficha →
-- botón → WhatsApp», sin salir de la portada.
--
-- **Se pierde posicionamiento de cola larga.** Una página por área es lo que
-- compite por «abogado laboral Tuluá»; una ficha desplegable no es una URL y
-- Google no la indexa aparte. Queda escrito porque es el tipo de decisión que
-- alguien lee dentro de un año y «arregla» sin saber que se tomó.
--
-- **No cierra la puerta:** el `enlace` de cada tarjeta se CONSERVA. El día
-- que existan las páginas, basta vaciar la descripción desde el panel y la
-- ficha vuelve a enlazar, sin tocar código.
--
-- ── De dónde salen los textos ──────────────────────────────────────────────
-- De `frontend/src/data/areas.js`, que ya tenía un `subtitulo` y un
-- `whatsappMensaje` por área y los usa la página `/areas/`. Escribir aquí
-- otros distintos habría abierto dos versiones del mismo texto.
--
-- ── Medidas ────────────────────────────────────────────────────────────────
-- El registro declara `descripcion` max 160 y `mensaje` max 140, y
-- `sanearDatos` recorta SIN AVISAR. La más larga es la de administrativo,
-- con 102 caracteres; el mensaje más largo, 89.
--
-- Se escribe con `||` sobre cada tarjeta para CONSERVAR su nombre, su icono,
-- su imagen y su enlace. Y se localiza cada una por su `nombre`, no por su
-- índice: el orden de las tarjetas es contenido y se cambia desde el panel.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

WITH textos(nombre, descripcion, mensaje) AS (
  VALUES
    ('Derecho laboral',
     'Despidos sin justa causa, liquidaciones, reintegros laborales, acoso y reclamación pensional.',
     'Hola, deseo una consulta sobre un caso de Derecho Laboral.'),
    ('Derecho civil',
     'Responsabilidad civil contractual y extracontractual, indemnizaciones, cobranza y contratos.',
     'Hola, deseo realizar una consulta sobre un proceso de Derecho Civil.'),
    ('Derecho de familia',
     'Divorcios, cuotas alimentarias, custodias, régimen de visitas y liquidación de sociedad conyugal.',
     'Hola, requiero asesoría jurídica en Derecho de Familia.'),
    ('Derecho penal',
     'Defensa técnica especializada, representación de víctimas, audiencias preliminares y juicio oral.',
     'Hola, necesito asistencia y defensa jurídica en materia penal.'),
    ('Derecho inmobiliario',
     'Restitución de inmuebles, prescripción adquisitiva (pertenencia), deslindes y escrituración.',
     'Hola, requiero orientación en Derecho Inmobiliario o litigio de tierras.'),
    ('Derecho administrativo',
     'Demandas contra el Estado, reparación directa, nulidad y restablecimiento del derecho, disciplinarios.',
     'Hola, deseo asesoría en una demanda o litigio contra el Estado.')
),
rehechas AS (
  SELECT b.id,
         jsonb_agg(
           CASE
             WHEN t.nombre IS NULL THEN tarjeta
             ELSE tarjeta || jsonb_build_object(
               'descripcion', t.descripcion,
               'mensaje',     t.mensaje
             )
           END
           -- `e.orden`, cualificado: `bloques` tiene su propia columna
           -- `orden` —el sitio del bloque en la página— y sin el prefijo
           -- PostgreSQL no sabe cuál de las dos se le pide.
           ORDER BY e.orden
         ) AS tarjetas
  FROM bloques b,
       LATERAL jsonb_array_elements(b.datos -> 'tarjetas') WITH ORDINALITY AS e(tarjeta, orden)
       LEFT JOIN textos t ON t.nombre = e.tarjeta ->> 'nombre'
  WHERE b.tipo = 'rejillaTarjetas'
  GROUP BY b.id
)
UPDATE bloques b
SET datos = b.datos || jsonb_build_object(
      'tarjetas',      r.tarjetas,
      'textoConsulta', 'Consultar ahora'
    )
FROM rehechas r
WHERE b.id = r.id;

COMMIT;
