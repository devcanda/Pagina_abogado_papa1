# Tareas — Entidades certificadoras

## Panel

- [x] **T1** — `redimensionar()` aprende `ajuste: 'contener'` (`Math.min` y
      fondo transparente).
- [x] **T2** — El control de archivo lleva `data-ajuste`, y la ayuda dice
      «cabe entera, sin recortar».

## Datos

- [x] **T3** — `tituloCertificaciones` y el grupo `certificaciones` en el
      registro, con `nombre` obligatorio.
- [x] **T4** — `014-certificaciones-perito.sql`: cinco huecos de 320×160 y
      cinco entradas provisionales solo con nombre.

## Componente

- [x] **T5** — Franja a lo ancho bajo las dos columnas, con filete.
- [x] **T6** — Casilla clara por sello; `object-contain`.
- [x] **T7** — Sin logotipo se pinta el nombre.
- [x] **T8** — El rótulo en `marino-100`, no en rojo.
- [x] **T9** — `data-certificaciones` en la lista, para poder medirla sin
      confundirla con la de los puntos del servicio.

## Comprobación

- [x] **T10** — Cinco comprobaciones nuevas en `perito.test.mjs`.
- [x] **T11** — Las nueve suites: **184 comprobaciones**.
- [x] **T12** — Mirado a 1920, 1440, 1024, 768 y 390 px.

## Documentación

- [x] **T13** — AGENTS.md y MEMORY.md.
- [x] **T14** — Esta spec, escrita tarde y anotado que lo fue.

## Depende del cliente

- [ ] **T15** — Los **cinco logotipos**, preferiblemente PNG o WebP con fondo
      transparente.
- [ ] **T16** — Los **nombres reales** de las entidades. Los cinco actuales son
      provisionales y no pueden salir al hosting.
