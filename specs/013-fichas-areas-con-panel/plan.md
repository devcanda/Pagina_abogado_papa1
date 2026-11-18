# Plan Técnico

## 013 · Las seis fichas de áreas abren una descripción

### Dónde vive esto

| Pieza | Archivo |
|---|---|
| Componente | `frontend/src/components/bloques/RejillaTarjetas.astro` |
| Campos | `frontend/src/bloques/registro.js`, bloque `rejillaTarjetas` |
| Contenido | base de datos, bloque `rejillaTarjetas` (migración `028`) |
| Enlace a WhatsApp | `frontend/src/data/contacto.js`, `enlaceWhatsApp()` |

### D1 · `<details>` nativo, y el panel FLOTA sobre la tarjeta

Sin JavaScript solo hay una forma de que algo se abra al pulsarlo:
`<details>` + `<summary>`. El `<summary>` es la cara de la tarjeta tal como
está hoy; el panel es el hermano siguiente, **en absoluto sobre ella**.

**La primera versión lo puso EN FLUJO** —el panel debajo de la cara, la ficha
creciendo al abrirse— y **el cliente la rechazó**: abrir una ficha movía la
rejilla. Pidió texto flotante.

Se le habían advertido dos problemas antes de construirlo. Los dos eran
reales; así se resolvieron:

1. **«No cabe».** La tarjeta mide **219×273 px** de 1280 px para arriba, el
   caso más apretado de los nueve anchos probados; descontando los 20 px de
   relleno quedan 179×233. Cabe con la descripción a 13 px e interlineado
   ajustado. Medido en las **seis** fichas y a nueve anchos: ninguna desborda
   y la holgura más corta entre el botón y el rótulo es de **56 px**.
   **Si mañana alguien alarga una descripción, esto es lo primero que se
   rompe.**
2. **«No se podría cerrar».** Lo único que conmuta un `<details>` es su
   `<summary>`, y el panel lo tapa. Se resuelve por **dos caminos a la vez**,
   y los dos hacen falta:
   - El **rótulo** de abajo se pinta por encima del panel (`z-index: 2`
     contra el `1` del panel). Sigue a la vista, con su flecha ya girada, y
     pulsarlo cierra la ficha.
   - El panel **no intercepta el ratón** (`pointer-events: none`, con `auto`
     en sus hijos): pulsar en cualquier hueco atraviesa hasta el `<summary>`
     y también cierra.

**El salto del paso del ratón se anula con la ficha abierta**, y no es
cosmético: un `transform` sobre el `<summary>` crea contexto de apilamiento y
el rótulo quedaría atrapado dentro, yéndose detrás del panel justo al pasar
el ratón.

**El panel va en `marino-800`**, el navy de la propia tarjeta, no en el
`marino-900` de la sección: con el color de la sección la ficha abierta
pierde sus bordes y parece un agujero en la rejilla.

Resultado medido: la sección mide **791 → 791 px** en escritorio y
**859 → 859** en móvil al abrir una ficha.

Medidas de la tarjeta, para quien venga después:

| Ancho | Tarjeta | Por fila |
|---|---|---|
| 1280–1920 px | 219×273 | 3 |
| 1024 px | 267×333 | 2 |
| 768 px | 343×428 | 2 |
| 640 px | 279×348 | 2 |
| 390 px | 273×341 | tira horizontal |
| 360 px | 252×315 | tira horizontal |

### D2 · `items-start` en la lista

Nació para la versión en flujo: sin él, al abrir una ficha el resto de su fila
crecía y quedaba hueco bajo cada vecina.

**Con el panel flotante ya no hace falta** —ninguna ficha cambia de alto—,
pero se queda: no cuesta nada y protege el día que una tarjeta lleve contenido
de otra altura. No cambia nada con todas cerradas, porque el `aspect-4/5` ya
fija el alto de la cara.

### D3 · `descripcion` manda sobre `enlace`, con la regla de RESERVA

`enlace` pasa a `reserva: 'descripcion'`. Es la misma regla que ya usan los
campos sueltos de la cabecera frente a `laminas` y la figura del perito frente
a su `imagenFondo`:

- El componente pinta `<details>` si hay descripción y `<a>` si no.
- El panel **no enseña el campo `enlace`** mientras haya descripción. Enseñar
  los dos deja a quien edita sin saber cuál manda.
- El valor guardado **se conserva**: vaciar la descripción devuelve el enlace.

**Esto obliga a tocar el backend, y es un arreglo pendiente, no un rodeo.**
`conciliar()` en `backend/src/admin/rutas.js` lleva su **propia copia** de la
regla, y esa copia solo entiende reservas superadas por un ARRAY:

```js
const reservaSuperada = campo.reserva
  && Array.isArray(guardado?.[campo.reserva])
  && guardado[campo.reserva].length;
```

`formulario.js` exporta `reservaSuperada()`, que entiende arrays **y
cadenas**, y su comentario avisa literalmente de que duplicar la regla haría
que un día dejaran de coincidir. Ese día es hoy: con la copia estrecha,
guardar desde el panel **borraría el `enlace`** de las seis tarjetas, porque
el formulario no lo envía y `conciliar` no sabría conservarlo.

Se arregla importando la función compartida. No se toca nada más.

Por qué no explotó antes con el perito, que también tiene una reserva de
cadena: su campo superado es `tipo: 'imagen'`, y la rama de imágenes va
ANTES y ya conserva lo guardado. Fue suerte, no diseño.

### D4 · El mensaje de WhatsApp se puede dejar vacío

Campo `mensaje` por tarjeta. Si está vacío, el componente arma
«Hola, deseo una consulta sobre {nombre}.».

Obligar a escribir seis mensajes para que el botón funcione es la clase de
requisito que acaba con una tarjeta sin mensaje y un botón que abre WhatsApp
en blanco.

### D5 · El panel trae su propio fondo

La tarjeta tiene una foto detrás al 45 % de opacidad y un degradado. Un texto
de 13 px sobre eso es una moneda al aire, igual que pasa con los titulares de
la cabecera. El panel va sobre `marino-800` macizo, que es color de la paleta
y se mide una sola vez.

El botón va con `btn-primario-oscuro`: es el que lleva el filete claro que
exige el 3:1 de borde de WCAG 1.4.11 sobre fondo oscuro.

### D6 · La sección declara `data-superficie="oscura"`

No lo declaraba. Hasta ahora no importaba porque dentro solo había enlaces de
tarjeta; a partir de ahora hay un `<summary>` que se enfoca con el teclado y
un botón dentro del panel, y el anillo de foco azul no se ve sobre navy.

`global.css` ya contempla `summary` en esa regla. Y la regla que pega el pie
mira `main > *:last-child[data-superficie]`: esta sección no es la última de
la portada, así que no la afecta.

### Orden de ejecución

1. Registro: campos nuevos y `reserva` en `enlace`.
2. Backend: `conciliar()` usa la función compartida.
3. **Reiniciar la API.** El backend importa el registro al arrancar; con el
   proceso viejo, el panel no enseñaría los campos nuevos y `sanearDatos` los
   descartaría al guardar.
4. Componente.
5. Migración `028` con las seis descripciones y los seis mensajes.
6. Recompilar y comprobar.

### Lo que hay que comprobar, y con qué

- `dist/` sin un solo `.js`.
- Ningún `href` a `/areas/derecho-*` en la portada.
- Abrir y cerrar las seis a 1280 y a 390, con ratón y con teclado.
- Que la portada cerrada sea idéntica a la de antes (captura byte a byte).
- Que el panel del bloque pinte descripción y mensaje, y no pinte `enlace`.
