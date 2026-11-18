# Tareas — Página Quiénes Somos (Spec 012)

- [x] **Tarea 1: Evitar colisión en `frontend/src/pages/[...slug].astro`**
  - Excluir `'quienes-somos'` junto a `'inicio'` en `getStaticPaths()`.

- [x] **Tarea 2: Crear `frontend/src/components/quienes-somos/GaleriaEspecialidades.astro`**
  - Implementar selector interactivo por miniaturas sin JavaScript (`<input type="radio">` + `:has()`).
  - Incluir las 3 especialidades con descripción jurídica profesional (corrigiendo el borrador roto de Asesoría Penal).

- [x] **Tarea 3: Crear `frontend/src/pages/quienes-somos/index.astro`**
  - Maquetar encabezado, sección «Quiénes somos» con linaje jurídico completo y sección de perfil del fundador Diego A. Candamil R.

- [x] **Tarea 4: Compilar y verificar**
  - Ejecutar `npm --prefix frontend run build`.
  - Confirmar 0 KB de JS propio y ausencia de conflictos de ruta.

- [x] **Tarea 5: Actualizar `MEMORY.md`**
  - Documentar la página dedicada `/quienes-somos/`.
