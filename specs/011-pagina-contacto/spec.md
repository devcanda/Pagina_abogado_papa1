# Especificación — Página de Contacto (`/contacto/`)

Petición del dueño del bufete, 17-11-2026.

## 1. Contexto y Objetivo

El enlace «Contacto» del menú principal (`Navbar.astro`), pie de página y botones de acción apunta a `/contacto/`, que actualmente devuelve 404.
El cliente solicita crear la página `/contacto/` rescatando el contenido humano y los datos de su sitio anterior (`https://candamilabogados.com/contacto/`, respaldado en `docs/contenido-wordpress/contacto.md` y `contacto.html`), renovando su presentación visual ("lavado de cara") bajo el sistema de diseño actual de Candamil Abogados.

## 2. Contenido a Integrar

Del respaldo oficial de WordPress y la fuente única `frontend/src/data/contacto.js`:
1. **Mensaje principal de cercanía del abogado:**
   - *"Entiendo que contactar a un abogado puede parecer intimidante, especialmente cuando se trata de asuntos delicados o situaciones estresantes. Por eso, me esfuerzo en crear un ambiente de confianza y apertura. Escucharé atentamente sus preocupaciones, responderé a sus preguntas con claridad y trabajaré a su lado para encontrar el camino más adecuado hacia una resolución. Su caso no es solo un expediente para mí; es una oportunidad para hacer una diferencia real en su vida."*
2. **Canales de contacto directo:**
   - WhatsApp (`enlaceWhatsApp()`).
   - Correo electrónico (`contacto@candamilabogados.com`).
   - Teléfono celular (`+57 3165325335`) y fijo (`602 2261303`).
3. **Sede y Horarios:**
   - Dirección: `Cra. 31 #24-54, Céspedes, Tuluá` (`Tuluá, Valle del Cauca`).
   - Horario: `8:00 a. m. – 6:00 p. m.`, abierto de lunes a viernes.
   - Ficha en Google Maps (`mapa`) y mapa embebido (`iframe` oficial de `Candamil y Asociados Abogados`).

## 3. Reglas de Diseño y Arquitectura

- **Cero JavaScript de cliente (0 KB JS).**
- **Fuente única de NAP:** Todos los datos compartidos (teléfono, WhatsApp, correo, dirección, enlace a ficha de Maps) provienen de `frontend/src/data/contacto.js` para evitar inconsistencias de SEO local.
- **Paleta y Tipografía:** Navy (`marino-900`), Azul (`marino-600`), Humo (`humo`), Playfair Display (`font-display`) en titulares, y Rojo (`rojo-500`) reservado únicamente para la acción principal (Chatear por WhatsApp / Llamar).
- **Aislamiento:** No modificar archivos de la portada (`index`).

## 4. Criterios de Aceptación

1. `/contacto/` compila en SSG (`dist/contacto/index.html`) y resuelve el 404 del menú principal.
2. Incluye todo el contenido rescatado de la página anterior con estética moderna, limpia y accesible (WCAG AA).
3. El mapa de Google Maps carga con `loading="lazy"` y título accesible.
4. Mantiene 0 KB de JavaScript propio en el cliente.

---

## Relevo de agente (17-11-2026)

Esta página la empezó **otro agente** y la terminó Claude, por decisión del
cliente: los dos estábamos apuntando a la misma tarea en el mismo árbol de
trabajo, y eso acaba con uno de los dos perdiendo su trabajo sin aviso. Antes
de tocar el archivo se comprobó que llevaba once minutos sin escrituras.

Lo que estaba hecho era fiel al original y se conserva: las tres secciones
(«Nuestra oficina / Consulta ya», «Contáctanos / Protegemos sus derechos»,
«Contáctanos ahora / protegemos su patrimonio»), el párrafo de cercanía del
abogado íntegro, los datos de contacto, el horario y la llamada directa.

### Lo que se corrigió al tomarla

1. **El NAP estaba escrito a mano en TRES sitios**: la dirección en la primera
   columna, otra vez en la tercera, y dirección más los dos teléfonos en la
   descripción de la página. Es exactamente el agujero que este proyecto ya
   cerró una vez. Todo sale ahora de `frontend/src/data/contacto.js`, incluida
   la descripción, que se **compone**. El horario también.
2. **El `<h1>` iba entero dentro de `destacado-claro`.** La regla del proyecto
   es que el destacado marca UNA palabra clave; subrayado de punta a punta no
   destaca nada. Con un titular de una sola palabra no hay nada que destacar,
   así que va limpio.
3. **Un teléfono de reserva escrito a mano** (`|| '+57 3165325335'`) que era un
   segundo NAP esperando a divergir.
