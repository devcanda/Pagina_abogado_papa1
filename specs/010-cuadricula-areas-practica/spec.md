# Especificación — Página de Áreas de Práctica con Cuadrícula Moderna de 3 Columnas

Petición del usuario, 17-11-2026.

## 1. Contexto y Objetivo

Actualmente, los enlaces de navegación de la cabecera (`Navbar.astro`), pie (`Footer.astro`) y botones del hero/bloques apuntan a `/areas/`, pero dicha ruta responde 404 (anotado como pendiente crítico en `MEMORY.md`).

Además, el usuario solicita expresamente:
1. Analizar la página de demostración: `https://max-themes.net/demos/lawyerbase/practice-areas-modern-3-columns.html` (LawyerBase - Practice Areas Modern 3 Columns).
2. Construir la página `/areas/` con una cuadrícula moderna de 3 columnas inspirada en dicha referencia, adaptada fielmente a la identidad visual de Candamil Abogados.
3. Trabajar de forma aislada y exclusiva sobre la página de `areas`, sin interferir ni tocar los archivos del `index` (portada), donde otro agente (Claude) está realizando modificaciones simultáneas.

## 2. Análisis de la Referencia (LawyerBase Modern 3 Columns)

En la página de referencia:
- **Estructura general:**
  - Encabezado de página (Page Title Banner) con título, subtítulo explicativo y migas de pan (Breadcrumbs).
  - Sección principal con contenedor centrado y rejilla de 3 columnas simétricas (3×3 = 9 áreas de práctica).
- **Diseño de las tarjetas (`gdlr-modern-practice`):**
  - Proporción de aspecto apaisada fija (aprox. 7:4 / 16:10, LawyerBase usa imágenes de 700×400 px).
  - Imagen de fondo contextual a la práctica legal.
  - Velo/capa de color sobre la imagen (en la demo es un velo de acento con opacidad 0.80 que transiciona a 0.36 al hacer hover).
  - Título centrado en la tarjeta en mayúsculas/titular, tipografía con remates/display, color blanco nítido y sombra para legibilidad.
  - Comportamiento hover: transición suave de opacidad del velo (300ms) y micro-zoom de la imagen de fondo (`scale-105`), revelando la fotografía sin comprometer el texto.
  - Enlace integral: la tarjeta completa es el elemento interactivo enlazable.

## 3. Adaptación a la Identidad y Arquitectura de Candamil Abogados

1. **Cero JavaScript de cliente (0 KB JS):**
   - La cuadrícula y sus efectos interactivos se implementan con CSS puro mediante utilidades de Tailwind CSS 4 y transiciones nativas de hardware (`transition-transform`, `transition-opacity`).
2. **Paleta de Marca:**
   - Estructura y confianza: Azul `#195BA9` (`marino-600`) y Navy `#0A2443` (`marino-900`) / `#0E345E` (`marino-800`).
   - El velo de las tarjetas usa Navy (`bg-marino-900/80` con degradado), garantizando un contraste superior a 7:1 para el texto blanco en reposo, y suavizando a ~40% en hover.
   - **Regla innegociable del rojo (`#A0373A` / `rojo-500`):** No se usa como adorno en la cuadrícula. Se reserva exclusivamente para acciones reales (el botón de conversión final "Agendar consulta").
3. **Tipografía:**
   - Titulares de sección y nombres de las tarjetas en Playfair Display (`font-display`).
   - Texto complementario e interfaz en la pila de sistema (`font-sans`).
   - Subrayado `destacado` en redonda (nunca cursiva).
4. **Catálogo de 9 Áreas (3×3):**
   Para lograr una cuadrícula equilibrada de 3 columnas de 3 filas como la demo, se cubren las áreas clave del bufete y del perito:
   1. *Derecho Laboral y Seguridad Social*
   2. *Derecho Civil y Responsabilidad*
   3. *Derecho de Familia y Sucesiones*
   4. *Derecho Penal y Defensa Técnica*
   5. *Derecho Inmobiliario y Tierras*
   6. *Derecho Administrativo y Disciplinario*
   7. *Peritaje y Avalúos Certificados*
   8. *Tránsito y Accidentes*
   9. *Conciliación y Asesoría Preventiva*
5. **Sección de Cierre de Conversión:**
   - Bloque claro (`bg-humo-100` o `bg-marino-50`) que respeta la alternancia cromática de la página, invitando a orientar al usuario en qué área encaja su caso con llamada a la acción en rojo de marca.
6. **Datos Centralizados:**
   - Teléfono, WhatsApp y datos de contacto leídos exclusivamente de `frontend/src/data/contacto.js`.

## 4. Criterios de Aceptación

1. La ruta `/areas/` (y `/areas`) compila de forma estática y responde con código HTTP 200 sin errores.
2. La cuadrícula muestra exactamente 9 áreas organizadas en 3 columnas en pantallas grandes (`lg:grid-cols-3`), 2 columnas en tableta (`md:grid-cols-2`) y 1 columna en móvil (`grid-cols-1`).
3. Cada tarjeta mantiene una proporción visual armónica (aprox. 16:10 / 7:4), con imagen de fondo, velo de tono marino y título centrado de alta legibilidad.
4. El efecto hover en las tarjetas reacciona de forma fluida con CSS puro (suavizado del velo y zoom suave de imagen).
5. Las tarjetas son accesibles: semántica de lista, etiquetas descriptivas, foco visible para navegación por teclado (anillo de foco accesible).
6. Se mantiene 0 KB de JavaScript añadido al cliente.
7. No se modifica ningún archivo del `index` ni componentes exclusivos de la portada.
