-- ============================================================================
--  003 — Migrar la portada actual a bloques
--
--  Traslada a la base de datos, palabra por palabra, lo que hoy está escrito
--  en los componentes. El objetivo es que la portada quede IDÉNTICA: se
--  verifica con `herramientas/visual.mjs` contra la línea base.
-- ============================================================================

BEGIN;

-- ─── Biblioteca de imágenes: las claves que ya usa la portada ───────────────
INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido) VALUES
  ('hero-abogado',     '/img/hero-abogado.svg',     '', 'Foto principal de la cabecera',      900, 1100),
  ('sobre-nosotros',   '/img/sobre-nosotros.svg',   '', 'Foto del despacho',                  700,  900),
  ('perito-dron',      '/img/perito-dron.svg',      '', 'Ilustración del servicio de peritaje', 900, 680),
  ('area-laboral',     '/img/area-laboral.svg',     '', 'Tarjeta: derecho laboral',           600,  800),
  ('area-civil',       '/img/area-civil.svg',       '', 'Tarjeta: derecho civil',             600,  800),
  ('area-familia',     '/img/area-familia.svg',     '', 'Tarjeta: derecho de familia',        600,  800),
  ('area-penal',       '/img/area-penal.svg',       '', 'Tarjeta: derecho penal',             600,  800),
  ('area-inmobiliario','/img/area-inmobiliario.svg','', 'Tarjeta: derecho inmobiliario',      600,  800),
  ('area-administrativo','/img/area-administrativo.svg','','Tarjeta: derecho administrativo', 600,  800),
  ('caso-1',           '/img/caso-1.svg',           '', 'Tarjeta de caso 1',                  600,  380),
  ('caso-2',           '/img/caso-2.svg',           '', 'Tarjeta de caso 2',                  600,  380),
  ('caso-3',           '/img/caso-3.svg',           '', 'Tarjeta de caso 3',                  600,  380)
ON CONFLICT (clave) DO NOTHING;

-- ─── Revisión inicial de la portada ─────────────────────────────────────────
INSERT INTO revisiones (pagina_id, nota)
SELECT id, 'Migración del contenido que estaba en los componentes'
  FROM paginas WHERE slug = 'inicio';

