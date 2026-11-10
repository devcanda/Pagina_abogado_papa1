-- ───────────────────────────────────────────────────────────────────────────
-- 007 · Los bloques se pueden ocultar y tienen nombre propio
--
-- El panel enseñaba una lista plana de huecos de imagen: doce casillas sueltas
-- que había que identificar por su clave. Pasa a enseñar los bloques de la
-- página con sus imágenes dentro, y a dejar encenderlos y apagarlos.
--
-- Ver `specs/004-bloques-en-el-panel/`.
-- ───────────────────────────────────────────────────────────────────────────

-- `DEFAULT TRUE` para que la migración no haga desaparecer nada.
ALTER TABLE bloques ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT TRUE;

-- Nombre con el que el bloque sale en el panel.
--
-- Se guarda en vez de deducirlo del tipo porque el tipo de la cabecera es
-- `cabecera` y quien entra al panel lo llama «el slider». Un rótulo deducido
-- del tipo no le diría nada a quien tiene que usarlo.
--
-- Admite nulo: si falta, el panel cae en el tipo.
ALTER TABLE bloques ADD COLUMN IF NOT EXISTS rotulo TEXT;

-- La API solo sirve bloques visibles, y los pide por revisión y orden.
CREATE INDEX IF NOT EXISTS idx_bloques_visibles
    ON bloques (revision_id, orden) WHERE visible;

-- ─── Rótulos de la portada ─────────────────────────────────────────────────
-- Por TIPO y no por id: los ids cambian con cada revisión nueva, el tipo no.
UPDATE bloques SET rotulo = v.rotulo
  FROM (VALUES
    ('cabecera',          'Slider principal'),
    ('textoConImagen',    'Sobre el bufete'),
    ('franjaTexto',       'Franja de compromiso'),
    ('rejillaTarjetas',   'Bloque de servicios del índice'),
    ('cifrasYPreguntas',  'Cifras y preguntas frecuentes'),
    ('servicioDestacado', 'Perito avaluador'),
    ('tarjetasConFoto',   'Casos resueltos'),
    ('franjaCierre',      'Franja de cierre')
  ) AS v(tipo, rotulo)
 WHERE bloques.tipo = v.tipo
   AND bloques.rotulo IS NULL;
