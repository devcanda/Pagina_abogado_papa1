-- ───────────────────────────────────────────────────────────────────────────
-- 021 · Ajustes del bloque del abogado, pedidos por el cliente (17-11-2026)
--
--  · 20 → 26 años. Cuadra con el texto: ejerce desde el año 2000.
--  · Titular nuevo. El anterior —«Su caso lo lleva un abogado, no una
--    oficina.»— repetía la estructura «X, no Y» del eslogan que sustituyó.
--  · El botón pasa a «Agenda ahora» y lleva a WhatsApp.
--
--    `enlaceBoton` guarda la palabra `whatsapp`, NO la URL. El componente la
--    resuelve con `enlaceWhatsApp()` de `contacto.js`. Escribir aquí el
--    `wa.me/573165325335` duplicaría el número, que es el agujero del NAP que
--    el proyecto ya cerró una vez.
--
--  · Los puntos pasan de dos a tres. El de honorarios decía «Honorarios
--    acordados por escrito antes de iniciar», que es correcto y suena a
--    cláusula; dice lo mismo desde el lado del cliente. El tercero —la
--    valoración sin costo— no se inventa: es la promesa que hacía la franja
--    de cierre «¿Evaluamos su caso sin costo?», apagada en la migración 019.
--
-- Se escribe con `||` para CONSERVAR lo que no se nombra aquí.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE bloques
SET datos = datos || jsonb_build_object(
  'cifra',       '26',
  'titulo',      'Usted habla con quien',
  'destacado',   'va a defenderlo.',
  'textoBoton',  'Agenda ahora',
  'enlaceBoton', 'whatsapp',
  'puntos', jsonb_build_array(
    'Atención directa del abogado titular, sin intermediarios.',
    'Sabrá lo que cuesta antes de decidir: honorarios por escrito.',
    'La primera valoración de su caso no tiene costo.'
  )
)
WHERE tipo = 'textoConImagen'
  AND rotulo = 'Sobre el bufete';

COMMIT;
