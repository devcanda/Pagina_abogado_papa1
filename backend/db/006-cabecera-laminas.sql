-- ───────────────────────────────────────────────────────────────────────────
-- 006 · La cabecera pasa a tres láminas
--
-- El bufete vende tres cosas a tres públicos distintos —defensa jurídica,
-- avalúos periciales y derecho laboral— y la cabecera solo hablaba de la
-- primera. Quien llegaba buscando un avalúo no veía nada dirigido a él hasta
-- el sexto bloque de la página.
--
-- Los campos sueltos del bloque (titulo, subtitulo, imagen…) NO se tocan:
-- siguen siendo la reserva que usa el componente si algún día se vacía
-- `laminas`. Ver `specs/003-cabecera-slider/`.
--
-- Se actúa sobre TODAS las revisiones, no solo la publicada: por el mismo
-- motivo que en la 005, deshacer un cambio desde el panel no debe resucitar
-- la cabecera de una sola lámina.
-- ───────────────────────────────────────────────────────────────────────────

-- ─── Huecos de imagen de las dos láminas nuevas ────────────────────────────
-- Nacen con la misma foto que la lámina del abogado, que es lo honesto: es el
-- mismo abogado ejerciendo tres papeles. Cada hueco tiene su propio archivo
-- para que publicidad pueda cambiar uno sin tocar los otros dos.
INSERT INTO medios (clave, archivo, alt, descripcion, ancho_sugerido, alto_sugerido,
                    ancho, alto, bytes)
VALUES
  ('hero-perito', '/img/hero-perito.webp',
   'Diego Antonio Candamil, perito avaluador',
   'Cabecera de la portada, lámina «Perito avaluador»', 900, 1100, 900, 1100, 75464),
  ('hero-laboral', '/img/hero-laboral.webp',
   'Diego Antonio Candamil, especialista en derecho laboral',
   'Cabecera de la portada, lámina «Derecho laboral»', 900, 1100, 900, 1100, 75464)
ON CONFLICT (clave) DO NOTHING;

-- ─── Las tres láminas ──────────────────────────────────────────────────────
-- `imagen` guarda la CLAVE del medio, no la ruta: es lo que permite que
-- sustituir la foto desde el panel se vea en el sitio aunque cambie de
-- extensión. Ver AGENTS.md.
UPDATE bloques
   SET datos = jsonb_set(datos, '{laminas}', $j$[
  {
    "rotulo": "El bufete",
    "etiqueta": "Bufete en Tuluá",
    "titulo": "Nuestra independencia marca la diferencia",
    "subtitulo": "Bufete con más de 20 años en derecho laboral, civil y de familia. Atención directa del abogado titular, sin intermediarios.",
    "imagen": "hero-abogado",
    "textoBoton": "Consulta gratuita",
    "enlaceBoton": "/contacto/",
    "textoBoton2": "Ver áreas de práctica",
    "enlaceBoton2": "/areas/"
  },
  {
    "rotulo": "Perito avaluador",
    "etiqueta": "Perito avaluador",
    "titulo": "El valor real de su inmueble, sustentado",
    "subtitulo": "Avalúos comerciales de predios urbanos y rurales, y dictamen pericial que resiste la contradicción ante un juez o una entidad pública. Levantamiento en campo, con dron cuando el predio lo exige.",
    "imagen": "hero-perito",
    "textoBoton": "Solicitar un avalúo",
    "enlaceBoton": "/contacto/",
    "textoBoton2": "",
    "enlaceBoton2": ""
  },
  {
    "rotulo": "Derecho laboral",
    "etiqueta": "Especialistas en derecho laboral",
    "titulo": "Lo que le deben por su trabajo, cobrado",
    "subtitulo": "Despidos sin justa causa, liquidaciones mal calculadas, acoso laboral y reintegros. Calculamos lo que le corresponde y lo reclamamos, en conciliación o ante el juez.",
    "imagen": "hero-laboral",
    "textoBoton": "Consulta gratuita",
    "enlaceBoton": "/contacto/",
    "textoBoton2": "Reclamar indemnización",
    "enlaceBoton2": "/demanda-laboral/"
  }
]$j$::jsonb)
 WHERE tipo = 'cabecera';
