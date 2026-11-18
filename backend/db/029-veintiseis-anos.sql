-- ───────────────────────────────────────────────────────────────────────────
-- 029 · Los «más de 20 años» que quedaban pasan a 26
--
-- Petición del cliente (18-11-2026). Cierra el repaso de congruencia que
-- empezó con la chapa (migración `021`) y la lámina 2 (`025`).
--
-- **26 y «Desde el año 2000» van ATADOS.** El año está en `/quienes-somos/` y
-- en el bloque «Sobre el bufete»; es de donde salen los 26. Cambiar uno sin el
-- otro deja el sitio contradiciéndose solo.
--
-- «Más de 20» no era falso —26 son más de 20—, pero vendía el bufete **seis
-- años por debajo** de lo que tiene, y convivía en la misma pantalla con un
-- 26. Una cifra redonda se lee como publicidad; una exacta, como un dato.
--
-- ── Los dos sitios que tocaba esta migración ───────────────────────────────
--
-- 1. **La meta descripción de la portada.** Es el texto del RESULTADO de
--    Google, no de la página: nadie lo ve navegando, lo ven todos los que
--    buscan. Era el peor sitio donde dejarlo a la baja.
--
-- 2. **El subtítulo de RESERVA de la cabecera.** Hoy no se pinta —manda
--    `laminas`—, pero es lo que saldría si algún día ese grupo se vaciara.
--    Un respaldo que contradice al sitio no es un respaldo.
--
-- El tercero, la meta de `/quienes-somos/`, vive en código y se cambió allí.
--
-- ── Lo que NO se toca, y por qué ───────────────────────────────────────────
-- El bloque del perito dice «Más de 25 años avaluando para el sector». No
-- entra aquí: no es la misma cuenta. Son 26 años de ejercicio como abogado y
-- algo más de 25 avaluando, que es una especialidad posterior y perfectamente
-- compatible. Si el cliente quiere igualarlo, es otra decisión suya.
-- ───────────────────────────────────────────────────────────────────────────
BEGIN;

UPDATE paginas
SET meta_descripcion = replace(meta_descripcion, 'más de 20 años', '26 años')
WHERE meta_descripcion LIKE '%más de 20 años%';

UPDATE bloques
SET datos = datos || jsonb_build_object(
      'subtitulo', replace(datos ->> 'subtitulo', 'más de 20 años', '26 años')
    )
WHERE tipo = 'cabecera'
  AND datos ->> 'subtitulo' LIKE '%más de 20 años%';

COMMIT;
