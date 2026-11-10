-- ───────────────────────────────────────────────────────────────────────────
-- 005 · La oficina está en Tuluá, no en Medellín
--
-- El contenido inicial se sembró con «Bufete en Medellín». Es un dato falso:
-- el despacho está en Cra. 31 #24-54, Céspedes, Tuluá (Valle del Cauca).
-- En un bufete, la ciudad equivocada no es solo un error de texto; la gente
-- busca abogado por cercanía y Google la usa para decidir a quién enseña.
--
-- Se corrige en TODAS las revisiones, no solo en la publicada: si alguien
-- deshace un cambio desde el panel, el dato viejo volvería a aparecer.
-- ───────────────────────────────────────────────────────────────────────────

UPDATE bloques
   SET datos = jsonb_set(datos, '{etiqueta}', '"Bufete en Tuluá"'::jsonb)
 WHERE tipo = 'cabecera'
   AND datos ->> 'etiqueta' = 'Bufete en Medellín';

UPDATE paginas
   SET titulo = REPLACE(titulo, 'Medellín', 'Tuluá')
 WHERE titulo LIKE '%Medellín%';

UPDATE paginas
   SET meta_descripcion = REPLACE(meta_descripcion, 'Medellín', 'Tuluá')
 WHERE meta_descripcion LIKE '%Medellín%';
