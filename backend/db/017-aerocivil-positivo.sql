-- 017 · Aeronáutica Civil entra, con su logotipo positivo
--
-- La 015 dejó esa entidad SIN logotipo a propósito: el archivo entregado
-- entonces era la versión en negativo —63 % de tinta blanca, 33 % navy
-- #082858—, que daba 1,03:1 sobre la casilla clara y 1,08:1 sobre navy.
--
-- El cliente entregó la versión positiva el 12-11-2026: tinta navy #083888
-- sobre blanco, que es justo para lo que está pensada la superficie clara de
-- la franja. Preparada con la misma herramienta que las otras cuatro.
--
-- Con esto las cinco entidades llevan logotipo y ninguna casilla cae en el
-- camino del nombre. Ese camino SIGUE existiendo y no se toca: es lo que
-- evita un cuadro roto el día que falte un archivo.

BEGIN;

UPDATE medios SET archivo = '/img/cert-4.webp',
       descripcion = 'Logotipo de la Aeronáutica Civil, Unidad Administrativa Especial'
 WHERE clave = 'cert-4';

UPDATE bloques
   SET datos = jsonb_set(datos, '{certificaciones,3,imagen}', '"cert-4"')
 WHERE tipo = 'servicioDestacado'
   AND datos #>> '{certificaciones,3,imagen}' = '';

COMMIT;
