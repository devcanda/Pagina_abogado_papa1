# Tareas

## 014 · SEO profundo y marco legal

### Fase 1 · Lo que impide que Google haga su trabajo

- [x] **T1 · Sitemap.** Instalar `@astrojs/sitemap`, excluir el 404 y
      comprobar que `sitemap-index.xml` existe y lista las páginas reales.
- [x] **T2 · `robots.txt`** apuntando al sitemap que de verdad se genera.
- [x] **T3 · Quitar el `preconnect` a `http://localhost:3000`** de las seis
      páginas. El sitio es estático y no llama a la API en el navegador.

### Fase 2 · Señales de cada página

- [x] **T4 · Descripciones dentro de rango** (120–160): `/contacto/` 219 →,
      `/areas/` 180 →, portada 113 →, `/demanda-laboral/` 93 →.
- [x] **T5 · Arreglar «Valle del Cauca, Valle del Cauca»** en la descripción
      de `/quienes-somos/`.
- [x] **T6 · Un solo `<h1>` en la portada.** Láminas 2 y 3 a **`<h2>`**, no a
      `<p>` como decía el plan: así su titular sigue siendo un encabezado
      cuando esa lámina está a la vista. Mismas clases. Comprobado con la
      línea base: **0 píxeles de diferencia en las siete vistas**.

### Fase 3 · Datos estructurados

- [x] **T7 · Entidad única** `LegalService` con `@id`, dirección, geo,
      horario, teléfono, correo, logo, fundador y `priceRange`, toda ella
      alimentada desde `contacto.js`.
- [x] **T8 · Las demás páginas la referencian por `@id`**, no la copian.
- [x] **T9 · `BreadcrumbList`** en las páginas interiores.
- [ ] **T10 · `FAQPage`** recuperando las preguntas de la migración `030`,
      que son exactamente el material que este fragmento necesita.
- [ ] **T11 · Validar** el JSON-LD con el validador de Google.

### Fase 4 · Marco legal

- [x] **T12 · `/tratamiento-de-datos/`** — RESUELTA SIN CREAR LA PÁGINA.
      Al ir a escribirla se vio que **`/politica-de-privacidad/` ya ES la
      Política de Tratamiento de la Información**: así se titula dentro y
      cubre responsable, finalidades, derechos, canal y procedimiento. El pie
      ofrecía dos etiquetas para el mismo documento, lo que hace dudar sobre
      cuál es el bueno. Se deja un solo enlace, rotulado «Tratamiento de
      datos», que es lo que de verdad es.
- [x] **T13 · `/terminos-y-condiciones/`** — con el aviso de que el contenido
      no crea relación abogado-cliente.
- [ ] **T14 · Apartado de analítica** en la política de privacidad, cuando
      GA4 entre.
- [ ] **T15 · PENDIENTE del cliente:** NIT y plazo de conservación.

### Fase 5 · Medición

- [ ] **T16 · Search Console**: generar el archivo de verificación y dejar
      escrito el procedimiento. 0 KB, 0 cookies.
- [ ] **T17 · GA4 con consentimiento previo**, si el cliente lo aprueba
      sabiendo que rompe los 0 KB de JavaScript.

### Fase 6 · Contenido (decide el cliente)

- [ ] **T18 · D5: las seis páginas de área.** Es la pieza de SEO con más
      recorrido y contradice la decisión del 18-11. No se toca sin su visto
      bueno.
- [ ] **T19 · Perfiles reales de redes.** Hoy el bloque lleva `@tiktok`,
      `facebook.com/meta` y «Me at the zoo»: **no puede publicarse así**.
- [ ] **T20 · `/blog/`**, que sigue enlazado desde el pie y no existe.

### Comprobaciones finales

- [ ] Cero enlaces internos rotos.
- [ ] Un `<h1>` por página.
- [ ] Ninguna descripción fuera de 120–160.
- [ ] La línea base visual sin diferencias inesperadas.
