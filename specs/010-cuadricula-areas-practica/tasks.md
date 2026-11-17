# Tareas — Cuadrícula de Áreas de Práctica y Servicios (Spec 010)

- [x] **Tarea 1: Estructurar catálogo de datos de áreas (`frontend/src/data/areas.js`)**
  - Definir los 15 servicios estructurados con sus metadatos e imágenes optimizadas WebP.
  - Añadir los 3 planes de tarifas de asesoría rescatados del WordPress.

- [x] **Tarea 2: Crear componente de tarjeta moderna (`frontend/src/components/areas/TarjetaAreaModerna.astro`)**
  - Maquetar estructura con imagen, velo interactivo y título centrado (patrón LawyerBase Modern).
  - Implementar animaciones CSS (zoom sutil y transición de opacidad).
  - Asegurar contraste WCAG AA, padding responsivo y accesibilidad por teclado.

- [x] **Tarea 3: Crear página de áreas (`frontend/src/pages/areas/index.astro`)**
  - Encabezado limpio: retiradas las migas de pan y el rótulo superior por petición expresa.
  - Renderizar cuadrícula simétrica de 3 columnas (5 filas x 3 columnas = 15 servicios).
  - Incorporar sección de modalidades de atención y planes de tarifas fijas ($100k, $120k, $150k).
  - Añadir sección de cierre con llamada a consulta y datos de contacto centralizados.

- [x] **Tarea 4: Compilación, pruebas y verificación estática**
  - Ejecutar build de Astro (`npm run build`).
  - Verificar que `dist/areas/index.html` se crea con 0 KB de JS de cliente y todas las imágenes presentes.
  - Verificar navegación sin 404 desde los enlaces del sitio.

- [x] **Tarea 5: Actualizar `MEMORY.md`**
  - Registrar la implementación completa de `/areas/` y actualización de pendientes.
