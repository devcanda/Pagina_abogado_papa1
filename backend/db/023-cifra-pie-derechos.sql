-- ───────────────────────────────────────────────────────────────────────────
-- 023 · El pie de la cifra pasa a «años defendiendo sus derechos»
--
-- Petición del cliente (18-11-2026). Decía «años de ejercicio», que describe
-- la carrera del abogado; el nuevo describe lo que el visitante recibe, que
-- es de quien es la página.
--
-- Cabe JUSTO: `cifraPie` declara `max: 30` en el registro y la frase mide 29.
-- `sanearDatos` recorta lo que sobra SIN AVISAR, así que si algún día se
-- alarga un carácter más se publicaría cortada. Ya pasó con un rótulo del
-- perito.
--
-- Se escribe con `||` para CONSERVAR lo que no se nombra aquí.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE bloques
SET datos = datos || jsonb_build_object(
  'cifraPie', 'años defendiendo sus derechos'
)
WHERE tipo = 'textoConImagen'
  AND rotulo = 'Sobre el bufete';

COMMIT;
