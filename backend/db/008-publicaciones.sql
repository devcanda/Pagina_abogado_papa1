-- ───────────────────────────────────────────────────────────────────────────
-- 008 · Publicar recompila el sitio
--
-- El frontend es estático: consulta la API durante `astro build`. Editar
-- contenido cambiaba la base al instante, pero la página publicada seguía
-- siendo la de la última compilación. Para cambiar una foto al mes se
-- aguantaba; para editar textos a diario, no.
--
-- Ver `specs/005-publicar-y-recompilar/`.
-- ───────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS publicaciones (
  id          SERIAL PRIMARY KEY,

  -- 'en-marcha'    compilando ahora mismo
  -- 'hecha'        el sitio ya sirve esta versión
  -- 'fallida'      la compilación dio error; el sitio anterior sigue en pie
  -- 'interrumpida' el servidor se reinició a mitad
  estado      TEXT        NOT NULL
              CHECK (estado IN ('en-marcha', 'hecha', 'fallida', 'interrumpida')),

  usuario_id  INTEGER     REFERENCES usuarios (id) ON DELETE SET NULL,
  iniciada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acabada_en  TIMESTAMPTZ,

  -- Últimas líneas del log. Solo las últimas: es lo que sirve para
  -- diagnosticar, y guardar la salida entera haría crecer la tabla sin tope.
  salida      TEXT
);

-- El panel pide «la última» continuamente mientras compila.
CREATE INDEX IF NOT EXISTS idx_publicaciones_recientes
    ON publicaciones (iniciada_en DESC);

-- ─── El candado ────────────────────────────────────────────────────────────
-- Solo puede haber UNA compilación en marcha, y el candado es esta restricción,
-- no una variable del proceso: así sigue valiendo si algún día hay dos procesos
-- de Node detrás de Passenger, y sobrevive a un reinicio.
--
-- Un índice único parcial es la forma de decir «como mucho una fila con este
-- estado» sin inventarse una tabla de bloqueos.
CREATE UNIQUE INDEX IF NOT EXISTS idx_publicaciones_una_en_marcha
    ON publicaciones ((estado)) WHERE estado = 'en-marcha';
