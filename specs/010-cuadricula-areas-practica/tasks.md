# Tareas — Cuadrícula de Áreas de Práctica (Spec 010)

- [x] **Tarea 1: Estructurar catálogo de datos de áreas (`frontend/src/data/areas.js`)**
  - Definir las 9 áreas con sus metadatos (nombre, descripción, imagen, enlace, icono).
  - Asegurar correspondencia con imágenes disponibles en `public/img/`.

- [x] **Tarea 2: Crear componente de tarjeta moderna (`frontend/src/components/areas/TarjetaAreaModerna.astro`)**
  - Maquetar estructura con imagen, velo interactivo y título centrado.
  - Implementar animaciones CSS (zoom sutil y transición de opacidad).
  - Asegurar contraste WCAG AA y accesibilidad por teclado.

- [x] **Tarea 3: Crear página de áreas (`frontend/src/pages/areas/index.astro`)**
  - Integrar encabezado de página corporativo con breadcrumbs.
  - Renderizar cuadrícula de 3 columnas responsiva.
  - Añadir sección de cierre con llamada a consulta gratuita y datos de contacto centralizados.

- [x] **Tarea 4: Compilación, pruebas y verificación estática**
  - Ejecutar build de Astro (`npm run build`).
  - Verificar que `dist/areas/index.html` se crea y valida con 0 KB de JS de cliente.
  - Verificar navegación sin 404 desde los enlaces del sitio.

- [x] **Tarea 5: Actualizar `MEMORY.md`**
  - Registrar la implementación de `/areas/` y actualización de pendientes.