4. **El texto alternativo de la foto prometía lo que no enseña.** Decía «sede
   de Candamil Abogados» y la imagen es una vista de Tuluá, no del despacho.

### Dos decisiones que NO puede tomar un agente

**El correo no coincide con el de la página real.** La web publicada dice
`info@candamilabogados.com`; la fuente única del proyecto dice
`contacto@candamilabogados.com`, y es la que se está publicando. Si el buzón
que existe es `info@`, **todo correo enviado desde esta página se pierde**. Hay
que confirmarlo con el cliente antes de publicar y, si gana `info@`, se cambia
en `contacto.js` —un solo sitio— y no aquí.

**El mapa embebido NO está en la página original.** Lo añadió el otro agente.
Se conserva porque a un bufete local le sirve, pero conviene saber lo que
cuesta: es un marco de Google que carga sus propios scripts y cookies en el
navegador del visitante. El sitio paga eso solo donde lo decide a conciencia
—hoy, el bloque de redes sociales— y además está pendiente que la política de
privacidad nombre a los terceros que rastrean. Quitarlo es borrar una sección;
dejarlo obliga a nombrar a Google en esa política.

### Lo que falta y no se puede inventar

La página publicada tiene un párrafo más, después de los datos de contacto,
que empieza **«Nuestra mejor carta de recomendación es la satisfacción
expresada de nuestros clientes…»** y menciona el reconocimiento de la firma en
el centro del Valle del Cauca y su trabajo como **auxiliar de la justicia y
conciliador de las cámaras de comercio de Tuluá y Cali**.

Ese texto **no está en el respaldo** de `docs/contenido-wordpress/` —el
exportador no lo capturó— y no se puede transcribir entero desde la web. Es
contenido que distingue al bufete, así que no se reescribe de memoria: hay que
pedírselo al cliente y pegarlo tal cual.


## Calca de la página publicada (17-11-2026)

El cliente pidió que `/contacto/` fuera **una calca** de
`https://candamilabogados.com/contacto/`, y resolvió los tres puntos que
quedaban abiertos:

1. **El correo se queda en `contacto@candamilabogados.com`.** La web antigua
   publica `info@`; la decisión es suya y queda cerrada.
2. **El mapa se conserva, a sangre.** No está en la página de referencia —lo
   añadió este proyecto—, pero el cliente lo quiso al **100 % del ancho**.
   Medido: `x = 0` y el ancho entero de la ventana a 1920, 1280 y 390 px, sin
   barra horizontal. Sigue pendiente **nombrar a Google en la política de
   privacidad**: es un marco de terceros con sus scripts y sus cookies.
3. **El párrafo que faltaba ya está.** Se obtuvo del HTML publicado con
   `curl`, no del respaldo de `docs/contenido-wordpress/`, que no lo contiene.
   Va **palabra por palabra**, detrás de las tres columnas y a lo ancho, como
   en el original. Lo único que se tocó fueron las tildes y las mayúsculas de
   los nombres propios —«mas», «ademas», «valle del cauca», «Tulua»—: en la
   web de un bufete se leen como descuido.

Lo que la calca obligó a deshacer, y es la regla para lo que venga:

- **Se retiró una frase de cierre inventada** en la columna de WhatsApp
  («Atención directa y confidencial para personas y empresas…»). Sonaba bien y
  no estaba en el original. En una calca, lo que no está en la referencia no
  entra salvo decisión expresa del cliente —como el mapa—.
- **El titular vuelve al tuteo**: «Contáctanos», que es el que usa la página
  publicada, no «Contáctenos».
- **El original NO tiene `<h1>`** —empieza directamente en las tres columnas,
  con `<h2>` por sección—. El nuestro lo conserva: una página sin `h1` es un
  defecto de accesibilidad y de posicionamiento, y copiarlo sería copiar un
  fallo. Es la única desviación deliberada de la calca.

### La franja del titular se retiró (17-11-2026)

Petición del cliente. La página empieza ahora directamente en el mapa, lo que
de paso la acerca al original, que tampoco lleva titular.

**Lo que se fue es el BLOQUE, no el encabezado.** El `h1` sigue ahí, en
`sr-only`, con el texto «Contacto», y es además el que nombra la sección de
las tres columnas vía `aria-labelledby` —antes era un `h2` oculto que hacía
ese mismo papel—. Una página sin `h1` deja a quien usa lector de pantalla sin
saber dónde ha entrado y al buscador sin el rótulo con el que clasificarla.
**No borrarlo creyendo que es un resto de la franja.**

Comprobado tras el cambio: un solo `h1`, el mapa sigue a sangre (`x = 0`, ancho
completo) y sin barra horizontal a 1920, 1280 y 390 px.


### El diseño también se calcó (17-11-2026)

