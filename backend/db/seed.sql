-- ============================================================================
--  Datos de prueba para desarrollo local
--  Ejecutar:  psql "$DATABASE_URL" -f db/seed.sql
-- ============================================================================

INSERT INTO paginas (slug, titulo, contenido, imagen_hero, es_landing_page, meta_descripcion)
VALUES
  (
    'inicio',
    'Candamil Abogados | Defensa jurídica con resultados',
    '<p>Más de 20 años acompañando a personas y empresas en derecho laboral, civil y de familia. Atención directa con el abogado titular, sin intermediarios.</p><h2>Nuestras áreas</h2><p>Derecho laboral, responsabilidad civil, familia y sucesiones, y derecho administrativo.</p>',
    '/img/hero-corporativo.svg',
    FALSE,
    'Bufete de abogados con más de 20 años de experiencia en derecho laboral, civil y de familia. Primera consulta sin costo.'
  ),
  (
    'quienes-somos',
    'Quiénes somos',
    '<p>Somos un equipo pequeño y especializado. Cada caso lo lleva un abogado titular, no un practicante.</p>',
    '/img/hero-equipo.svg',
    FALSE,
    'Conoce al equipo de Candamil Abogados: experiencia, cercanía y resultados comprobables.'
  ),
  (
    'demanda-laboral',
    '¿Te despidieron sin justa causa? Reclama tu indemnización',
    '<p>Evaluamos tu caso en menos de 24 horas y te decimos cuánto te deben. Sin costo inicial.</p><h2>¿Qué puedes reclamar?</h2><p>Indemnización por despido, salarios pendientes, prestaciones sociales no pagadas y aportes a seguridad social.</p>',
    '/img/hero-laboral.svg',
    TRUE,
    'Despido sin justa causa: calcula y reclama tu indemnización. Evaluación gratuita en 24 horas.'
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO leads (nombre, telefono, area_legal, resumen_caso, origen, consentimiento_datos)
VALUES
  ('Ana Ríos', '+57 300 000 0000', 'laboral', 'Despido sin justa causa tras 4 años de contrato a término indefinido.', 'demanda-laboral', TRUE)
ON CONFLICT DO NOTHING;
