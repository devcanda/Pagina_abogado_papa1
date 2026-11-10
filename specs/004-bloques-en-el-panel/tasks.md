# Tareas de Implementación — El panel se organiza por bloques

## Dato
- [x] T1: Columnas `visible` y `rotulo` en `bloques` (migración 007).
- [x] T2: Rótulos iniciales en castellano llano, por tipo y no por id.
- [x] T3: `bloquesPublicados` filtra por `visible`.

## Panel
- [x] T4: `GET /panel/bloques` agrupa las imágenes bajo su bloque.
- [x] T5: Interruptor por bloque, solo para `admin`.
- [x] T6: `POST /panel/bloques/:id/visibilidad` con CSRF y auditoría.
- [x] T7: Grupo «Sin bloque asignado» para lo que no usa nadie.
- [x] T8: Aviso de que la visibilidad necesita recompilar.
- [x] T9: `/panel/imagenes` redirige a la pantalla nueva.

## Validación
- [x] T10: Suite nueva de la pantalla de bloques — 20/20.
- [x] T11: Suite anterior del panel, actualizada — 13/13.
- [x] T12: El rol `editor` no puede apagar: interruptores inhabilitados y 403.
- [x] T13: Comprobado que un bloque apagado no sale en el HTML compilado.
- [x] T14: Documentar en `AGENTS.md` y `MEMORY.md`.

## Resultado

| Comprobación | Resultado |
|---|---|
| Salen los 8 bloques, con sus rótulos | ok |
| Las 3 fotos del slider, bajo «Slider principal» | ok |
| Las 6 áreas, bajo «Bloque de servicios del índice» | ok |
| Un bloque sin imágenes también sale | ok |
| Apagar quita el bloque de la API | 8 → 7 bloques |
| Apagado, no sale en el HTML compilado | `caso-1.webp` 1 → 0 |
| La ficha apagada sigue en el panel, atenuada | ok |
| Un `editor` no puede apagar | 8 casillas inhabilitadas + 403 |
| Sin sesión, ni ver ni apagar | 302 / 401 |
| Sin CSRF, bloque inexistente, id malo, campo malo | 403 / 404 / 400 / 400 |

## Dos fallos ANTERIORES que salieron al probar esto

### El JavaScript del panel nunca se ejecutó en un navegador

`helmet` pone `script-src 'self'`, que prohíbe el script en línea. El panel
lleva el suyo dentro de la página, así que estaba bloqueado **entero**: no solo
los interruptores nuevos, también **la subida de imágenes**, que es la razón de
ser del panel.

No se había detectado porque todo lo que lo ejercitaba —`panel.test.mjs`,
`asignar-imagenes.mjs`— lo hacía con `fetch` desde Node, y un `fetch` de
servidor no aplica CSP. Las pruebas pasaban y el navegador no hacía nada.

Corregido con un nonce por petición. Comprobado subiendo una imagen desde el
navegador de verdad, con `DataTransfer` sobre el `<input type=file>` real.

### Las vistas previas salían en gris en local

El backend no servía `/img`, y en local vive en otro puerto que las imágenes.
En producción lo tapaba Apache. Añadido un montaje estático solo para
desarrollo.

### Y uno mío, encontrado en la misma prueba

La CSP que acababa de escribir llevaba `img-src 'self' data:` y rompía la
subida: el panel carga la imagen elegida desde un `URL.createObjectURL`, que es
`blob:`. Fallaba con «el archivo no es una imagen». Salió al probar la subida
de extremo a extremo en el navegador, no antes.
