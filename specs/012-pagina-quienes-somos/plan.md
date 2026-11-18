# Plan de Implementación — Página Quiénes Somos (Spec 012)

## 1. Archivos a Modificar / Crear
1. `frontend/src/pages/[...slug].astro`: Excluir `'quienes-somos'` del filtro de `getStaticPaths()` junto a `'inicio'`, evitando colisión de rutas estáticas.
2. `frontend/src/components/quienes-somos/GaleriaEspecialidades.astro`: Componente sin JavaScript (radios + `:has()`) que replica el slider con miniaturas de la página original para *Asesoría Penal*, *Derecho a la Salud* y *Especialista en Derecho Laboral*.
3. `frontend/src/pages/quienes-somos/index.astro`: Página corporativa completa con:
   - Hero Navy (`Candamil Asociados Abogados`).
   - Sección «Quiénes somos» sobre `bg-humo` con `GaleriaEspecialidades` a la izquierda y la historia, linaje, promesa y botón «Contáctanos» a la derecha.
   - Sección «Diego A. Candamil R. · Abogado Especialista» sobre `bg-white` con tarjeta editorial de perfil, fotografía `/img/hero-abogado.webp` y biografía completa.

## 2. Verificación
- Compilación `npm --prefix frontend run build` sin advertencias de rutas duplicadas.
- Verificar que `dist/quienes-somos/index.html` se genera con 0 KB de JS de cliente y todas sus imágenes existen en `dist/img/`.
- Actualizar `MEMORY.md`.