El cliente señaló que el contenido estaba copiado pero el diseño no. Tenía
razón: las tres columnas iban en **tarjetas** —marco, sombra, esquinas
redondeadas, una de ellas navy— y el original las pinta **planas sobre el
fondo gris**, separadas solo por el aire.

Lo que da el carácter, y las cuatro cosas vienen de la referencia:

- **Rótulo en versales y negrita**, en tinta y en sans; no en Playfair.
- **Subtítulo debajo, en Playfair CURSIVA y en azul.** Es el único sitio del
  sitio donde la cursiva de Playfair vuelve a ser un recurso de composición.
  Aquí no reabre el problema del 13-11 —media frase de un titular en otra
  letra—: es una línea entera, de otro tamaño y de otro color, debajo de un
  rótulo en sans y en versales. Se lee como un subtítulo, no como un énfasis
  fallido.
- **Los dos botones ocupan el ancho de la columna** y van apilados. La
  utilidad nueva es `boton-contacto`, no `btn`: aquel es una pastilla que se
  ajusta a su texto y va centrada.
- **Etiqueta en tinta, valor en azul y enlazado** en la lista de datos.

Dos desviaciones, las dos medidas:

- **El botón de correo va en `marino-600`, no en el azul del original.** Aquel
  es `#2582f5`, que con texto blanco da **3,4:1** y no llega al 4,5:1 del AA
  que se ha fijado el proyecto. Mismo papel, mismo sitio, mismo aspecto.
- **El de WhatsApp conserva su aro `#128C7E`.** El original no lo lleva; sin
  él, `#25D366` sobre el fondo humo da 1,76:1 de contraste de borde y el botón
  se queda sin contorno (WCAG 1.4.11 pide 3:1).

Y tres arreglos de datos que salieron de mirar la captura:

- **La dirección se repetía**: «… Tuluá · Tuluá, Valle del Cauca», porque
  `direccion` ya termina en la ciudad y se le pegaba `ciudad` detrás. Se
  añadieron `departamento` y `pais` a `contacto.js` para componerla sin
  repetir.
- **El teléfono salía pegado** (`+573165325335`), que es como viaja en el
  `.env`. `telefonoLegible` le separa el indicativo; el `tel:` sigue usando
  `telefonoMarcable`.
- **El horario largo partía la fila en dos.** `horario.horasCompactas`
  (`8:00-18:00`) es la notación del original y es lo que deja el horario y el
  teléfono uno al lado del otro, como en la referencia. **No es otro dato: es
  otra forma de escribir el mismo**, así que si cambia el horario cambian las
  dos líneas.

Comprobado a 1920, 1280 y 390 px: sin barra horizontal, el mapa sigue a sangre
y la fila de horario y teléfono se mantiene en dos columnas también en el
teléfono.


### Los dos botones llevan JERARQUÍA, no el mismo peso (17-11-2026)

Petición del cliente: que el bloque fuera más agradable. El diagnóstico, antes
del cambio: eran **dos rellenos macizos del mismo tamaño y del mismo peso**,
verde y azul, uno encima de otro. Nada decía cuál pulsar primero, y dos colores
saturados seguidos en una página gris y navy se leen como un anuncio pegado
encima en vez de como parte del sitio.

- **WhatsApp se queda lleno**: es la acción principal del bloque.
- **Correo pasa a PERFILADO**: fondo blanco, filete y letra en el azul de
  marca. Acompaña en vez de competir, y el verde vuelve a ser lo único
  saturado de la pantalla.

Detalles que no son de gusto:

- **El filete va en `box-shadow`, no en `border`.** Un borde real suma 3px al
  alto y los dos botones dejarían de medir lo mismo.
- **La sombra del verde va en el MISMO `box-shadow` que su aro.** La propiedad
  es una sola: declararla dos veces pisa la primera y el botón se queda sin
  contorno, que es justo lo que el aro `#128C7E` existe para evitar.
- **La elevación es corta y tiznada de navy**, no gris. Una sombra neutra
  sobre el fondo humo ensucia el borde en lugar de levantarlo.
- Medido: texto azul sobre blanco **5,61:1** (WCAG 1.4.3 pide 4,5:1) y filete
  **3,97:1** (WCAG 1.4.11 pide 3:1).

Las otras dos salidas que se pusieron sobre la mesa y el cliente no eligió:
botones de dos líneas —con «Respuesta inmediata» y el correo visible debajo—,
y una lista de canales con icono en círculo y flecha. Quedan anotadas por si
algún día el hueco vacío de esa columna molesta.


### Y el párrafo de reputación se retiró (17-11-2026)

El mismo día que se puso. Petición del cliente, sin más motivo que ese, y
queda escrito porque sin la nota parece un descuido: se buscó, se consiguió
del HTML publicado, se colocó y se quitó.

