-- ============================================================================
--  candamilabogados.com — Esquema inicial PostgreSQL
--  Ejecutar:  psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================================

BEGIN;

-- ─── Tabla: paginas ─────────────────────────────────────────────────────────
-- Fuente de verdad del contenido. Astro la consulta en build (SSG) por slug.
CREATE TABLE IF NOT EXISTS paginas (
  id               SERIAL PRIMARY KEY,
  slug             TEXT        NOT NULL UNIQUE,   -- clave de ruta: /servicios/derecho-laboral
  titulo           TEXT        NOT NULL,
  contenido        TEXT        NOT NULL DEFAULT '',
  imagen_hero      TEXT,                          -- ruta o URL absoluta
  es_landing_page  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Campos de apoyo para SEO técnico y publicación controlada.
  meta_descripcion TEXT,
  publicado        BOOLEAN     NOT NULL DEFAULT TRUE,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- El build de Astro pide "todas las páginas publicadas" y luego una por slug.
CREATE INDEX IF NOT EXISTS idx_paginas_publicado ON paginas (publicado);

-- ─── Tabla: leads ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  telefono       TEXT        NOT NULL,
  area_legal     TEXT,
  resumen_caso   TEXT,
  fecha_ingreso  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Campos de apoyo operativo y legal (Ley 1581 de 2012, Habeas Data).
  email               TEXT,
  origen              TEXT,          -- slug de la landing que originó el lead
  estado              TEXT        NOT NULL DEFAULT 'nuevo',
  consentimiento_datos BOOLEAN    NOT NULL DEFAULT FALSE
);

-- El bufete filtra el embudo por fecha y por estado de gestión.
CREATE INDEX IF NOT EXISTS idx_leads_fecha  ON leads (fecha_ingreso DESC);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads (estado);

-- ─── Tabla: chat_logs ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_logs (
  id              SERIAL PRIMARY KEY,
  lead_id         INTEGER     REFERENCES leads (id) ON DELETE SET NULL,
  mensaje_usuario TEXT        NOT NULL,
  respuesta_ia    TEXT        NOT NULL,
  "timestamp"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Agrupa los turnos de una conversación que todavía no tiene lead asociado.
  session_id      UUID        NOT NULL DEFAULT gen_random_uuid()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_session ON chat_logs (session_id, "timestamp");
CREATE INDEX IF NOT EXISTS idx_chat_logs_lead    ON chat_logs (lead_id);

-- ─── Trigger: mantener actualizado_en ───────────────────────────────────────
CREATE OR REPLACE FUNCTION set_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paginas_actualizado ON paginas;
CREATE TRIGGER trg_paginas_actualizado
  BEFORE UPDATE ON paginas
  FOR EACH ROW EXECUTE FUNCTION set_actualizado_en();

COMMIT;
