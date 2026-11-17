# Plan de Implementación — Cuadrícula de Áreas de Práctica (Spec 010)

## 1. Arquitectura de Archivos

Para asegurar aislamiento total respecto al trabajo que realiza Claude en el `index`:
- `frontend/src/data/areas.js`: Definición estructurada de las 9 áreas de práctica con slug, título, descripción corta, imagen, icono SVG y llamada a acción.
- `frontend/src/components/areas/TarjetaAreaModerna.astro`: Componente reutilizable y accesible que replica el estilo "Modern Practice Area" de LawyerBase adaptado a la identidad de Candamil Abogados.
- `frontend/src/pages/areas/index.astro`: Página completa con layout corporativo, banner de encabezado, cuadrícula de 3 columnas y bloque de conversión final.

## 2. Fases de Ejecución

### Fase 1: Datos y Activos
1. Crear `frontend/src/data/areas.js` con las 9 áreas del bufete, vinculando imágenes optimizadas existentes en `public/img/` o SVGs de respaldo.
2. Comprobar resolución de rutas de imágenes y textos alternativos.

### Fase 2: Componente de Tarjeta Moderna (`TarjetaAreaModerna.astro`)
1. Implementar estructura semántica de tarjeta enlazada (`<article>` o `<li><a ...>`).
2. Implementar contenedor con `aspect-[16/10]` o `aspect-[7/4]`, esquinas sutilmente redondeadas (`rounded-lg`), sombra suave y borde atenuado.
3. Capa de imagen con `object-cover size-full group-hover:scale-105 transition-transform duration-500 ease-out`.
4. Capa de velo (`bg-gradient-to-t from-marino-950/90 via-marino-900/75 to-marino-800/60 group-hover:opacity-40 transition-opacity duration-300`).
5. Título centrado con `font-display text-white text-xl md:text-2xl font-bold tracking-wide text-center drop-shadow-md`.
6. Indicador visual discreto (línea sutil o botón accesible).
7. Estados de foco (`focus-visible:ring-2 focus-visible:ring-marino-400`).

### Fase 3: Página `/areas/index.astro`
1. Importar `Layout.astro` con modo corporativo.
2. Encabezado de página con título "Áreas de práctica", subtítulo y migas de pan.
3. Sección de cuadrícula: Contenedor con `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`.
4. Sección inferior de consulta con llamada a la acción hacia WhatsApp y teléfono (`contacto.js`).

### Fase 4: Verificación y Compilación
1. Ejecutar `npm run build` en `frontend/` para verificar compilación limpia y generación de `dist/areas/index.html`.
2. Verificar en el servidor local que `/areas/` responde correctamente.
3. Actualizar `MEMORY.md` documentando la nueva ruta y la resolución del pendiente 404 de `/areas/`.
