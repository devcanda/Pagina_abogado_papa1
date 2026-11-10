-- ============================================================================
--  002 — Compositor de bloques
--  Ejecutar:  psql "$DATABASE_URL" -f db/002-compositor.sql
-- ============================================================================

BEGIN;

-- ─── Usuarios del panel ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  email          TEXT        NOT NULL UNIQUE,
  nombre         TEXT        NOT NULL,
  hash_clave     TEXT        NOT NULL,   -- scrypt: sal:derivada, ambas en hex
  rol            TEXT        NOT NULL DEFAULT 'editor'
                 CHECK (rol IN ('admin', 'editor')),
  activo         BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ultimo_acceso  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sesiones (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  -- Se guarda el hash, no el token: si alguien lee la tabla no puede suplantar.
  hash_token  TEXT        NOT NULL UNIQUE,
  expira_en   TIMESTAMPTZ NOT NULL,
  ip          TEXT,
  agente      TEXT,
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones (hash_token);
CREATE INDEX IF NOT EXISTS idx_sesiones_expira ON sesiones (expira_en);

-- ─── Biblioteca de imágenes ─────────────────────────────────────────────────
-- `clave` es el contrato con el HTML: la página pide /img/<clave>.webp y lo que
-- cambia son los bytes de ese archivo. Por eso una imagen nueva se ve sin
-- recompilar nada.
CREATE TABLE IF NOT EXISTS medios (
  clave           TEXT        PRIMARY KEY,
  archivo         TEXT        NOT NULL,
  alt             TEXT        NOT NULL DEFAULT '',
  descripcion     TEXT,                       -- dónde aparece, para el editor
  ancho_sugerido  INTEGER     NOT NULL,
  alto_sugerido   INTEGER     NOT NULL,
  ancho           INTEGER,
  alto            INTEGER,
  bytes           INTEGER,
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id      INTEGER     REFERENCES usuarios (id) ON DELETE SET NULL
);

-- ─── Páginas, revisiones y bloques ──────────────────────────────────────────
-- Las revisiones resuelven de una vez el borrador, la vista previa y el poder
-- deshacer. Editar trabaja sobre la revisión abierta; publicar apunta
-- `revision_publicada` a ella.
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS revision_publicada INTEGER;
ALTER TABLE paginas ADD COLUMN IF NOT EXISTS actualizado_por INTEGER
      REFERENCES usuarios (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS revisiones (
  id          SERIAL PRIMARY KEY,
  pagina_id   INTEGER     NOT NULL REFERENCES paginas (id) ON DELETE CASCADE,
  nota        TEXT,
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id  INTEGER     REFERENCES usuarios (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_revisiones_pagina ON revisiones (pagina_id, creada_en DESC);

CREATE TABLE IF NOT EXISTS bloques (
  id            SERIAL PRIMARY KEY,
  revision_id   INTEGER NOT NULL REFERENCES revisiones (id) ON DELETE CASCADE,
  tipo          TEXT    NOT NULL,          -- clave del registro de bloques
  orden         INTEGER NOT NULL,
  -- `datos` y `variantes` van en JSONB porque cada tipo tiene campos distintos.
  -- Su forma la define el registro, y se valida contra él al guardar.
  datos         JSONB   NOT NULL DEFAULT '{}'::jsonb,
  variantes     JSONB   NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_bloques_revision ON bloques (revision_id, orden);

-- La clave foránea de la publicada se añade después de crear `revisiones`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paginas_revision_publicada_fk') THEN
    ALTER TABLE paginas ADD CONSTRAINT paginas_revision_publicada_fk
      FOREIGN KEY (revision_publicada) REFERENCES revisiones (id) ON DELETE SET NULL;
  END IF;
END $$;

-- ─── Registro de actividad ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auditoria (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER     REFERENCES usuarios (id) ON DELETE SET NULL,
  accion      TEXT        NOT NULL,
  entidad     TEXT        NOT NULL,
  entidad_id  TEXT,
  detalle     JSONB,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria (creado_en DESC);

COMMIT;
