# Tareas

## 013 · Las seis fichas de áreas abren una descripción

- [x] **T1 · Registro.** En `rejillaTarjetas.campos.tarjetas.campos`: añadir
      `descripcion` (`parrafo`, max 160) y `mensaje` (`texto`, max 140,
      opcional). Marcar `enlace` con `reserva: 'descripcion'`. Añadir al
      bloque `textoConsulta` (`texto`, max 30).
- [x] **T2 · Backend.** `conciliar()` en `backend/src/admin/rutas.js` importa
      y usa `reservaSuperada()` de `formulario.js` en vez de su copia, que
      solo entiende arrays y borraría el `enlace` al guardar.
- [x] **T3 · Reiniciar la API.** Sin esto el panel no ve los campos nuevos y
      `sanearDatos` los descarta al guardar.
- [x] **T4 · Componente.** `RejillaTarjetas.astro`: la tarjeta es `<details>`
      cuando tiene descripción y `<a>` cuando no. `<summary>` es la cara
      actual, sin marcador de lista. Panel sobre `marino-800` con la
      descripción y el botón `btn-primario-oscuro` a `enlaceWhatsApp()`.
      Flecha girada 90° al abrir. `items-start` en la lista.
      `data-superficie="oscura"` en la sección.
- [x] **T5 · Migración `028`.** Las seis descripciones y los seis mensajes,
      tomados de `areas.js`, conservando `nombre`, `icono`, `imagen` y
      `enlace` de cada tarjeta.
- [x] **T6 · Comprobar en la página.**
  - [x] `dist/` sin ningún `.js`.
  - [x] Ningún `href` a `/areas/derecho-*`.
  - [x] Abrir y cerrar las seis a 1280 y a 390.
  - [x] Teclado: tabular hasta una ficha, abrir con Enter, llegar al botón.
  - [x] Objetivo táctil del botón ≥ 44 px.
  - [x] Contraste del texto del panel ≥ 4,5:1.
  - [x] La portada cerrada, idéntica a la de antes.
- [x] **T7 · Panel.** Pinta descripción y mensaje de las seis tarjetas y NO
      pinta `enlace`; con la descripción vacía vuelve a pintarlo. Comprobado
      llamando a `pintarCampos()` con los datos reales del bloque, sin pasar
      por el panel: así no hace falta sesión y no se escribe contenido.
- [ ] **T7b · PENDIENTE: guardar de verdad desde el panel** y comprobar que
      el `enlace` de las seis tarjetas sobrevive. No se ha ejercitado el
      camino completo porque exige sesión y **escribe sobre el bloque real**.
      Lo verificado es que `conciliar()` llama a `reservaSuperada()`, que
      devuelve `true` para estos datos —lo demuestra T7, que usa la misma
      función— y que la recursión de grupos le pasa la tarjeta guardada.
      Falta la vuelta completa. Hacerlo con copia previa y `finally`.
- [x] **T9 · El panel pasa a FLOTAR** (petición del cliente, mismo día):
      en absoluto sobre la cara, con el rótulo por encima y
      `pointer-events: none` para poder cerrar. Comprobado que la sección no
      cambia de alto y que el contenido cabe en las seis fichas a nueve
      anchos.
- [x] **T8 · Documentar** en `AGENTS.md` y `MEMORY.md`, incluida la pérdida
      de posicionamiento de cola larga y cómo volver atrás.
