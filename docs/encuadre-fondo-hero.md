# Encargo de una imagen de fondo para la cabecera

Especificación para quien produzca la imagen (fotógrafo, banco de imágenes o
generador). Los números salen de **medir en el navegador**, no de estimarlos:
`herramientas/plantilla-fondo-hero.mjs` dibuja estas mismas zonas sobre un
lienzo y deja `docs/encuadre-fondo-hero.png` listo para pasárselo a quien haga
la imagen.

## Lo técnico

| Qué | Valor | Por qué |
|---|---|---|
| Medidas | **1920 × 1080 px** | Es la medida del hueco en la biblioteca |
| Relación | **16:9 exacta** | El panel recorta al centro cualquier otra, sin avisar |
| Mayor tamaño | Vale, si mantiene 16:9 (2560×1440, 3840×2160) | El panel reduce; de más a menos no se pierde |
| Formato de entrega | **PNG** o **JPEG al 90 % o más** | Son los que acepta la subida, junto con WebP |
| Compresión | **La mínima posible en origen** | El sitio comprime después; comprimir dos veces se nota |
| Peso de entrega | Sin límite razonable | Lo que acaba en el sitio pesa entre 9 y 60 KB |

**No lleva texto, ni logotipos, ni marcas de agua.** Ya pasó con las imágenes de
las áreas de práctica: traían el título impreso, el recorte lo parte por la
mitad y hubo que descartarlas.

**En color natural.** El tratamiento a la paleta de marca —duotono navy— se
aplica aquí; una imagen que ya venga azulada se tiñe dos veces y queda sucia.

## El encuadre

El fondo se pinta con `object-fit: cover`: se amplía hasta tapar la franja y se
recorta **centrado**. Cuanto más estrecha la pantalla, más se recorta de los
lados; cuanto más ancha, más de arriba y abajo. Medido:

| Ancho de pantalla | Qué parte del lienzo se ve |
|---|---|
| 1920 px | todo el ancho · alto 153–927 |
| 1440 px | todo el ancho · alto 24–1056 |
| 1024 px | ancho 318–1602 (67 %) · todo el alto |
| 768 px | ancho 490–1430 (49 %) · todo el alto |
| 390 px | ancho 620–1300 (**35 %**) · todo el alto |

De ahí salen tres zonas:

- **x 944–1300, y 153–927 — aquí va lo importante.** Es lo único que se ve en
  todas las pantallas *y* que no queda debajo del texto. Las caras, las manos,
  el documento: todo eso, aquí.
- **x 620–944 — detrás del texto.** Se ve, pero con el titular encima. Sirve
  para ambiente; no para nada que haya que distinguir.
- **x 0–620 y x 1300–1920 — se pierde en móvil.** Decorado y poco más.

**En móvil el texto ocupa todo el ancho**, así que ahí el fondo es textura y
nada más. Por eso conviene que la imagen funcione como escena y no dependa de
un solo punto de interés diminuto.

## Probar encuadres sin tocar el sitio

```bash
node herramientas/previsualizar-fondo.mjs docs/imagenes-origen/mi-foto.jpg 2200 2400 2731
```

Deja `docs/vista-previa-fondo.png`: cada encuadre montado en la cabecera de
verdad, en escritorio y en móvil, uno debajo de otro. Al terminar devuelve la
imagen que hubiera, pase lo que pase.

Hace falta el sitio en marcha (`npm run dev` en `frontend/`) y Chrome con
`--remote-debugging-port=9222`, igual que `visual.mjs`.

**No pasa por el panel a propósito:** el limitador de acceso corta a los ocho
intentos por cuarto de hora, y probando encuadres uno detrás de otro se agota
enseguida.

**Se monta de verdad en lugar de simularlo** porque lo que decide si un
encuadre sirve es dónde cae el texto y cuánto recorta el navegador, y eso
depende del alto de la franja, del ancho de la columna y del velo. Una
aproximación dibujada daría una respuesta bonita y falsa.

## Cuánto se puede «alejar» una imagen

**Poco, y conviene saberlo antes de encargarla.** A 1440 y a 1920 px el
navegador enseña el **100 % del ancho** del lienzo. O sea: el único margen para
alejar es usar más del archivo original, y eso se acaba en el 100 %.

Si la foto viene con las figuras llenando el encuadre, en la página se verán
igual de grandes por mucho que se recorte menos. Eso **no se arregla desde
aquí**: se arregla pidiendo la foto más abierta.

Al encargarla conviene decirlo con esas palabras: *plano general*, las figuras
ocupando aproximadamente **el tercio central de la altura**, con el entorno
—el ingenio, el cañaduzal— ocupando el resto.

## Cómo se monta

1. Subirla desde `/panel/bloques` → la lámina correspondiente → «Imagen de
   fondo» → «Sustituir la foto». El navegador la ajusta y la convierte a WebP
   antes de enviarla.
2. Si el texto no se lee encima, subir el **velo** de esa lámina.
3. «Publicar cambios».

Para una imagen que venga muy clara o fuera de paleta, el tratamiento en origen
—recorte, gris y rampa navy— está descrito en `AGENTS.md`, «Cada lámina puede
llevar su imagen de fondo».

## Si estos números dejan de valer

Dependen del alto de la cabecera y del ancho de la columna de texto. Si se
cambia cualquiera de los dos, **hay que volver a medir**, no ajustarlos a ojo.
La medición se hace abriendo la portada a cada ancho y leyendo la caja de
`.cabecera-fondo` y la de `.cabecera-lamina .max-w-xl`.
