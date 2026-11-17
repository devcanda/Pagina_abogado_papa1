# Plan — «Nuestros clientes»

## Pieza nueva: el bloque `muroClientes`

No se reutiliza `rejillaTarjetas` ni `tarjetasConFoto`. Los dos pintan
**tarjetas con texto**; esto es una tira de marcas ajenas sin texto, con su
propia normalización por área y su propio respaldo por nombre. Forzarlo dentro
de un bloque de tarjetas habría significado llenar sus campos de excepciones.

```
muroClientes
  rotulo        texto, 40    versales sobre la fila. Vacío, no se pinta
  titulo        texto, 70    opcional
  clientes      grupo, 12
      nombre    texto, 60    REQUERIDO. Es el alt y el respaldo
      imagen    imagen 320x160, ajuste 'contener'
      enlace    enlace       opcional, hoy sin usar
  colorTitulo   color
  colorRotulo   color
  tono          oscuro
```

El lienzo **320×160 es el mismo que el de los avales del perito**, y a
propósito: son dos tiras de logotipos ajenos con el mismo problema, y compartir
medida significa compartir la herramienta de preparación y el desplegable de
huecos del panel.

## La herramienta

`herramientas/preparar-logos-clientes.mjs`. Hace tres cosas en orden:

1. **Quita el velo.** Los originales llevan blanco a alfa ≈ 38 en todo el
   rectángulo. Se mide el alfa del BORDE —que es fondo seguro— y se reescala el
   canal: `a' = (a - suelo) * 255 / (255 - suelo)`, recortado a 0.
   **No se usa un umbral duro** (`a < 64 → 0`): eso se comería el antialiasing
   de los bordes de la letra y el logotipo saldría dentado.
2. **Recorta lo transparente** que sobra alrededor.
3. **Coloca con área óptica igualada** en el lienzo de 320×160, sujeto al
   lienzo, y guarda WebP con canal alfa.

`AREA = 23000 px²`, y el número **no es redondo porque no puede serlo**: con
margen del 4 % el hueco útil es 307×154, así que la pieza cuadrada (1,00) pide
`√A ≤ 154` → `A ≤ 23 716`, y la más apaisada (3,94) pide `√(A·3,94) ≤ 307` →
`A ≤ 23 925`. El tope lo marca la Cámara de Comercio, no Dixtrital.

## La migración

`019-nuestros-clientes.sql`, en una transacción:

1. `UPDATE bloques SET visible = FALSE WHERE tipo = 'franjaCierre'` — se apaga,
   no se borra (criterio 8).
2. `INSERT` del bloque `muroClientes` **en el mismo `orden`** que tenía la
   franja de cierre, para no mover el resto de la portada.
3. `INSERT` de siete filas en `medios`, con claves `cliente-1` … `cliente-7` y
   medida sugerida 320×160.

Las claves van numeradas y **no llevan el nombre del cliente**: un hueco es un
sitio, no una marca. El día que el bufete cambie de cliente se sustituye la
foto desde el panel y la clave sigue valiendo; con `cliente-dolormed` habría
que tocar la base.

## El componente

`MuroClientes.astro`, tono oscuro.

- Fila con `flex-wrap`, centrada. **Una fila donde cabe, envuelta donde no**
  (D4): con siete piezas, la fila única del móvil daría 48 px por logotipo.
- Sin pastilla ni superficie: la tinta es blanca y la franja es navy, así que
  no hace falta lo que sí hacía falta en los avales del perito.
- Sin logotipo se pinta el **nombre**, igual que en los avales.
- El `<img>` limita el **LIENZO**, no el logotipo, o se deshace la
  normalización por área.

## Qué se comprueba

`clientes.test.mjs`, en la línea de `perito.test.mjs`:

1. Sale un logotipo por cliente declarado.
2. Ninguna casilla queda vacía — midiendo el archivo **en Node**, no
   `naturalWidth` en el navegador: este equipo no dispara la carga diferida.
3. Todo logotipo lleva `alt`.
4. Una fila en escritorio; envuelta y sin desbordar en móvil.
5. La franja de cierre ya no se pinta.
6. La prueba escribe sobre el bloque real, así que **guarda copia y la devuelve
   en un `finally`**, con las variables declaradas FUERA del `try`.
