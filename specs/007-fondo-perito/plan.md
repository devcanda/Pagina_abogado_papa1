# Plan Técnico — Fondo del bloque «Perito avaluador»

## Se copia la receta de la cabecera, no se inventa otra

La capa de fondo del hero ya resolvió lo difícil: salir del contenedor
centrado, recortar el sobrante, el velo por componentes y la fuente vertical
para móvil. Repetir esa estructura aquí hace el bloque predecible para quien
venga después.

```
servicioDestacado
├── imagen                 figura enmarcada  → RESERVA de imagenFondo
├── imagenFondo            1920×1080, a sangre
├── imagenFondoMovil       1024×1536, opcional
└── velo                   ninguno/ligero/medio/fuerte/opaco
```

## `reserva` tiene que entender también una cadena

`reservaSuperada()` hoy solo mira **arrays**: nació para los campos sueltos de
la cabecera frente al grupo `laminas`. Aquí lo que supera a `imagen` es
`imagenFondo`, que es una cadena.

Se amplía la función —**no se duplica la regla**, que es justo lo que su
comentario advierte—: un campo de reserva queda superado si el campo al que
apunta es un array con elementos **o** una cadena no vacía. Los usos actuales
apuntan todos a `laminas`, así que la rama nueva no cambia ninguno.

## Dónde va la capa

**Dentro de la sección**, que ya lleva `relative overflow-hidden`. No hace
falta el truco de `left: 50%; width: 100vw` del hero: allí la capa vivía dentro
de una lámina con `transform`, que crea bloque contenedor. Aquí el ancestro
posicionado es la sección entera, así que un `inset: 0` basta y se recorta
solo.

- La capa en `z-0`; el contenedor de contenido ya lleva `relative`, y se le
  añade `z-10` para que el texto quede por encima.
- La **palabra de fondo** (`Avalúos`, blanco al 4 %) se mantiene: sobre una
  foto oscura casi no se ve, y quitarla es una decisión de diseño que nadie ha
  pedido.

## El velo es el ESPEJO del de la cabecera

| | Cabecera | Aquí |
|---|---|---|
| Texto | mitad izquierda | mitad derecha |
| Velo a plena fuerza | 0 %–38 % | 62 %–100 % |
| Se retira en | 82 % | 18 % |
| Corte a dos columnas | `md` (768 px) | **`lg` (1024 px)** |

El punto de corte **no es el mismo**, y copiarlo sería un fallo silencioso:
esta sección pasa a dos columnas en `lg`, así que entre 768 y 1023 px el texto
ocupa todo el ancho y necesita el velo plano. Con el `md` del hero, esa franja
de anchos se quedaría con medio titular sobre la foto.

El color del velo sale de `marino-900`, que es el fondo declarado de la
sección, para que no se vea costura.

## Qué pasa con la columna izquierda

Si no se pinta la figura, el texto caería en la primera columna de la rejilla.
Se evita con `lg:col-start-2` en el bloque de texto cuando hay fondo. Por
debajo de `lg` la rejilla es de una columna y no hay nada que colocar.

## Migración

`013-fondo-perito.sql` inserta dos huecos en `medios`:

- `fondo-perito` — 1920×1080
- `fondo-perito-movil` — 1024×1536

Nacen apuntando a un **PNG de 1×1 transparente**, como los del hero: la columna
`archivo` no admite nulos y una ruta a un archivo que no existe deja un
recuadro roto en el panel. El sitio público no los pide hasta que alguien los
elige.

**No toca el contenido del bloque.** `imagenFondo` nace ausente, así que la
portada se publica igual que hoy.

## Pruebas

Suite nueva, `perito.test.mjs`, con las reglas de la casa —copia al empezar,
devolución en un `finally`, nada de nombrar contenido—:

- Sin fondo, la sección conserva la figura.
- Con fondo, la figura **no se pinta** y la capa llega a los bordes de la
  sección, medido a 390, 768, 1280 y 1920 px.
- No aparece barra de desplazamiento horizontal en ninguno de esos anchos.
- El texto sigue empezando pasada la mitad a partir de 1024 px.
- Entre 768 y 1023 px el velo es **plano**, no degradado.
- El hueco de imagen se devuelve con su archivo y su fila, como aprendió
  `fondos.test.mjs` por las malas.

## Riesgos

| Riesgo | Qué hacemos |
|---|---|
| El titular blanco se pierde sobre la foto | El campo `velo`, y se mira. El contraste sobre una foto no se puede medir desde el panel |
| Alguien sube una foto con el motivo a la derecha | Queda bajo el texto. Se documentan las medidas en AGENTS.md y en la spec |
| Se pierde el marco rojo, uno de los pocos acentos de marca | Es lo pedido; queda anotado como decisión, no como descuido |
| `reservaSuperada` amplía su contrato | Los usos actuales apuntan a arrays; la rama nueva no los toca. Lo cubre la suite del editor |
