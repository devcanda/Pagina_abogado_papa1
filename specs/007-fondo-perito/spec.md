# Especificación — Imagen de fondo en el bloque «Perito avaluador»

## Qué se pide

Que la franja del perito use una **fotografía a sangre por detrás del texto**,
como las láminas de la cabecera, en lugar de la ilustración enmarcada que lleva
hoy a la izquierda.

Petición del cliente, 12-11-2026, tomada sabiendo que **cambia el diseño del
bloque**: desaparece el marco rojo.

## Por qué no basta con añadir el campo

En la cabecera el fondo se ve porque **la mitad derecha de la lámina está
libre**. Aquí no lo está. Medido en la página:

| Ancho | Sección | Figura enmarcada | Columna de texto | Libre |
|---|---|---|---|---|
| 1920 px | 1905×689 | 21 %–48 % | 52 %–79 % | 0–21 % y 79–100 % |
| 1440 px | 1425×689 | 11 %–48 % | 52 %–89 % | 0–11 % y 89–100 % |
| 1280 px | 1265×689 | 6 %–47 % | 53 %–94 % | casi nada |
| 1024 px | 1009×717 | 2 %–47 % | 53 %–98 % | nada |
| 390 px | 390×1040 | apiladas, 8 %–34 % | 38 %–92 % | nada |

La figura es un `<img>` **opaco** que ocupa su columna entera. Entre 1024 y
1280 px tapa la mitad izquierda y el texto la derecha: un fondo detrás **no se
vería en absoluto**. Por eso la figura se retira cuando hay fondo; no es un
capricho estético, es la única forma de que la imagen encargada se vea.

## Qué cambia y qué no

- **Con fondo puesto:** no se pinta la figura ni su marco rojo. El texto se
  queda en la columna derecha y la foto ocupa la franja entera por detrás.
- **Sin fondo:** el bloque se ve **exactamente como hoy**, figura enmarcada
  incluida. Añadir el campo no cambia nada hasta que alguien suba una foto.
- **Se puede volver atrás desde el panel** eligiendo «— sin imagen —» en el
  fondo. La clave de la figura se conserva mientras tanto.

## El texto está a la DERECHA, al revés que en la cabecera

En el hero el texto ocupa la mitad izquierda y el velo se desvanece hacia la
derecha. Aquí es al contrario. **El velo de este bloque es el espejo del de la
cabecera**, y copiarlo tal cual dejaría el titular sin apoyo justo donde está.

## Medidas para encargar la imagen

- **Escritorio 1920×1080.** El navegador recorta arriba y abajo: solo se ve la
  banda `y 193–887` (el 64 % central). A anchos menores recorta además por los
  lados.
- **Móvil 1024×1536.** Recorta por los lados: se ve la banda `x 224–800`
  (el 56 % central).

El motivo va a la **izquierda** en escritorio y en la **mitad superior** en
móvil, que es donde no hay letras encima.

## Criterios de aceptación

1. Sin `imagenFondo`, la portada queda **idéntica** a como está hoy.
2. Con `imagenFondo`, la figura y su marco no se pintan y la foto llega a los
   bordes de la franja, sin barra de desplazamiento horizontal.
3. El texto sigue en la columna derecha a partir de 1024 px.
4. El velo tapa donde hay letras y se retira donde no las hay.
5. En móvil el velo es plano: ahí el texto ocupa todo el ancho.
6. Se puede quitar el fondo desde el panel y recuperar el diseño anterior.

## Lo que NO entra

- La imagen en sí. La genera el cliente; aquí se deja el hueco con el relleno
  de 1×1, como se hizo con las láminas.
- Tocar el resto de bloques con figura enmarcada.
