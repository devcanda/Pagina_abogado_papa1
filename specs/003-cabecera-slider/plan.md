# Plan Técnico — Cabecera en carrusel

## Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `frontend/src/bloques/registro.js` | Añadir el campo `laminas` (grupo, máx. 3) al bloque `cabecera`. |
| `frontend/src/components/bloques/Cabecera.astro` | Pintar N láminas apiladas + controles. |
| `frontend/src/styles/global.css` | Reglas del carrusel (no se pueden expresar con utilidades sueltas). |
| `AGENTS.md`, `MEMORY.md` | Documentar la decisión. |

## Archivos a Crear

| Archivo | Para qué |
|---|---|
| `backend/db/006-cabecera-laminas.sql` | Pasar la cabecera publicada a tres láminas. |
| `specs/003-cabecera-slider/*` | Esto. |

## Estrategia de Implementación

### 1. El dato

`laminas` es un campo `grupo`, que el registro ya soporta y que `resolverMedios`
ya recorre para resolver las imágenes por clave. **No hace falta tocar el
renderizador ni el panel**: ambos se mueven por el registro.

```js
laminas: {
  tipo: 'grupo', max: 3,
  campos: { etiqueta, titulo, subtitulo, imagen, textoBoton, enlaceBoton,
            textoBoton2, enlaceBoton2 },
}
```

Los campos sueltos de hoy **se conservan** como reserva. El componente hace:

```js
const laminas = datos.laminas?.length ? datos.laminas : [ {campos sueltos} ];
```

Así una cabecera vieja sigue pintando lo mismo y la migración no es obligatoria.

### 2. La mecánica, sin JavaScript

Tres `<input type="radio" name="cabecera-lamina">` ocultos al principio de la
sección, el primero con `checked`. Las láminas se apilan en **una sola celda de
rejilla** (`grid-area: 1/1`), de modo que la altura de la sección es la de la
lámina más alta y no da saltos al cambiar.

La lámina activa se selecciona con `:has()` sobre el contenedor:

```css
.cabecera-carrusel:has(#cabecera-lamina-2:checked) [data-lamina="2"] { ... }
```

`:has()` está en todos los navegadores desde 2023. Para uno que no lo soporte,
la regla entera se ignora y **se ven las tres láminas apiladas**: feo, pero
legible y con todos los enlaces accesibles. Degrada hacia el contenido, no hacia
una página rota.

Los puntos son `<label for>`, con 44px de objetivo táctil.

### 3. Prioridad de carga

La foto de la lámina 1 conserva `fetchpriority="high"`. Las otras dos pasan a
`loading="lazy"` y `fetchpriority="low"`: están en pantalla geométricamente, así
que el navegador las pedirá, pero **después** de la que marca el LCP.

## Impacto en Base de Datos / Estado

Ninguno en el esquema: `datos` es JSONB y `laminas` es una clave más. Solo
cambia el contenido del bloque `cabecera`, con la migración `006`.

La migración actúa sobre **todas** las revisiones, no solo la publicada, por el
mismo motivo que la `005`: deshacer un cambio desde el panel no debe resucitar
la cabecera de una sola lámina.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Las láminas 2 y 3 pesan menos para SEO: `visibility:hidden` devalúa su texto. | Asumido. La propuesta principal va en la lámina 1, que está visible. Las otras dos tienen su propia sección completa más abajo en la página, que sí indexa con normalidad. |
| Tres fotos en lugar de una encarecen la portada. | `lazy` + `low` en las dos secundarias; se mide el peso antes y después. |
| La altura de la sección la fija la lámina más larga. | Se limitan los textos en el registro (`max`) para que las tres queden parejas. |
