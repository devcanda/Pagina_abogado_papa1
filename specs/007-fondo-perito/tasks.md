# Tareas — Fondo del bloque «Perito avaluador»

## Datos y registro

- [x] **T1** — Ampliar `reservaSuperada()` para que una **cadena no vacía**
      también supere a su campo de reserva. Sin duplicar la regla.
- [x] **T2** — `servicioDestacado` en `registro.js`: `imagenFondo`,
      `imagenFondoMovil`, `velo`. Y `imagen` pasa a `reserva: 'imagenFondo'`.

## Componente

- [x] **T3** — Capa de fondo dentro de la sección, con `<picture>` y la fuente
      vertical para móvil.
- [x] **T4** — Velo **espejo** del de la cabecera, con el corte en `lg`.
- [x] **T5** — La figura y su marco no se pintan cuando hay fondo; el texto se
      queda en la columna derecha con `lg:col-start-2`.

## Base

- [x] **T6** — `013-fondo-perito.sql`: huecos `fondo-perito` (1920×1080) y
      `fondo-perito-movil` (1024×1536), con el relleno de 1×1.
- [x] **T7** — Los dos PNG de 1×1 en `frontend/public/img/`.

## Comprobación

- [x] **T8** — Suite `perito.test.mjs` (ver plan), encadenada en `npm run probar`.
- [x] **T9** — Pasar las ocho suites existentes: este bloque sale en la portada
      y lo recorren `bloques`, `imagenes` y `publicar`.
- [x] **T10** — Mirarlo a 1920, 1440, 1024, 768 y 390 px con una imagen de
      prueba, y comprobar que sin fondo la portada queda idéntica.

## Documentación

- [x] **T11** — AGENTS.md: el porqué de retirar la figura, el velo espejo y el
      corte en `lg`, y las medidas para encargar la imagen.
- [x] **T12** — MEMORY.md.

## Depende del cliente

- [x] **T13** — La **imagen**, entregada el 12-11-2026 y ya publicada.
      Compuesta con las dos herramientas nuevas; velo `fuerte`, elegido
      midiendo el contraste.

## Lo que salio de hacerlo

- `fondos.test.mjs` nombraba los tres huecos de 1920x1080 por su clave y se
  puso roja al aparecer el cuarto. Ahora compara contra la base.
- `redes.test.mjs` tenia el mismo sondeo de publicacion que media el sitio
  anterior. Corregido tambien ahi.
- Las nueve suites: **178 comprobaciones**.