-- ─── Los ocho bloques, en su orden actual ───────────────────────────────────
INSERT INTO bloques (revision_id, tipo, orden, datos, variantes)
SELECT r.id, b.tipo, b.orden, b.datos::jsonb, b.variantes::jsonb
FROM (SELECT id FROM revisiones ORDER BY id DESC LIMIT 1) r,
(VALUES

 ('cabecera', 1, $j${
   "etiqueta": "Bufete en Tuluá",
   "titulo": "Nuestra independencia marca la diferencia",
   "subtitulo": "Bufete con más de 20 años en derecho laboral, civil y de familia. Atención directa del abogado titular, sin intermediarios.",
   "imagen": "/img/hero-abogado.svg",
   "textoBoton": "Consulta gratuita",
   "enlaceBoton": "/contacto/",
   "textoBoton2": "Ver áreas de práctica",
   "enlaceBoton2": "/areas/"
 }$j$, $j${}$j$),

 ('textoConImagen', 2, $j${
   "etiqueta": "Sobre el bufete",
   "titulo": "Defendemos su caso",
   "destacado": "como si fuera nuestro.",
   "texto": "Más de dos décadas acompañando a personas y empresas en derecho laboral, civil, de familia y administrativo. Cada proceso lo lleva un abogado titular desde la primera llamada hasta la sentencia.",
   "puntos": [
     "Atención directa del abogado titular, sin intermediarios.",
     "Honorarios acordados por escrito antes de iniciar."
   ],
   "imagen": "/img/sobre-nosotros.svg",
   "cifra": "20",
   "cifraPie": "años de ejercicio",
   "textoBoton": "Conocer al equipo",
   "enlaceBoton": "/quienes-somos/"
 }$j$, $j${"ladoImagen": "izquierda"}$j$),

 ('franjaTexto', 3, $j${
   "texto": "Comprometidos con su caso en",
   "rotativas": ["derecho laboral", "derecho civil", "derecho de familia", "peritajes"]
 }$j$, $j${}$j$),

 ('rejillaTarjetas', 4, $j${
   "etiqueta": "Áreas de práctica",
   "titulo": "Cada caso exige un",
   "destacado": "abogado distinto.",
   "texto": "No llevamos todo. Llevamos lo que dominamos, y eso es lo que marca la diferencia en estrados.",
   "textoBoton": "Ver todas las áreas",
   "enlaceBoton": "/areas/",
   "tarjetas": [
     {"nombre": "Derecho laboral",        "enlace": "/areas/derecho-laboral/",        "imagen": "/img/area-laboral.svg"},
     {"nombre": "Derecho civil",          "enlace": "/areas/derecho-civil/",          "imagen": "/img/area-civil.svg"},
     {"nombre": "Derecho de familia",     "enlace": "/areas/derecho-familia/",        "imagen": "/img/area-familia.svg"},
     {"nombre": "Derecho penal",          "enlace": "/areas/derecho-penal/",          "imagen": "/img/area-penal.svg"},
     {"nombre": "Derecho inmobiliario",   "enlace": "/areas/derecho-inmobiliario/",   "imagen": "/img/area-inmobiliario.svg"},
     {"nombre": "Derecho administrativo", "enlace": "/areas/derecho-administrativo/", "imagen": "/img/area-administrativo.svg"}
   ]
 }$j$, $j${"columnas": "3"}$j$),

 ('cifrasYPreguntas', 5, $j${
   "etiqueta": "Lo que suelen preguntarnos",
   "titulo": "Respuestas claras",
   "destacado": "antes de contratar.",
   "cifras": [
     {"valor": "20+", "texto": "Años de ejercicio"},
     {"valor": "850", "texto": "Casos resueltos"},
     {"valor": "92%", "texto": "Fallos favorables"},
     {"valor": "48h", "texto": "Respuesta inicial"}
   ],
   "preguntas": [
     {"pregunta": "¿Cuánto cuesta la primera consulta?",
      "respuesta": "Nada. Evaluamos su caso sin costo y le decimos con franqueza si es viable. Si no lo es, se lo decimos igual: no cobramos por abrir un proceso que no va a prosperar."},
     {"pregunta": "¿Cómo se acuerdan los honorarios?",
      "respuesta": "Por escrito y antes de iniciar cualquier trámite. Según el caso, puede ser una suma fija, un porcentaje del resultado o una combinación. Usted sabe desde el primer día qué va a pagar."},
     {"pregunta": "¿Quién lleva mi proceso?",
      "respuesta": "Un abogado titular, de principio a fin. No delegamos audiencias ni la relación con el cliente en practicantes."},
     {"pregunta": "¿Cuánto puede tardar?",
      "respuesta": "Depende del despacho y de la contraparte, y desconfíe de quien le dé una fecha exacta. Lo que sí podemos darle es el rango realista para casos como el suyo y mantenerle informado de cada actuación."}
   ]
 }$j$, $j${}$j$),

 ('servicioDestacado', 6, $j${
   "etiqueta": "Servicio destacado",
   "titulo": "Perito",
   "destacado": "avaluador.",
   "texto": "Determinamos el valor real de un inmueble y lo sustentamos donde haga falta: ante un juez, una entidad pública o una contraparte en negociación. Levantamos la información en campo —con dron cuando el predio lo exige— y entregamos un dictamen pericial que resiste la contradicción.",
   "puntos": [
     "Avalúos comerciales de inmuebles urbanos y rurales",
     "Dictamen pericial para procesos judiciales y sucesiones",
     "Levantamiento con dron en predios extensos o de difícil acceso"
   ],
   "imagen": "/img/perito-dron.svg",
   "palabraFondo": "Avalúos",
   "textoBoton": "Solicitar un avalúo",
   "enlaceBoton": "/contacto/"
 }$j$, $j${"ladoImagen": "izquierda"}$j$),

 ('tarjetasConFoto', 7, $j${
   "etiqueta": "Nuestro trabajo",
   "titulo": "Casos",
   "destacado": "resueltos.",
   "texto": "Una muestra de procesos cerrados en los últimos meses. Los nombres se omiten por reserva profesional.",
   "textoBoton": "Ver todos los casos",
   "enlaceBoton": "/casos/",
   "tarjetas": [
     {"etiqueta": "Laboral", "titulo": "Despido sin justa causa",
      "resumen": "Reintegro e indemnización completa tras seis años de contrato indefinido.",
      "pie": "Indemnización reconocida en primera instancia", "imagen": "/img/caso-1.svg"},
     {"etiqueta": "Civil", "titulo": "Responsabilidad contractual",
      "resumen": "Incumplimiento de obra privada resuelto en segunda instancia.",
      "pie": "Acuerdo favorable en segunda instancia", "imagen": "/img/caso-2.svg"},
     {"etiqueta": "Familia", "titulo": "Sucesión intestada",
      "resumen": "Partición de bienes entre cinco herederos sin llegar a juicio.",
      "pie": "Partición cerrada sin llegar a juicio", "imagen": "/img/caso-3.svg"}
   ]
 }$j$, $j${}$j$),

 ('franjaCierre', 8, $j${
   "titulo": "¿Evaluamos su caso",
   "destacado": "sin costo?",
   "textoBoton": "Agendar consulta",
   "enlaceBoton": "/contacto/",
   "textoTelefono": "o llámenos:"
 }$j$, $j${}$j$)

) AS b(tipo, orden, datos, variantes);

-- ─── Publicar esa revisión ──────────────────────────────────────────────────
UPDATE paginas
   SET revision_publicada = (SELECT id FROM revisiones ORDER BY id DESC LIMIT 1)
 WHERE slug = 'inicio';

COMMIT;
