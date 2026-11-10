# Especificación Funcional (Spec) — 001 Fundación de la Arquitectura

- **Objetivo:** Dejar en pie el esqueleto completo del sitio y la API de
  candamilabogados.com, ejecutable en local y desplegable en cPanel 110, con
  un sistema de layouts que distinga páginas corporativas de landings de campaña.

- **Requisitos de Negocio (criterios de aceptación):**
  1. El contenido de cada página vive en PostgreSQL, no en el código; el bufete
     puede crear una landing sin intervención de un desarrollador.
  2. Una página con `es_landing_page = TRUE` se renderiza **sin Navbar y sin
     Footer**: ningún enlace que permita abandonar el embudo de conversión.
  3. Una página con `es_landing_page = FALSE` se renderiza con Navbar completo
     y Footer con enlaces internos (reparto de autoridad SEO).
  4. En móvil siempre hay un botón de contacto fijo en la parte inferior
     (Sticky CTA) que no tapa el final del contenido.
  5. Los textos legales largos se presentan en acordeones.
  6. El frontend obtiene los datos mediante `fetch()` a la API de Node.
  7. La API expone `GET /api/paginas/:slug` devolviendo el registro completo.

- **Casos Límite:**
  - *La API no responde durante el build:* el build no debe abortar; se registra
    el error y se generan las páginas estáticas que no dependen de la API.
  - *Slug inexistente:* la API devuelve 404 y el cliente devuelve `null`, de modo
    que Astro no genere una ruta vacía.
  - *Página despublicada:* `publicado = FALSE` la excluye del listado y del
    acceso por slug.
  - *Sin `OPENAI_API_KEY`:* el bot responde en modo degradado pidiendo los datos
    de contacto; el resto de la API sigue operativa.
  - *Lead sin consentimiento de datos:* se rechaza con 400 (Ley 1581 de 2012).
  - *Pantalla con muesca (iOS):* el Sticky CTA respeta `safe-area-inset-bottom`.

- **Fuera de alcance (va a specs posteriores):**
  Widget de chat en el frontend, formulario de leads en el frontend, panel de
  administración de contenido, sitemap automático y blog.
