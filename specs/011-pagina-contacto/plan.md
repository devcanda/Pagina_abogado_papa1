# Plan de Implementación — Página de Contacto (Spec 011)

## 1. Archivos a Modificar / Crear
1. `frontend/src/data/contacto.js`: Añadir `telefonoFijo` (`602 2261303`) y `horario` (`8:00 a. m. – 6:00 p. m.`, `Lunes a viernes`) en la fuente única de contacto.
2. `frontend/src/pages/contacto/index.astro`: Página corporativa completa con:
   - Hero Navy con titular y mensaje de cercanía del abogado.
   - Rejilla de 3 bloques modernos sobre `bg-humo` (Nuestra Oficina, Canales Directos, Compromiso y Horarios).
   - Sección de mapa interactivo embebido de Google Maps (`bg-white`) antes del pie oscuro.

## 2. Verificación
- Compilación `npm --prefix frontend run build` sin errores.
- Comprobación de que `/contacto/index.html` existe y contiene 0 KB de scripts propios.
- Actualización de `MEMORY.md` marcando `/contacto/` como resuelto.