Era el que empieza «Nuestra mejor carta de recomendación es la satisfacción
expresada de nuestros clientes…», con lo de **auxiliar de la justicia y
conciliador de las cámaras de comercio de Tuluá y Cali**. Es lo único de la
página que decía a qué llega el bufete más allá de Tuluá; ahora no lo dice
nada. Si alguna vez se quiere de vuelta, el texto está en el historial de
`frontend/src/pages/contacto/index.astro` y en la web publicada.

Con esto `/contacto/` ya no es una calca completa del original: le falta ese
párrafo a propósito.


### El horario y el teléfono se mudaron a la segunda columna (17-11-2026)

Petición del cliente: van **debajo del botón «Enviar un Correo»**, no al final
de la tercera columna como en el original.

Gana dos cosas. Llena el hueco que dejaba esa columna —dos botones y nada más
debajo, con media columna vacía—, y deja las cuatro formas de contactar
juntas: WhatsApp, correo, horario y teléfono. **No se pierde nada**: la tercera
columna sigue dando el teléfono, el fijo y el correo en su lista de datos.

Es la segunda desviación deliberada de la calca, después del `h1` invisible.


### Los tres subtítulos salen de la cursiva (17-11-2026)

«Consulta ya», «Protegemos sus derechos» y «protegemos su patrimonio» iban en
Playfair cursiva y azul, calcando el original. Pasan a la **misma sans del
texto corrido, en peso medio y en el azul de marca**, en tamaño ligeramente
menor que el rótulo.

El motivo es el mismo que llevó a quitar la cursiva de los titulares el 13-11,
y es la segunda vez que este proyecto tropieza con ello: **en Playfair la
cursiva no es la redonda inclinada, es un diseño aparte**. Debajo de un rótulo
en versales y en sans, esa segunda familia se lee como adorno, no como
subtítulo.

El par estándar para un rótulo con línea de apoyo es: rótulo fuerte arriba,
apoyo tranquilo debajo, y **lo que los separa es el color y el peso, no una
segunda tipografía**. Mezclar dos familias en dos líneas seguidas es justo lo
que un rótulo de dos pisos no necesita.

Las otras dos salidas que se pusieron sobre la mesa y el cliente no eligió:
intercambiar los papeles —rótulo en Playfair redonda y subtítulo en la etiqueta
en versales espaciadas que usa el resto del sitio—, y dejar la serif pero en
redonda.

**La cursiva de Playfair sigue haciendo falta en el proyecto**: `FranjaTexto` y
`FranjaCompromiso` la usan en la portada. `/contacto/` era el único sitio que
la pedía fuera de ahí, pero su woff2 no se puede quitar.


### El texto se veía apagado, y no era el contraste (17-11-2026)

El cliente señaló que el párrafo del abogado se perdía contra el fondo.
Medido antes de tocar nada:

| | Sobre el fondo humo | Mínimo |
|---|---|---|
| `tinta-suave` `#5b5557` | **6,83:1** | 4,5:1 ✓ |
| `tinta` `#373435` | 11,54:1 | 4,5:1 ✓ |

**Pasaba de sobra, y aun así tenía razón.** El contraste dice si un texto se
PUEDE leer, no si se lee cómodo. Lo que fallaba eran otras dos cosas:

1. **15 px**, heredado de calcar el original. Por debajo de los 16 px que se
   consideran mínimo para texto corrido, un gris medio se «lava» aunque el
   número salga bien.
2. **El texto principal de la columna iba en el tono secundario.** El gris
   suave es para lo accesorio.

Se subió el cuerpo a **16 px** en los tres sitios de la sección y el párrafo
del abogado pasó a **tinta**. Siguen en gris suave la dirección de la primera
columna y los pies del horario y el teléfono, que sí son accesorios.

**La regla que queda:** cuando algo «se ve apagado» y el contraste pasa, mirar
el TAMAÑO y la jerarquía antes que el color. Aclarar o bajar un color que ya
cumple no arregla nada y rompe lo que estaba bien.

**Y el 17-11-2026 el cliente lo extendio al resto de la seccion**: la
direccion de la primera columna y los pies del horario y del telefono tambien
pasan a tinta, y los pies de 13 a 14 px. **En esta seccion ya no queda gris
secundario**, asi que lo que separa un dato de su apoyo es el TAMANO, no el
tono. Es decision suya, tomada despues de ver el escalon de jerarquia que se
pierde.

Al subir los pies a 14 px, «Llama para tu consulta» dejo de caber a la
derecha del icono y se partia en dos lineas. El pie salio de la columna del
dato y pasa a ocupar la celda entera, debajo del icono: cabe de un tiron y los
dos pies quedan alineados con el borde izquierdo de su columna.
