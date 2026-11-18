# Configuración Global del Agente (AGENTS.md)

## Reglas Innegociables
1. **Memoria Viva:** Al iniciar cualquier sesión, lee `MEMORY.md` para entender el contexto. Al finalizar cualquier tarea, actualiza `MEMORY.md`.
2. **Flujo SDD:** Nunca escribas código para una nueva funcionalidad sin antes pasar por las fases de Especificación (`spec.md`), Planificación (`plan.md`) y Tareas (`tasks.md`) dentro de la carpeta `specs/`.
3. **Constitución:** Respeta siempre los principios arquitectónicos definidos en `docs/constitution.md`.

## Tecnologías del Proyecto

Sitio web y sistema de captación de leads de **candamilabogados.com**.

### Frontend — `frontend/`
- **Astro 5** con `output: 'static'` (SSG). El contenido se consulta a la API
  durante `astro build`; el navegador recibe HTML plano.
- **Tailwind CSS 4** mediante el plugin de Vite `@tailwindcss/vite`.
  Las clases propias reutilizables se declaran con `@utility`, no con `@apply`
  dentro de `@layer` (Tailwind 4 lo rechaza).
- **Cero JavaScript de cliente** por defecto. Los componentes interactivos
  (menú móvil, acordeones) usan `<details>/<summary>` nativos.

### Backend — `backend/`
- **Node.js 20+** y **Express 4**, ESM (`"type": "module"`).
- **PostgreSQL** mediante `pg` con un pool único por proceso.
- **OpenAI SDK** para el Bot de Triage Legal, con salida estructurada
  (`response_format: json_schema`).
- **Zod** para validar todo cuerpo de petición antes de tocar la base de datos.

### Despliegue
- cPanel 110. Frontend estático en `public_html/`; API Node fuera de
  `public_html/` bajo Phusion Passenger. Ver `deploy/README.md`.

## Identidad Visual (no improvisar)

Los tres colores de marca se midieron sobre el logotipo original:

| Color | Valor | Papel | Uso permitido |
|---|---|---|---|
| Azul | `#195BA9` (`marino-600`) | Estructura y confianza | Cabeceras, pie, iconos, titulares, rótulos, marcos |
| Rojo | `#A0373A` (`rojo-500`) | **Acción** | Botones de conversión, Sticky CTA, subrayado de nav activa, filete de marca |
| Gris | `#373435` (`tinta`) | Texto corrido | Cuerpo y titulares sobre fondo claro |

El rojo y el gris salen de `marca/logo-horizontal-original.png`. El azul **no**:
es `#195BA9`, elegido por el cliente, más vivo que el del logotipo (`#3D4D7E`).
Está en **ensayo**; para revertir, los valores anteriores están anotados en la
cabecera de `global.css`.

Escala: 50 `#F0F5FB` · 100 `#DCE8F5` · 200 `#B6CDE8` · 300 `#85A9D4` ·
500 `#2E6DB8` · 600 `#195BA9` · 700 `#134782` · 800 `#0E345E` · 900 `#0A2443`.

**Regla innegociable:** el rojo no se usa de adorno. Cada vez que decora algo,
el botón de conversión deja de ser el elemento más saliente de la pantalla.
Si una sección necesita acento y no es una acción, va en azul.

**El rojo de marca no contrasta sobre navy** (`#A0373A` sobre `#0A2443` = 2.01:1,
por debajo del mínimo). Sobre fondo oscuro:
- texto o rótulo → `rojo-300` (`#D98A8C`, 5.16:1) o la utilidad `etiqueta-seccion-clara`;
- botón → `btn-primario-oscuro`, que añade un filete claro para cumplir el
  3:1 de contraste de borde que exige WCAG 1.4.11.

El anillo de foco va en **azul**, nunca en rojo: sobre un botón rojo sería invisible.

Los estados de error nunca se señalan solo con color (WCAG 1.4.1): siempre
icono + texto, porque el rojo ya significa "acción" en este sistema.

### El logotipo NO SE MODIFICA

El logotipo es obra y propiedad del cliente. **Prohibido redibujarlo, vectorizarlo
a mano, recortarlo, recolorearlo, separar sus elementos, cambiar sus proporciones
o generar iconos "inspirados" en él.** Si hace falta una variante (versión
horizontal, marca compacta, favicon cuadrado), se le pide al cliente; no se
inventa. Este punto ya se incumplió una vez: se recreó el escudo en SVG y se
generaron favicons a partir de esa recreación. Se eliminó todo.

Lo único permitido sobre el archivo es **cambiar la resolución** para entrega web,
con promediado por área y alfa premultiplicado.

Activos (todos salen del archivo original; solo cambia la resolución, y el
recorte del escudo cuenta con **autorización expresa del cliente**):
- `public/img/logo-candamil.png` — original, 1903×1367, intacto. Usado en `og:image`.
- `public/img/logo-candamil-480.png` y `-240.png` — copias escaladas para pantalla.
- `public/favicon-32.png`, `public/apple-touch-icon.png`, `public/img/icono-512.png`
  — el escudo recortado (región x 616-1286, y 75-822 del original), centrado en
  lienzo cuadrado. El de 180px va compuesto sobre blanco porque iOS no admite
  transparencia en el icono de pantalla de inicio.

### Archivos de marca

El master vive en `frontend/marca/`, **fuera de `public/`**, para no servir
600KB que ningún visitante descarga:

| Archivo | Uso |
|---|---|
| `marca/logo-horizontal-original.png` (3081×864) | **Master en pantalla.** Laureles y texto en blanco. |
| `marca/logo-horizontal-con-laureles.png` | Misma pieza con los laureles en azul. **De aquí salen los iconos.** |
| `marca/logo-vertical-original.png` | Versión vertical antigua. Colores distintos; no usar. |
| `public/img/logo-horizontal-{240,480,720}.png` | Lo que ve el visitante (`srcset`). |
| `marca/favicon-original.png` (1098×864) | **Fuente de los iconos.** Imagen que el cliente entregó solo para eso. |
| `public/favicon-{16,32,48}.png`, `apple-touch-icon.png`, `img/icono-512.png` | Derivados de la anterior: centrada en lienzo cuadrado y reducida. |
| `public/img/og-imagen.png` (1200×630) | Tarjeta social: el logotipo centrado sobre navy. |

**Cada archivo tiene su sitio y no se mezclan:**
- El de pantalla (laureles blancos) es solo para cabecera, pie y franja de landings.
- `favicon-original.png` es solo para los iconos. **No se recorta ni se
  recolorea**: se centra en un lienzo cuadrado, porque un favicon rectangular lo
  deforma el navegador, y se reduce a cada tamaño.
- Su fondo blanco se elimina con un **relleno por inundación desde los bordes**,
  no con un filtro de color: así desaparece el blanco exterior y se conservan los
  blancos de dentro del escudo (balanza y filete), que están rodeados de color.
- El lienzo se ciñe al **escudo**, no al crest completo. Autorizado por el
  cliente: con los laureles incluidos, a 16px el escudo queda en ~9px y no se
  distingue. Recortado llena el icono y se lee. La variante con laureles se
  genera con `favicon_v2.py` pasando `completo` en vez de `escudo`.
- Se declaran 16, 32 y 48 por separado: dejar que el navegador reescale uno solo
  emborrona los laureles a 16px.

El logotipo lleva el **texto en blanco**, así que solo funciona sobre fondo
oscuro (sobre blanco da 1.00:1). Por eso cabecera, pie y franja de landings van
en navy, y la imagen social se compone sobre navy en lugar de dejarla transparente.

Las superficies oscuras llevan `data-superficie="oscura"`, que cambia el anillo
de foco a blanco: el azul de marca no se distingue sobre navy.

`og:image` nunca puede ser un SVG: ninguna red social los renderiza.

## Contacto y llamadas a la acción

**Fuente única: `frontend/src/data/contacto.js`.** Ningún componente vuelve a
declarar estos datos por su cuenta.

| Dato | Valor | De dónde sale |
|---|---|---|
| Teléfono | `+573165325335` | `frontend/.env`, `PUBLIC_TELEFONO` |
| WhatsApp | `573165325335` | `frontend/.env`, `PUBLIC_WHATSAPP` |
| Correo | `contacto@candamilabogados.com` | `contacto.js` |
| Dirección | Cra. 31 #24-54, Céspedes, **Tuluá** | `contacto.js` |
| Ciudad | Tuluá, Valle del Cauca | `contacto.js` |

Están centralizados porque Google penaliza el **NAP incoherente** (nombre,
dirección, teléfono): si la cabecera dice una dirección y el pie otra, el
negocio pierde posición en las búsquedas locales. Repetirlos en un componente
es reabrir ese agujero.

El teléfono se limpia de espacios y paréntesis antes del `tel:`: algunos
marcadores fallan con ellos.

La dirección enlaza a la **ficha del negocio** en Google Maps, no a una
búsqueda por dirección: así abre el perfil con reseñas y «cómo llegar». A la
URL copiada del navegador hay que quitarle `entry` y `g_ep`, que son de sesión.

**La oficina está en Tuluá.** El contenido inicial decía «Medellín»; se corrigió
en la base con `005-ciudad-tulua.sql` y en el texto de reserva del hero. En un
bufete la ciudad equivocada no es una errata: la gente busca abogado por
cercanía.

### Un solo acceso a WhatsApp por pantalla

- **Móvil:** el Sticky CTA inferior ya lo lleva como acción principal.
- **Escritorio de las corporativas:** burbuja flotante (`BotonWhatsApp.astro`),
  visible solo desde `md`.
- **Landings:** el Sticky CTA se ve siempre, así que la burbuja **no se monta**.

Superponer la burbuja a la barra duplicaría la misma acción a dos centímetros
de distancia y taparía contenido.

### El verde de la burbuja

**Relleno `#25D366` —el verde oficial— con aro `#128C7E`.** Decisión del
cliente, tomada sabiendo el coste. Es la única excepción a la paleta.

| Medida | Valor | Mínimo WCAG 1.4.11 |
|---|---|---|
| Glifo blanco sobre `#25D366` | 1.98:1 | 3:1 ✗ |
| Borde `#25D366` sobre blanco | 1.76:1 | 3:1 ✗ |
| Aro `#128C7E` sobre blanco | 4.14:1 | 3:1 ✓ |
| Aro `#128C7E` sobre humo | 3.86:1 | 3:1 ✓ |
| Aro `#128C7E` sobre navy | 3.77:1 | 3:1 ✓ |

El glifo se queda corto y se asume: la silueta de WhatsApp se reconoce sin
leerla, y el significado del botón lo lleva el `aria-label`, no el dibujo.

**El aro no es adorno y no se quita.** Sin él, `#25D366` se difumina contra el
blanco y contra el fondo humo, y el botón deja de tener contorno. `#128C7E` es
el único verde oficial que supera 3:1 sobre los tres fondos del sitio: un aro
más oscuro (`#075E54` da 7.67:1 sobre blanco) se hunde sobre navy, donde cae
a 2.03:1.

**El glifo es la marca oficial de WhatsApp**, no un dibujo parecido. Lo que
hace que alguien pulse ese botón es reconocerlo de un vistazo, y una
aproximación pierde justo eso. Está en `BotonWhatsApp.astro` y en
`StickyCTA.astro`, y los dos llevan el mismo trazado.

## Sistema Tipográfico

| Uso | Familia | Token |
|---|---|---|
| Titulares | **Lora** (serif variable) | `font-display` |
| Texto corrido, interfaz | Pila del sistema | `font-sans` |

La serif se autoaloja en `public/fonts/` (dos woff2, subconjunto latino, eje de
peso 400–700, licencia SIL OFL). Va con `font-display: swap` y precarga en
`BaseHead`. **No añadir más pesos ni familias sin medir el coste.**

### Lora sustituyó a Playfair Display el 17-11-2026

Petición del cliente —«una fuente más agradable»— y el diagnóstico importa más
que el cambio.

**Playfair es una DIDONA**: trazos gruesos con remates de hilo. A 72 px, en el
carrusel, es espectacular; a 24–32 px —donde está la mayoría de los titulares
del sitio— esos hilos se afinan hasta casi desaparecer y el titular pierde
cuerpo y se enfría. **No era un problema de gusto: era la letra trabajando
fuera del tamaño para el que está dibujada.**

Lora tiene el trazo mucho más parejo y está dibujada para pantalla, así que
aguanta de 16 a 72 px sin adelgazar. Conserva la autoridad de una serif clásica
y añade calidez.

- **El eje de peso baja de 400–800 a 400–700, y no se pierde nada**:
  `font-bold` es 700 y en el sitio no había ningún titular por encima.
- **Pesa 1,4 KB más en total** (37,8 + 40,8 KB frente a 38,4 + 38,8).
- **Los archivos de Playfair se BORRARON.** Dejarlos serviría para que alguien
  los volviera a enganchar por error y para que el repositorio cargara 77 KB
  que nadie pide.
- **La cursiva sigue sin poder quitarse**: `FranjaTexto` y `FranjaCompromiso`
  pintan en cursiva el área que rota.
- **Georgia sigue siendo el respaldo**, y ahora encaja mejor: sus proporciones
  se parecen más a las de Lora que a las de Playfair, así que el salto al
  terminar la carga apenas se nota.
- **La línea base visual de `docs/linea-base/` queda INVÁLIDA.** Un cambio de
  familia mueve cada titular del sitio, así que las siete capturas van a dar
  diferencias en todas partes. Hay que regenerarla cuando el cliente dé el
  diseño por bueno, y anotarlo en `docs/punto-de-control-visual.md`.

Utilidades de composición:
- `titular` / `titular-claro` — titular de sección (claro = sobre fondo oscuro).
- `destacado` / `destacado-claro` — subrayado en rojo para la palabra clave del
  titular, **en redonda**. Es el recurso que más cambia la percepción y cuesta
  0 bytes.
- `palabra-fondo` — palabra enorme y tenue al fondo de una sección, decorativa.
- `etiqueta-seccion` / `etiqueta-seccion-clara` — rótulo en versales.

Regla: **un solo `destacado` por titular.** Si se subraya media frase deja de
destacar nada.

### La cursiva del `destacado` se retiró el 13-11-2026

Petición del cliente, y el diagnóstico importa más que el cambio: lo que pidió
fue «aplicar a los demás titulares la fuente de los del slider». **La familia ya
era la misma** —Playfair Display 700 en los dos sitios, medido en la página; lo
único que cambiaba era el tamaño, 72 px en el carrusel y 44 px en las
secciones—. Lo que se veía distinto era la **cursiva**.

Y no es una impresión suya: en Playfair la cursiva **no es la redonda
inclinada**, es un diseño aparte —«a» de un solo piso, remates y eje
distintos—. Las láminas del carrusel no llevan `destacado`, así que sus
titulares iban enteros en redonda mientras los de sección mostraban media frase
en otra letra. Leído de corrido, eso no comunica énfasis: comunica
incoherencia.

**El subrayado se queda.** Sigue señalando la palabra clave, sigue costando 0
bytes y es lo que evita que el titular quede plano.

**La cursiva de Playfair sigue en uso y su woff2 no se puede quitar**:
`FranjaTexto` y `FranjaCompromiso` pintan en cursiva el área que rota. Antes de
borrar ese archivo hay que mirar esos dos componentes.

Afecta a los seis titulares con `destacado` de la portada, no solo a los cinco
que nombró el cliente: el de la franja de cierre («¿Evaluamos su caso sin
costo?») usa la misma utilidad y dejarlo en cursiva habría reabierto el mismo
problema en pequeño.

## La cabecera es un carrusel de tres láminas

Derecho laboral · el bufete · perito avaluador. Son tres servicios a tres
públicos; con una sola lámina, quien llegaba buscando un avalúo no veía nada
dirigido a él hasta el sexto bloque. Ver `specs/003-cabecera-slider/`.

**La primera es la de derecho laboral**, por decisión del cliente (03-11-2026):
es la especialidad con la que quiere posicionarse. El orden de las láminas es
CONTENIDO y se cambia desde el panel; ninguna prueba ni ningún código puede dar
por sentado cuál va primera ni qué foto lleva.

**Sin JavaScript.** Tres `<input type="radio">` ocultos y una regla `:has()`.
El proyecto envía 0 KB de JS al visitante y un carrusel no es motivo para
romperlo. De regalo, las flechas del teclado funcionan solas: son nativas de un
grupo de radios.

**Gira solo**, 5 s por lámina (3,6 s quieta + 1,4 s de relevo), 15 s la vuelta.

Lo que lo hace posible sin JavaScript es que **ningún radio nace marcado**.
Mientras no hay ninguno marcado, el CSS sabe que el visitante no ha tomado el
mando y deja correr la animación; en cuanto pulsa un punto o una flecha se
marca uno y el pase se detiene **para siempre**. No se puede reanudar sin JS, y
tampoco conviene: devolverle el mando a la máquina después de que la persona lo
haya tomado es justo lo que molesta de estos carruseles.

En CSS no hay forma de distinguir «marcado por defecto» de «marcado por el
visitante». Por eso el estado inicial tiene que ser ninguno, y por eso hace
falta una regla aparte que enseñe la primera lámina cuando no hay animación:
sin ella, apagado el pase no se vería ninguna.

### No hay botón de pausa, y eso tiene un coste

**Se retiró a petición del cliente el 27-10-2026**, sabiendo lo que sigue. Es
una deuda consciente, no un olvido, y conviene que quien lea esto no «arregle»
el hueco sin entender por qué está.

La **WCAG 2.2.2** pide un mecanismo para parar cualquier cosa que se mueva sola
más de cinco segundos. Un pase de diapositivas lo es. Sin un control rotulado
para pararlo, **este bloque queda por debajo del AA que se ha fijado el
proyecto**, y es el único sitio del sitio donde eso pasa.

Lo que queda cumpliendo esa función sin ser un control rotulado como tal
—los tres comprobados en el navegador, no supuestos—:

| Mecanismo | Qué hace | Límite |
|---|---|---|
| Pulsar un punto o una flecha | Detiene el pase **para siempre** | Nadie puede saberlo antes de pulsarlo |
| `prefers-reduced-motion: reduce` | Apaga el pase del todo | Solo si se ha configurado en el sistema |
| `:focus-within` | Congela mientras el foco esté dentro | No es una parada, es una tregua |

El primero es, en rigor, un mecanismo de parada: el criterio pide «pausar,
parar u ocultar», no un botón con una etiqueta concreta. Lo que falla es el
descubrimiento, que es justo lo que un auditor va a señalar.

**Si hay que volver a cumplirlo**, el botón era una casilla —sin JavaScript
solo un `:checked` recuerda un estado— que desaparecía al tomar el mando el
visitante, con una regla de `animation-play-state: paused`. Está en el
historial de `Cabecera.astro`.

**El congelado por `:focus-within` se queda** y no se toca: no es un control
visible, evita que la lámina cambie bajo los pies de quien está tabulando por
los botones de la cabecera, y es un problema de uso, no de gusto.

**Las animaciones se declaran con propiedades LARGAS, nunca con la forma corta
`animation:`.** La forma corta reinicia todas las subpropiedades, incluida
`animation-play-state: running`, y como esas reglas tienen más especificidad
que la del congelado, lo que intentaba pausar no hacía nada. Ya pasó con el
botón de pausa; sigue importando porque el congelado por `:focus-within`
depende exactamente de lo mismo.

Durante el pase se enseña el par de flechas de la primera lámina: el CSS no
puede saber por cuál va la animación. Pulsar «siguiente» a mitad del pase lleva
a la segunda venga de donde venga, detiene el pase y deja al visitante en una
lámina concreta, que es lo que buscaba.

Reglas que no se tocan:

- **Las láminas inactivas se ocultan con `visibility: hidden`**, no solo con
  `opacity: 0`. Es lo que las saca del orden de tabulación y del árbol de
  accesibilidad: sus botones no se pueden enfocar a ciegas y el lector de
  pantalla anuncia un solo `<h1>`, no tres.
- **Todo el ocultamiento vive dentro de `@supports selector(:has(*))`.** Un
  navegador sin `:has()` no puede cambiar de lámina, así que tampoco debe
  ocultarlas: fuera de ese bloque se pintan las tres en vertical y todos los
  enlaces siguen alcanzables.
- **El `display: none` de los puntos va ANTES del `@supports`.** Las dos reglas
  tienen la misma especificidad y gana la última del archivo. Puesto detrás, los
  puntos no se pintan nunca. Ya pasó una vez.
- **Los puntos son blancos, no rojos.** El rojo significa «acción» y un punto de
  navegación no es una conversión.
- **Solo la primera foto lleva `fetchpriority="high"`.** Las otras dos van en
  `lazy` + `low` o compiten con ella por el LCP.
- **El tope es tres.** La altura de la sección la fija la lámina más larga, así
  que los textos de las tres van parejos o aparece un hueco muerto bajo los
  botones.

### El relevo dura 1,2 s y es secuencial, no cruzado

Las tres láminas ocupan la misma celda de rejilla, así que un fundido cruzado
largo dejaría dos titulares superpuestos más de un segundo. La saliente se va
en 0,5 s; la entrante entra a los 0,45 s y tarda 0,95 s. Solo 0,05 s de solape,
para que no quede un hueco en negro.

Declarado suma 1,4 s, no 1,2, **y es a propósito**: con una curva `ease` la
opacidad llega a su destino antes del tiempo nominal —1,13 s medidos para 1,2 s
declarados—, así que para que el relevo dure 1,2 s de verdad hay que declarar
algo más. Medido: 1,31 s.

- **`visibility` se retrasa 0,5 s en la saliente.** Sin ese retraso la lámina
  desaparecería de golpe en lugar de desvanecerse. El precio es que durante
  esos 0,5 s las dos están expuestas; es el mínimo posible, porque coincide con
  lo que tarda el fundido de salida.
- **El desplazamiento lateral de 1,5rem no es adorno.** Sin él, un cambio de
  más de un segundo parece que la página se ha colgado.
- **`prefers-reduced-motion` se anula DENTRO del `@supports` y repitiendo los
  selectores enteros.** Una `@media` no añade especificidad: escrita más abajo
  con el selector corto pierde contra la regla de `:has()` y la animación
  seguía ocurriendo. Pasó dos veces: con el relevo manual y con el pase
  automático. Con «menos movimiento» el pase no se ralentiza, **se apaga**: es
  justo el caso que esa preferencia existe para cubrir.

### Flechas

Se pintan **seis** —una «anterior» y una «siguiente» por lámina— y el CSS
enseña las dos del estado actual. Un `<label>` apunta a un `id` fijo, así que
no hay forma de que una sola flecha sepa a dónde ir. Dan la vuelta: desde la
tercera, «siguiente» lleva a la primera.

Van `aria-hidden` y el nombre accesible lo pone un `aria-label` sobre cada
radio. **Si no, los textos de las flechas se suman al nombre del radio** —tres
etiquetas apuntando al mismo control se concatenan— y el lector de pantalla
diría «Perito avaluador lámina siguiente lámina anterior». Quien va por teclado
usa el grupo de radios y sus flechas nativas; las flechas visibles son una
ayuda para ratón y dedo.

**Las flechas llevan un disco de navy translúcido debajo** (`rgb(10 36 67 /
0.55)`) y los puntos un aro y una sombra oscuros. No es adorno: antes su
contraste dependía de lo que hubiera detrás, y desde que una lámina puede
llevar foto de fondo detrás puede haber cualquier cosa. Con el fondo del
ingenio, la flecha «siguiente» caía justo sobre el papel blanco del contrato y
desaparecía. El halo lo lleva cada control en vez de oscurecer la franja
entera, que volvería a meter una banda de otro color bajo el hero.

El disco es **navy fijo, no `colorFondo`**: lo que tiene que tapar es la
imagen, no igualar el color de la franja.

**Sobre una foto no hay un número único de contraste que valga**, igual que
pasa con el velo: depende de qué zona caiga debajo. Lo que se comprueba es que
el control traiga su propio fondo, no una cifra medida sobre una imagen
concreta. Los números históricos —50% de blanco daba 3,58:1 sobre la cuña y
3,20:1 al 45%— siguen valiendo para las láminas sin foto.

Los campos sueltos del bloque (`titulo`, `subtitulo`, `imagen`…) **se conservan**
como reserva: si `laminas` viene vacío, el componente los pinta y la cabecera se
comporta como antes. Por eso una cabecera anterior a esta versión no se rompe.

## Recorrido de la portada

Hero → sobre el bufete (con insignia montada sobre la foto) → franja de
compromiso → áreas de práctica (oscuro) → redes sociales → perito avaluador
(oscuro) → nuestros clientes (oscuro) → pie.

Los bloques de **equipo** (`Equipo.astro`) y **testimonio** (`Testimonio.astro`)
se retiraron a petición del cliente. Los componentes y sus datos (`equipo`,
`testimonio` en `src/data/inicio.js`) siguen en el repositorio: volver a
ponerlos es importarlos y colocarlos respetando la alternancia claro/oscuro.

**Apagados desde el panel**, con su contenido intacto en la base (`visible =
FALSE`, ver «Ocultar NO borra»):

| Bloque | Cuándo | Qué se pierde mientras esté apagado |
|---|---|---|
| `cifrasYPreguntas` | migración `012` | Las respuestas a «cuánto cuesta la primera consulta» y «cómo se acuerdan los honorarios»: texto que posiciona y que quita el freno de llamar a un abogado. |
| `tarjetasConFoto` — «Casos resueltos» | 14-11-2026, petición del cliente | La única prueba de resultados de la portada. |
| `franjaCierre` — «¿Evaluamos su caso sin costo?» | migración `019`, 17-11-2026 | **El último botón de la portada.** Ver «Nuestros clientes». |

Volver a encenderlos es un clic en `/panel/bloques`; la ficha apagada sigue a
la vista, atenuada.

**El final de la portada son tres superficies oscuras seguidas**: perito
avaluador, «Nuestros clientes» y pie. Empezó al apagar «Casos resueltos» y
sigue igual con el muro de clientes, que **tiene que ser oscuro** porque los
siete logotipos vienen con la tinta en blanco. Comprobado en la página y **se
sostiene**, porque no son el mismo oscuro —el muro va en `marino-800`, un
escalón más claro que el perito—, pero es el sitio donde la alternancia está
más tensa de toda la portada: **si mañana se inserta algo ahí, va en claro**.

La alternancia claro/oscuro es la que marca el ritmo; al insertar una sección
nueva hay que respetarla o la página se aplana.

### Cascada y capas
El `mt-20` del pie se anula en las páginas que terminan en una franja **con
fondo propio** con una regla `:has()` **fuera de toda `@layer`**, al final de
`global.css`. Tiene que ir sin capa: las utilidades de Tailwind viven en la capa
`utilities`, que gana a `components` por orden de capas aunque tenga menos
especificidad.

**La regla mira `[data-superficie]`, con cualquier valor, no solo `oscura`.**
Nació para la franja de cierre de la portada, que es navy, y por eso pedía
`oscura`; en `/contacto/` la última sección es gris humo y el `mt-20` dejaba
**80 px de blanco** entre el contenido y el pie. Lo que decide no es que la
franja sea oscura, sino que traiga fondo propio: en cuanto lo trae, el hueco se
ve como una costura. Comprobado después del cambio: solo se movió
`/contacto/`; la portada seguía a 0 y `/areas/` y `/quienes-somos/` conservan
sus 80 px, porque no declaran `data-superficie`.

**Por eso marcar una sección con `data-superficie` no es decorativo.** Además
de cambiar el anillo de foco cuando vale `oscura`, pega el pie al contenido.

## Punto de control visual

Hay una **línea base de siete capturas** en `docs/linea-base/` y una herramienta
que las compara píxel a píxel: `herramientas/visual.mjs`.

**Regla: antes y después de cualquier refactorización que toque maquetación,
estilos o componentes, se ejecuta la comparación.** Si da diferencias que no
eran intencionadas, el trabajo no está terminado.

```bash
node herramientas/visual.mjs capturar http://localhost:4340 /tmp/actual
node herramientas/visual.mjs comparar docs/linea-base /tmp/actual
```

Esto importa especialmente en la **fase 2 de la spec 002**, cuyo criterio de
éxito es precisamente que la portada quede idéntica aunque su contenido pase a
salir de la base de datos.

La línea base **solo se regenera cuando el cambio de diseño está aprobado**, y
se anota en `docs/punto-de-control-visual.md` qué cambió y por qué. Regenerarla
para que deje de fallar convierte el control en decoración.

Ese documento recoge además los números del estado congelado: paleta,
contrastes medidos, peso del sitio y los invariantes que no deben romperse.

## Panel de contenido

Vive en `/panel`, servido por el propio Express. Sesión por cookie, no por
token. Las altas de usuario **no tienen formulario**: se hacen por consola.

```bash
cd backend
node --env-file=.env scripts/crear-usuario.js <correo> "<nombre>" [admin|editor]
node --env-file=.env scripts/cambiar-clave.js <correo> [clave]
```

**Una contraseña perdida no se recupera: se reemplaza.** En la base solo hay un
hash scrypt de un solo sentido, así que ni con acceso al servidor se puede leer.
Es lo correcto y no se cambia. `cambiar-clave.js` sin el segundo argumento
genera una fuerte; con él pone la que se le diga.

Cambiar la clave **revoca todas las sesiones** del usuario. Si no, una sesión
robada seguiría viva justo después de cambiarla por ese mismo motivo.

El script **rechaza claves de diccionario cuando `NODE_ENV=production`** y solo
avisa en local. El panel publica cambios en el sitio real; `admin123` aguanta
segundos frente a un ataque por diccionario.

### La pantalla principal son BLOQUES, no una lista de imágenes

`/panel/bloques`. Cada ficha es una franja de la portada, en su orden real, con
su formulario —textos, fotos y colores— y un interruptor para mostrarla u
ocultarla. `/panel/imagenes` redirige ahí; la subida sigue en
`POST /panel/imagenes/:clave`.

- **El agrupado se DEDUCE**, recorriendo el JSON de cada bloque y cruzándolo con
  las claves de `medios`. No hay tabla de asignación que mantener, así que el
  panel enseña siempre la estructura real. Una columna «grupo» se desincroniza:
  el día que una imagen cambie de bloque, el panel la seguiría enseñando donde
  ya no está y el diseñador cambiaría la foto equivocada.
- **El rótulo se guarda** (`bloques.rotulo`), no se deduce del tipo. El tipo de
  la cabecera es `cabecera`, pero quien entra al panel lo llama «el slider».
- **Ocultar NO borra.** `bloques.visible` deja el bloque con su orden y su
  contenido; volver a encenderlo es un clic. La ficha apagada **sigue a la
  vista**, atenuada: si desapareciera, nadie podría volver a encenderla.
- **Apagar un bloque exige rol `admin`.** Sustituir una imagen se ve de un
  vistazo; que falte una franja entera, no.
- Lo que no usa ningún bloque sale en «Sin bloque asignado». Callarlo dejaría
  esa imagen invisible para siempre desde el panel.
- **Las fotos se editan dentro del formulario del bloque**, junto al texto al
  que acompañan; la rejilla de arriba solo enseña lo que queda fuera. Ver «Cada
  foto va junto al texto al que acompaña».

### Publicar recompila el sitio

El frontend es estático: consulta el contenido durante `astro build`. El botón
**«Publicar cambios»** lanza esa compilación desde el panel, para que nadie
tenga que entrar al servidor. Ver `specs/005-publicar-y-recompilar/`.

Se eligió recompilar y **no** pasar a SSR porque el sitio de un bufete se lee
mucho más de lo que se edita: que siga en pie cuando la base de datos no
responde vale más que ahorrar unos segundos al publicar. Además conserva los
0 KB de JavaScript y el HTML cacheable.

- **El candado es una fila de la tabla, no una variable.** Así sobrevive a un
  reinicio y seguiría valiendo con dos procesos detrás de Passenger. El
  `INSERT ... WHERE NOT EXISTS` va en una sola sentencia: comprobar y luego
  insertar deja una rendija por la que dos pulsaciones cuelan dos
  compilaciones. El índice único parcial es la segunda red.
- **Al arrancar se cierran las publicaciones que quedaron a medias.** Sin eso,
  un reinicio durante una compilación dejaría el candado echado para siempre.
- **Se compila aparte y se cambia de sitio al final.** Un fallo a mitad no toca
  `dist/`. Antes de dar el cambiazo se comprueba que existe `index.html`: una
  compilación que termina bien pero no genera portada es un fallo silencioso.
- **El taller va FUERA del proyecto de Astro.** Dentro, el vigilante de Vite
  abre manejadores sobre lo que se escribe y el renombrado final da `EPERM` en
  Windows; con el servidor de desarrollo levantado, publicar no funcionaba
  nunca. Y tiene que estar en el mismo volumen que `dist/`, o `EXDEV`.
- **Los renombrados van con reintentos.** En Windows, renombrar un directorio
  recién escrito da `EPERM`/`EBUSY` hasta que el sistema suelta los
  manejadores. No es un apaño: es cómo se hace en Windows.
- **Nada de `shell: true`** salvo en Windows, donde `npm` es un `.cmd` y no hay
  alternativa. En el servidor (Linux) va desactivado.
- La ruta responde **202 en cuanto coge el candado**, sin esperar a que
  termine: dejar la petición abierta la expone a que un proxy la corte. El
  panel pregunta después por el estado cada dos segundos.
- La promesa de la compilación lleva `.catch` **obligatorio**: una promesa
  rechazada sin capturar tumba el proceso de Node entero.

Las imágenes sí se ven al recargar sin publicar, porque lo que cambia es el
archivo, no el HTML.

### Los formularios se generan desde el registro

`backend/src/admin/formulario.js` lee `campos` y `variantes` de
`frontend/src/bloques/registro.js` —**importado tal cual desde el backend**— y
pinta un control por campo. Añadir un campo a un bloque es tocar el registro: el
formulario aparece solo.

**No hay catálogo duplicado, y no se puede añadir.** Duplicarlo garantiza que un
día el formulario y la página dejen de coincidir, y nadie se entera hasta que un
campo se guarda y no se pinta.

- **Los nombres de los controles llevan la RUTA dentro del dato**
  (`laminas.1.titulo`). Así el navegador reconstruye el objeto anidado sin saber
  nada de la forma de cada bloque, y los grupos funcionan igual que los sueltos.
- **Se guarda pasando SIEMPRE por `sanearDatos`**, el mismo que usa el
  renderizador. Un campo no declarado se descarta; lo que se guarda y lo que se
  pinta no pueden divergir.
- **Lo que el formulario no envía se conserva de lo guardado.** Son los campos
  de **reserva** superados por un grupo. Sin eso, guardar textos los borraría:
  el saneado solo conserva lo que ve. Lo hace `conciliar()` en `rutas.js`, que
  de paso comprueba las claves de imagen contra el catálogo real.
- **`reserva: '<grupo>'`** marca un campo que solo vale si ese grupo está
  vacío: los sueltos de la cabecera frente a `laminas`. El panel no los pinta
  cuando están superados, porque enseñar dos juegos de los mismos campos deja a
  quien edita sin saber cuál manda.
- **`NOMBRES` traduce las claves a castellano con tildes.** Deducir la etiqueta
  del nombre interno da «Titulo» y «Laminas»: jerga de programador en una
  pantalla que usa alguien que escribe en castellano.

### Los colores van POR LÁMINA; el fondo, por franja

En la cabecera, `colorTitulo` y `colorTexto` viven **dentro de cada lámina**.
Estaban solo en el bloque y los tres titulares compartían color a la fuerza: son
tres mensajes a tres públicos y cada uno lleva ya su propia foto. Los sueltos
del bloque quedan como **reserva** (`reserva: 'laminas'`), igual que `titulo` o
`imagen`.

El **color** del fondo es del bloque entero: `colorFondo` (la franja) y
`colorCuna` (el triángulo claro del lado de la foto). Un color plano cambiando
cada cinco segundos es de las cosas que hacen molesto un carrusel.

La **imagen** de fondo, en cambio, sí es de cada lámina: `imagenFondo`. Ver
«Cada lámina puede llevar su imagen de fondo».

**`papel: 'fondo'`** marca un campo de color como fondo. Hace dos cosas: ese
campo **no enseña contraste** —medirlo contra sí mismo da 1.00:1 y no significa
nada— y **los demás colores del bloque miden el suyo contra él, en vivo**. Desde
que el fondo se elige desde el panel, medir contra el navy congelado del
registro daría un número tranquilizador y falso en cuanto alguien pusiera un
fondo claro. `data-fondo` queda de respaldo para los bloques sin campo de fondo.

La migración `009-colores-por-lamina.sql` copió el color del bloque **dentro** de
cada lámina en vez de dejarlo heredado. Si se hubiera dejado implícito, el
componente seguiría usándolo por herencia mientras el panel enseñaría el valor
por defecto: quien editara vería un color distinto del publicado.

### El rojo del rótulo no sobrevive a una foto de fondo

`colorEtiqueta`, por lámina. Nació de una medición, no de un gusto:

| Fondo | Contraste de `rojo-300` |
|---|---|
| Navy plano `#0A2443` | 5,92:1 ✓ |
| Duotono navy sobre foto | 2,31:1 ✗ |

Para que el rojo llegara a 4,5:1 el fondo no podría pasar de una **luminancia
de 0,0385** —casi negro—, y a esa oscuridad la foto no se ve. O foto, o rótulo
rojo; las dos cosas no caben.

Pasarlo a claro en esas láminas **cumple mejor la regla del proyecto**: el rojo
se reserva a la acción, así que el botón vuelve a ser lo único rojo de la
pantalla. Por defecto sigue siendo `#d98a8c`, de modo que las láminas sin foto
no cambiaron.

**El filete toma el mismo color que el rótulo.** Separados, al aclarar el texto
quedaría un guion rojo suelto junto a unas letras claras: peor que cualquiera
de las dos opciones enteras.

### Cada lámina puede llevar su imagen de fondo

`imagenFondo` por lámina, a sangre y por detrás del texto. **No es la misma
pieza que `imagen`:** aquella es la figura recortada que se monta sobre la cuña,
y las dos conviven. Por eso son dos campos y dos huecos distintos (`hero-*` de
900×1100 para la figura, `fondo-lamina-*` de 1920×1080 para el fondo).

**La capa va DENTRO de la lámina, y ahí está el truco.** El carrusel ya aplica
el fundido y el `visibility: hidden` a la lámina entera, así que una capa que
vive dentro los hereda sin una sola regla `:has()` nueva. Montarla al nivel de
la sección habría significado duplicar esa maquinaria, que es la parte más
frágil del componente y la que más veces se ha roto.

El precio es que la capa queda dentro del contenedor centrado, así que se saca
con `left: 50%; width: 100vw; transform: translateX(-50%)`. El sobrante lo
recorta la sección, que lleva `overflow-hidden`; sin eso aparecería barra
horizontal. **Está comprobado a 1280 y a 360 px.**

- **`z-index: 0`, nunca `-1`.** Con `-1` la capa se iría por detrás del fondo de
  la propia sección y no se vería. Las dos columnas de contenido van en `z-10`.
- **La capa se ancla a la LÁMINA, y no hay forma de evitarlo.** Durante un
  tiempo aquí ponía lo contrario —que quitarle `position: relative` a la
  lámina la anclaba al contenedor— y era falso: **la lámina lleva `transform`
  para el relevo, y un `transform` crea bloque contenedor para los
  descendientes absolutos aunque no haya `position`.** La capa terminaba donde
  acaba el texto y los 4rem de la fila de mandos se quedaban sin foto, con el
  color liso de la sección asomando: una franja justo bajo el carrusel, en las
  tres láminas. Lo vio el cliente, no las pruebas.
- **Se arregla ESTIRANDO la capa exactamente el alto de los mandos**
  (`--cabecera-mandos: 4rem`, que usan los dos: la fila lo fija como `height`
  y la capa lo resta en `bottom`). El sobrante lo recorta la sección, que
  lleva `overflow-hidden`.
  - Tiene que ser **exacto, no generoso**: la imagen va con `object-fit:
    cover`, así que alargar la capa cambia el recorte y mueve el encuadre que
    se ajustó mirando. Al hacerlo, la banda visible a 1920 px pasó de
    `y 156-924` a **`y 133-947`**, y hubo que repasar las tres fotos.
  - El estirón va **dentro del `@supports selector(:has(*))`**, donde se
    pintan los mandos. Sin `:has()` no hay mandos ni franja que cubrir, y
    estirarla ahí sacaría la capa 4rem por debajo del contenido sin motivo.
  - Lo comprueba `fondos.test.mjs` a 390, 768, 1280 y 1920 px: que el borde
    inferior de la capa coincida con el de la sección y que los mandos queden
    dentro. No dependía del ancho y aun así pasó inadvertido.
- **Por eso `.cabecera-mandos` lleva `position: relative; z-index: 10`.** Una
  capa posicionada se pinta por encima de un hermano estático aunque vaya antes
  en el documento, así que al estirar el fondo las flechas y los puntos
  desaparecieron debajo. Medido después: flechas 3,90:1 y puntos 3,34:1, por
  encima del 3:1 que pide WCAG 1.4.11.
- **En MÓVIL se sirve otra imagen, vertical** (`imagenFondoMovil`, huecos
  `fondo-movil-*` de 800×1270). La de escritorio es apaisada y en el teléfono
  la franja es alta y estrecha: `cover` recorta por los lados y solo deja ver
  entre el 32 % y el 39 % del ancho. En la lámina laboral ahí cabía el abogado
  y nadie más, con lo que se perdía a quién le explica el contrato. **No se
  arregla moviendo el encuadre**: los dos personajes ocupan el 52 % del lienzo
  y en móvil caben 39 %.
  - Va con **`<picture>` y una `<source media>`**, no con dos `<img>` y CSS:
    así el navegador descarga UNA sola, y esta decide el LCP de la portada.
  - El `<picture>` lleva **`display: contents`**. Es `inline` por defecto, y
    entonces el `h-full w-full` de la imagen se mide contra una caja de alto
    automático: la foto se queda en su tamaño natural en vez de llenar la
    franja.
  - El campo es **opcional**: sin él, el móvil usa la de escritorio, que es
    como funcionaba antes. Añadirlo no cambió ninguna lámina.
- **La capa tapa la cuña** en la banda de esa lámina. Es lo buscado: la cuña es
  decoración del diseño plano y debajo de una foto solo ensucia.
- **El velo no es opcional de verdad.** Una foto cualquiera detrás de un titular
  blanco es una moneda al aire: el contraste depende de la zona de la foto que
  caiga bajo cada letra, y eso NO hay forma de medirlo desde el panel —el número
  que el panel enseña para los colores aquí no sirve—. El campo `velo`
  (ninguno/ligero/medio/fuerte/opaco) es la única herramienta que lo arregla sin
  tocar la foto. Por defecto `ninguno`, para que añadir el campo no oscurezca
  nada; en cuanto se pone una foto, hay que mirar si el texto se lee.
- **El velo toma el color de `colorFondo`**, para que no se vea una costura
  entre la banda de la lámina y el resto de la sección.
- **El velo es PLANO en móvil y DEGRADADO desde `md`.** En móvil el texto ocupa
  todo el ancho, así que toda la foto está debajo de algo y oscurecerla entera
  es lo correcto. En escritorio el texto solo llega al 49 % del ancho: un velo
  plano apagaría también la mitad derecha, que es justo donde la foto cuenta lo
  que tiene que contar. El degradado va a plena fuerza hasta el 38 % y termina
  de irse en el 82 %.
- **El color del velo viaja a CSS en COMPONENTES (`--velo-rgb`), no en
  hexadecimal.** El degradado necesita el mismo color con alfa 0 en el otro
  extremo, y escribir `transparent` hace que varias máquinas interpolen pasando
  por negro transparente: aparece una banda gris por el medio.
- **La prioridad alta es de UNA imagen por pantalla.** Si la primera lámina
  lleva fondo, el candidato a LCP es el fondo —ocupa toda la franja— y la figura
  baja a `auto`. Con las dos en `high` compiten y la medida empeora para ambas.

**La lámina 2 —«su abogado de confianza»— usa la misma receta, con una
diferencia.** Su foto
(`docs/imagenes-origen/fondo-confianza-despacho.jpg`) ya trae a los dos
personajes en la mitad derecha, así que **no hay que correrla**: basta fundir
la foto nítida sobre la base oscura.

Lo que sí cambió es **dónde empieza ese fundido**. En la lámina 1 arrancaba en
el 10 % del ancho; aquí eso dejaba el titular blanco sobre la ventana del
despacho, que es casi blanca, con 1,20:1. El lado izquierdo de esta foto es
claro **hasta el 48 %** —ventana arriba, mesa abajo—, así que la foto nítida no
puede asomar antes de que acabe el texto: va de **46 % a 66 %**. Medido en la
página: rótulo 10,39:1, titular 14,00:1, subtítulo 11,80:1.

**Regla que sale de ahí:** el fundido no se copia de una lámina a otra, se
calcula mirando hasta dónde es clara la foto por la izquierda. Si la zona clara
llega más allá del 49 % —donde acaba el texto—, el fundido empieza después de
esa marca, no antes.

**El lienzo es 1920×1080, pero a 1920 px solo se ve una banda.**
Era `y 156-924`; desde que la capa se estiró para cubrir los mandos es
**`y 133-947`**. El número sale de `encuadre.mjs`, que lo mide en la página:
no se escribe de memoria, porque cambia con el alto de la capa. La
franja del hero es más apaisada que 16:9, así que `object-fit: cover` recorta
por arriba y por abajo —y justo ahí estaba la frente del
abogado—. La foto se compone **encogida al 87 % y anclada abajo y a la
derecha**: así la cabeza baja hasta `y 210`, con 54 px de aire, sin moverse del
lado derecho. El hueco que queda arriba lo cubre la base borrosa, con un
desvanecido de **100 px**: más corto deja una frontera visible y más largo
empieza a difuminar el pelo.

Se compone con `herramientas/componer-fondo-hero.mjs` (`ESCALA`, `PLUMA`,
`DESDE`, `HASTA`), que reproduce el archivo publicado píxel a píxel.

**`.png()` en TODOS los pasos intermedios de sharp, no solo al final.** El
origen es un JPEG y sharp devuelve el formato de entrada: sin eso, un
`toBuffer()` a mitad de la cadena da un JPEG, que no tiene canal alfa, y el
desvanecido se hornea en NEGRO en vez de dejar ver la base. Se nota como un
bloque negro macizo al lado del sujeto.

**Antes de dar por buena una imagen de fondo hay que mirarla a 1920, 1440 y
1024**, no solo al ancho de trabajo: cada uno recorta una parte distinta del
lienzo. `herramientas/visual.mjs` y `encuadre` dan los números; el recorte de
cabezas solo se ve mirando.

**La lámina 3 —«perito avaluador»— cierra la serie con la misma receta.** Foto
`docs/imagenes-origen/fondo-perito-despacho.jpg`, escala 0,87, pluma 100 y
fundido de **48 % a 62 %**: su mitad izquierda es pared blanca con luminancia
230 hasta el 40 % —más clara aún que la de la lámina 2—, así que la foto nítida
no puede asomar hasta pasado el texto; y a partir del 62 % empieza la cara, que
no puede quedarse a medio fundir. Medido: rótulo 10,49:1, titular 13,57:1,
subtítulo 13,16:1.

**Lo que está al PIE de la foto no entra pegando la foto abajo.** Los planos
sobre la mesa caen siempre en los 133 px que el navegador recorta, da igual la
escala: con la foto anclada al borde inferior no hay número que los salve. Hay
que **despegarla** (`SUBIR`) y rellenar el hueco con la base, que por eso lleva
su propio desvanecido inferior. La lámina 3 va a escala 0,80 y 90 px de
despegue; así los planos y la cinta métrica quedan dentro.

Las dos piezas se componen con herramientas del repositorio, no a mano:
`herramientas/componer-fondo-hero.mjs` (escritorio) y
`componer-fondo-hero-movil.mjs` (vertical). Las dos leen las medidas del
archivo de origen, así que no dan por hecho un lienzo de 2752×1536.

**En el fondo vertical, lo único que BAJA un objeto en el encuadre es recortar
por abajo** (`ALTO`). La tira va pegada al borde inferior, así que todo lo que
haya debajo del elemento importante lo empuja hacia arriba: con la mesa y los
planos dentro, la maqueta de la casa caía justo detrás del botón. Recortando el
22 % inferior del original, la maqueta baja por debajo del botón y se ve
entera. Ensanchar o estrechar el recorte lateral cambia la escala, no la altura
relativa.

**Los rótulos se truncan en silencio a 40 caracteres.** `etiqueta` declara
`max: 40` en el registro y `sanearDatos` recorta lo que sobra sin avisar: «Perito
avaluador de bienes muebles e inmuebles» se guardó como «…muebles e inm» y así
se publicó. El panel lo impide con el `maxlength` del control, pero un guion que
escribe por la API no pasa por ahí. **Lo que se escriba desde un guion hay que
leerlo después de guardarlo**, no darlo por puesto.

**En móvil esa foto necesita además un velo VERTICAL dentro del archivo.** La
pared del despacho queda detrás del texto y es blanca. El velo lleva navy al
62 % desde arriba hasta el 74 % del alto y se retira en el 88 %, que es justo
por encima del apretón de manos. Y el recorte horizontal arranca en el 32 %,
no en el 48 %: **abrirlo baja el apretón en el encuadre**. La distancia de un
elemento al borde inferior solo depende de la escala horizontal, así que
recortar por arriba no lo mueve; ensanchar, sí.

**Una foto en color se deja en color; el duotono es para las que no lo
aguantan.** La lámina laboral usa `docs/imagenes-origen/fondo-laboral-ingenio.jpg`
—escena de un ingenio de caña entregada por el cliente— en color natural. Solo
lleva un punto menos de saturación y de brillo, porque el verde a plena pureza
pelea con el navy. Pesa 178 KB a calidad 76, y es la imagen que decide el LCP
de la portada.

**La foto no se recorta: se CORRE a la derecha y el hueco se rellena de navy.**

Recortando no había salida. El texto llega al 49 % del ancho, así que para
sacar al abogado de debajo del titular había que estrecharlo, y estrechar
acerca la escena: se elegía entre ver más campo o ver la cara. Correrla
resuelve las dos a la vez.

La foto se escala al alto de la franja y se coloca pegada al borde derecho,
con el **brazo del trabajador justo en el canto** (acaba en el 84,5 % del
original). Queda un 15 % de navy a la izquierda, que cae entero debajo del
texto. Resultado: cara del abogado al 48–60 %, libre del titular; contrato al
59–76 %; trabajador al 74–100 %.

- **Debajo de todo hay la MISMA escena muy desenfocada y oscurecida**, no un
  color plano. El hueco de la izquierda era navy macizo y el cliente lo señaló:
  «crea un espacio muy oscuro que daña la atención de quien mira». Una base
  borrosa de la propia foto —desenfoque 55, brillo 0,52, tinte navy al 56 %—
  le da continuidad y textura sin inventar contenido ni aclarar el apoyo del
  titular: el contraste quedó igual (18,56:1), solo desapareció el bloque
  muerto.
- **El borde izquierdo de la foto se DESVANECE sobre esa base**, no se corta.
  Con un corte seco se veía una línea vertical: el velo no es bastante opaco
  ahí para disimularla. El desvanecido son **420 px**: la foto se ve a medias
  en el 26 % del ancho y entera en el 37 %.
- **Lo oscuro de la izquierda sale de DOS sitios y se regulan por separado:**
  el velo (en el panel, por lámina) y el navy macizo con su desvanecido (en el
  archivo). Bajar solo el velo aclara la foto pero deja la banda igual; acortar
  solo el desvanecido adelanta la foto pero no quita el lavado.
- **El bloque de texto se sale del contenedor hacia la izquierda**
  (`xl:-ml-12 2xl:-ml-20`) para ocupar la zona en penumbra en vez de dejarla
  muerta. Solo desde 1280 px: por debajo, el contenedor ya está a su ancho
  máximo y el texto pegado al margen —medido, 24 px a 1024 y a 768, 16 px a
  390—, así que tirar de él ahí lo sacaría de la pantalla. **El precio es que
  en pantallas anchas el titular deja de alinearse con el logotipo y con las
  secciones de abajo**; es una decisión pedida, no un descuido.
- **No confundir las dos quejas.** «Está muy oscuro a la izquierda» puede
  querer decir dos cosas opuestas: que el velo apaga la foto —y bajarlo deja el
  titular sin apoyo, ya pasó— o que hay un bloque de color plano que rompe la
  estética. La segunda se arregla con textura, no con claridad.
- **La lámina laboral va en velo `medio` + desvanecido de 420 px, y ese es el
  punto bueno.** Se probó a aclararla (velo `ligero` + 300 px): los números de
  contraste seguían altísimos —19:1 contra el 4,5:1 que pide la norma— y aun
  así **el cliente la quiso de vuelta**, porque el titular blanco se apoyaba
  peor. Es el recordatorio de que el contraste medido dice si el texto se PUEDE
  leer, no si se lee cómodo: sobre una foto con detalle, un titular grande
  necesita más colchón del que marca el mínimo. **No aclararla otra vez sin
  hablarlo.**
- **El degradado del molde va en el ALFA (`stop-opacity`), no en el color.**
  `blend: 'dest-in'` multiplica por el alfa del molde, y un degradado de negro
  a blanco es opaco de punta a punta: no recortaba nada y la costura seguía.
- La franja de navy solo asoma en pantallas anchas, y siempre bajo el texto.
  En móvil la zona visible (35 % central) cae entera dentro de la foto.

Los encuadres se prueban con `herramientas/previsualizar-fondo.mjs`.

**Una foto de fondo se trata ANTES de subirla, no se sube cruda.** La de la
lámina laboral sale de `HOMBRE-TRAJE.jpg` de la web anterior y lleva tres pasos:
se recorta la zona desenfocada de la izquierda —así no aparece un segundo
hombre junto al retrato del abogado, y el desenfoque disimula que la fuente es
de 540 px de alto—, se pasa a gris y se tiñe con una **rampa de marca** (sombra
`#0A2443`, luz `#224E84`). El resultado es textura navy de 9 KB que no saca la
franja de la paleta, y permite dejar el velo en «ninguno».

Para tratarlas sirve `sharp`, que ya viene con Astro. **Eso no contradice la
regla de no usar `sharp` en el servidor**: aquí es una herramienta de autoría
que se usa una vez, no una dependencia de ejecución. El panel sigue
redimensionando en el navegador.

Los tres huecos nacen con un **PNG de 1×1 transparente de 68 bytes**. La columna
`archivo` no admite nulos y una ruta a un archivo inexistente dejaría un
recuadro roto en el panel. El sitio público nunca lo pide: ninguna lámina apunta
a esos huecos hasta que alguien los elige.

### Los colores del texto van libres, por decisión del cliente

Campo `tipo: 'color'`. Selector nativo + hexadecimal + **el contraste medido al
lado**, calculado contra el fondo que declara el bloque en su `tono`.

**No bloquea nada.** Es la decisión D4 de la spec 002, tomada tras exponer que
rompe el AA del proyecto. Se enseña el número porque informar no es impedir: un
color por debajo de 3:1 sale rotulado «ILEGIBLE» y se guarda igual.

**Un color es texto que acaba dentro de un atributo `style`.** `sanearDatos` lo
valida contra `^#[0-9a-f]{6}$` y descarta lo demás. Sin eso, el campo sería una
vía de inyección: `red;background:url(...)`. Se valida con lista de lo
permitido, no de lo prohibido: la primera no se puede rodear.

Los valores por defecto son los colores que cada bloque ya usaba, así que los
campos no cambiaron nada hasta que alguien los toca. **Ojo con el tono `medio`**
(`franjaTexto`): se llama así pero va sobre fondo claro, y por eso su defecto es
tinta y su contraste se mide contra `humo`, no contra navy.

### El panel lleva su propia CSP, con nonce

`helmet` pone `script-src 'self'`, que **prohíbe el JavaScript en línea**. El
panel lleva el suyo dentro de la página, así que esa política lo bloqueaba
entero: ni se subían imágenes desde el navegador ni respondían los
interruptores. Desde Node sí funcionaba —un `fetch` de servidor no aplica
CSP—, y por eso las pruebas pasaban mientras el navegador no hacía nada.

Se resuelve con un **nonce distinto en cada petición**, no con `unsafe-inline`:
así solo corre el script que sirve este servidor.

`img-src` tiene que incluir **`blob:`**. El panel dibuja la imagen elegida en
un canvas para redimensionarla y la carga desde un `URL.createObjectURL`. Sin
`blob:`, toda subida falla con «el archivo no es una imagen».

En desarrollo el servidor sirve además `/img` estáticamente. En producción eso
lo hace Apache desde el mismo dominio; en local el panel está en el 3000 y las
imágenes en el 4340, y sin ese montaje la pantalla sale llena de recuadros
grises y no se puede comprobar si una foto quedó bien.

**CORS se aplica SOLO a la API, nunca al panel.** El panel es HTML del propio
servidor: sus formularios son del mismo origen y no tienen nada que negociar.
Cuando CORS estaba global, el navegador enviaba el `Origin` del panel —que no
figura en `CORS_ORIGINS`— y el acceso se rechazaba con «Origen no permitido».

**Las pruebas no tocan contenido real.** El hueco `prueba-tecnica` existe solo
para eso y el panel oculta todo lo que empiece por `prueba-`. Una prueba que
deja el sitio alterado no es una prueba.

Cuando una prueba no tiene más remedio que escribir sobre el bloque real —el
editor, los colores, los fondos— guarda una copia al empezar y la devuelve al
acabar. Dos reglas que salieron de verlo fallar:

- **La devolución va en un `finally`. SIEMPRE.** Una suite se cayó a mitad y
  dejó su titular de prueba publicado; la siguiente tomó su copia de ese estado
  sucio y falló por algo que no era suyo. Una prueba que ensucia convierte a
  las demás en mentirosas.
  Y hay un caso peor, que ya ocurrió: `imagenes.test.mjs` comprueba que una
  clave de imagen inventada no se cuela mandando unas láminas con
  `titulo: x/y/z` y nada más, lo que **borra textos, colores y rótulos** de la
  portada. Tenía la devolución al final, suelta; bastó con que una ejecución no
  llegara hasta ahí para dejar la cabecera destrozada en la base **y publicada
  en el sitio**. Si una comprobación escribe algo que no sea un valor de
  prueba inocuo, el `try`/`finally` no es estilo: es lo único que separa un
  fallo de la prueba de una pérdida de contenido.
- **Un HUECO DE IMAGEN también es contenido.** La suite `fondos` sube a
  `fondo-lamina-2` —es el único hueco de su medida al que llega el
  formulario— y devolvía el hueco a su relleno de 1×1, lo que era correcto
  mientras estuvo de estreno. El día que la lámina 2 estrenó foto, la prueba
  **le borró el archivo del disco y la fila de `medios`**, y la portada se
  publicó sin fondo. Ahora guarda el archivo y la fila al empezar y los
  repone. Lo mismo que con los textos: se devuelve lo que había, no lo que
  había el día que se escribió la prueba.
- **Las variables que usa el `finally` se declaran FUERA del `try`.** Una
  `const` declarada dentro del bloque no existe en el `finally`, así que la
  devolución se cayó a mitad con un `ReferenceError` y dejó puesta la foto de
  prueba. Un `finally` que se rompe no protege nada.
- **La comprobación final se compara contra la COPIA, no contra un valor
  escrito a mano.** Si no, la prueba da por hecho cómo estaba la portada el día
  que se escribió.
- **Una prueba que cambia un INTERRUPTOR devuelve su estado, no lo enciende.**
  `bloques.test.mjs` probaba el interruptor sobre el id 7 clavado a mano
  —«Casos resueltos»— y «devolvía» el bloque **encendiéndolo**, porque daba
  por hecho que había empezado visible. El día que el cliente apagó ese bloque,
  ejecutar la suite lo dejó VISIBLE y la portada volvió a enseñar una sección
  retirada a petición suya. **Lo vio el cliente, no la suite.** Ahora el bloque
  se ELIGE (el primero que esté encendido), el estado se lee antes y se repone
  en un `finally`. La misma suite fijaba además «la portada queda con sus 8
  bloques»: en cuanto hubo uno apagado, esa comprobación se puso roja
  denunciando un fallo que no existía.
- **Una prueba NO puede nombrar contenido.** Ni el orden de las láminas, ni qué
  foto lleva cada una, ni cuántos campos de color hay. Se reordenó el carrusel
  y se añadió un campo, y cinco comprobaciones de tres suites se pusieron rojas
  denunciando fallos que no existían. Se comprueba el COMPORTAMIENTO —que cada
  lámina tenga su hueco propio, que las no tocadas no se muevan, que solo una
  imagen lleve `fetchpriority="high"`— y los valores se leen de la copia.
- **También el SQL de las pruebas va parametrizado** (`-v` de psql con
  `:'nombre'`). Un titular con apóstrofo rompía la sentencia. Ojo: `psql -c`
  **no** sustituye variables; la consulta tiene que ir por la entrada estándar
  con `-f -`.

- **Para QUITAR un campo hay que mandarlo en blanco, no omitirlo.**
  `conciliar()` conserva lo que el formulario no envía —es lo que protege a los
  campos de reserva—, así que devolver el objeto original sin `imagenFondo`
  dejaba el fondo puesto y la prueba se iba creyendo que había limpiado.
- **Publicar responde 202 ANTES de empezar a compilar.** Un bucle que sondea el
  estado y sale en cuanto no es `en-marcha` sale en la primera lectura y mide
  el sitio ANTERIOR. Hay que esperar a VERLA arrancar y solo después a que
  acabe. Se notó porque `lg:col-start-2` y el degradado del velo solo existen
  en la hoja de estilos nueva: la prueba denunciaba un texto a la izquierda y
  un velo plano que en la página estaban bien.
- **No se puede comprobar que una imagen DIFERIDA cargue.** En este equipo
  Chrome no dispara la carga diferida con la ventana en segundo plano: de las
  13 imágenes `loading="lazy"` de la portada, incluidas las que llevan semanas
  publicadas, cargan **cero**. Una comprobación que dependa de eso no mide el
  sitio, mide si alguien tenía el navegador delante. Se comprueba estructura y
  geometría.

**Nunca escribir cargas maliciosas reales en disco para probar.** Se intentó
una vez con un webshell PHP y el antivirus del equipo lo puso en cuarentena,
con razón. Para comprobar que la validación mira los bytes de cabecera basta
con texto plano que no sea una firma de imagen.

No negociables, ya implementados:
- Hash con `scrypt` de `node:crypto`; sin dependencias nativas.
- El mismo mensaje y el mismo tiempo si el correo no existe o si la clave
  falla: de otro modo se pueden enumerar cuentas.
- Cookie `httpOnly` + `SameSite=Lax`; el token se guarda **hasheado** en la base.
- Token anti-CSRF por doble envío en todo formulario y toda subida.
- Subidas: lista blanca por **bytes de cabecera**, nunca por extensión. El
  nombre del archivo lo decide el servidor a partir de la clave.
- Una subida que se pasa de tamaño se **drena** antes de responder 413. Si se
  corta la conexión a media subida, el cliente recibe ECONNRESET y nunca llega
  a leer el motivo.
- Una navegación sin sesión redirige; una subida o llamada de datos recibe 401.

### Cada foto va junto al texto al que acompaña

Las imágenes **se editan dentro del formulario del bloque**, no en una rejilla
aparte. Antes los textos estaban en el formulario y las fotos arriba, así que
para cambiar la foto de la lámina 2 del slider había que adivinar cuál de las
tres tarjetas de la cabecera era la suya. Ahora la lámina 2 enseña su texto y su
foto en el mismo sitio.

El campo lleva **dos controles, porque son dos acciones distintas**:

- **Sustituir la foto** del hueco que el campo ya usa. Es lo normal: la clave no
  cambia, así que el sitio sigue apuntando donde apuntaba.
- **Apuntar a otro hueco** de la biblioteca, con un desplegable. Hace falta
  porque quitar y volver a añadir un elemento de un grupo pierde su clave, y sin
  desplegable no habría forma de devolvérsela.

Reglas que no se tocan:

- **El desplegable solo ofrece huecos de la MISMA medida sugerida.** Meter una
  foto de caso (600×380) en el hueco de una lámina (900×1100) la deja recortada,
  y un desplegable no es sitio para descubrir eso.
- **Nunca ofrece `prueba-*`.** Si apareciera, alguien podría apuntar una lámina
  real a ese hueco y la siguiente prueba automática cambiaría el sitio de
  verdad.
- **La rejilla de arriba enseña SOLO lo que el formulario no pinta**, y lo dice
  con esas palabras. El mismo control dos veces en la misma pantalla invita a
  tocar el que está más lejos de lo que se quería cambiar; callarlo del todo
  haría esa imagen inalcanzable desde el panel. El cálculo lo hace
  `clavesPintadas()`, que comparte con el formulario la regla de `reserva`:
  duplicada, un día dejarían de coincidir.
- **Una clave de imagen se valida dos veces, y en los dos sitios hace falta.**
  `sanearDatos` comprueba la FORMA (`^[a-z0-9][a-z0-9-]{0,62}$`), que es lo
  único que puede saber desde el frontend; `conciliar()` comprueba que el hueco
  EXISTE, porque el catálogo está en el servidor. Una clave inventada se
  descarta y se queda la de antes.
- **Las miniaturas van en `loading="lazy"`.** Con veinte fotos en la pantalla,
  descargarlas todas de golpe para enseñarlas a 92px no tiene defensa. En las
  pruebas hay que traerlas a la vista antes de comprobar que cargan.
- **El clon de un elemento nuevo se queda SIN imagen.** Hereda la miniatura del
  que lo originó, y una miniatura que no corresponde al texto de al lado es
  justo lo que este cambio venía a evitar.

**Un selector de atributo cuenta como una clase.** `.campo input[type=text]`
vale (0,2,1) y le ganaba a `.fila-color .hex` (0,2,0): el hexadecimal salía al
100% del ancho y empujaba el contraste fuera de la ficha. Se arregla subiendo el
selector a `.fila-color input[type=text].hex`. Apareció al meter los colores
dentro de las láminas, que son más estrechas que el cuerpo del editor.

**No se puede escribir la secuencia de cierre de `script` dentro del guion del
panel, ni siquiera en un comentario.** El navegador cierra el bloque en cuanto
la ve y el resto del guion se interpreta como HTML: el panel entero deja de
responder con un «SyntaxError: Invalid or unexpected token». Pasó escribiendo el
comentario que advertía de este mismo problema. Es la hermana del caso de las
comillas invertidas: todo lo que viaja dentro de ese literal tiene que evitar
los caracteres que lo delimitan.

### Los bloques guardan la CLAVE de la imagen, no la ruta

`datos.imagen` vale `sobre-nosotros`, no `/img/sobre-nosotros.svg`. El
renderizador la resuelve con el mapa de `medios` que acompaña a cada página.

Es lo que hace que sustituir una imagen en el panel se vea en el sitio: el
archivo nuevo tiene otra extensión (`.svg` → `.webp`) y, si el bloque guardara
la ruta, seguiría apuntando al archivo viejo.

### El redimensionado ocurre en el navegador

`canvas.toBlob` ajusta y convierte a WebP antes de subir. Evita instalar
`sharp` en cPanel y hace que el editor no pueda degradar el rendimiento del
sitio aunque arrastre un JPEG de 8 MB. **Es el único JavaScript del proyecto y
vive solo en el panel: el sitio público sigue enviando 0 KB.**

## La franja del perito puede llevar foto de fondo, y entonces pierde el marco

Petición del cliente (12-11-2026). Ver `specs/007-fondo-perito/`.

**La figura enmarcada y el fondo NO conviven, y aquí no es como en la
cabecera.** Allí la figura es un recorte montado sobre la cuña y deja ver la
foto al lado. Aquí es un `<img>` **opaco** que ocupa su columna entera. Medido
en la página:

| Ancho | Sección | Figura | Texto | Libre |
|---|---|---|---|---|
| 1920 px | 1905×689 | 21 %–48 % | 52 %–79 % | 0–21 % y 79–100 % |
| 1440 px | 1425×689 | 11 %–48 % | 52 %–89 % | 0–11 % y 89–100 % |
| 1280 px | 1265×689 | 6 %–47 % | 53 %–94 % | casi nada |
| 1024 px | 1009×717 | 2 %–47 % | 53 %–98 % | nada |

Entre 1024 y 1280 px no queda un solo punto libre: una foto detrás no se vería
en ningún sitio. Por eso `imagen` es **reserva de `imagenFondo`** y la figura
no se pinta cuando hay fondo. **No se pierde nada:** la clave de la figura se
conserva y elegir «— sin imagen —» en el fondo devuelve el diseño anterior
entero.

Sin fondo, el bloque se ve exactamente como siempre. Añadir los campos no
cambió la portada.

### `reserva` entiende ahora también una cadena

`reservaSuperada()` solo miraba **arrays**: nació para los campos sueltos de la
cabecera frente al grupo `laminas`. Lo que supera a `imagen` es `imagenFondo`,
que es una cadena. Se amplió la función en su único sitio; duplicar la regla es
justo lo que advierte su propio comentario.

### El velo es el ESPEJO del de la cabecera, y el corte NO es el mismo

| | Cabecera | Perito |
|---|---|---|
| Texto | mitad izquierda | mitad **derecha** |
| Velo a plena fuerza | 0 %–38 % | 62 %–100 % |
| Se retira en | 82 % | 18 % |
| Corte a dos columnas | `md` (768 px) | **`lg` (1024 px)** |

**Copiar el `md` de la cabecera sería un fallo silencioso.** Esta sección pasa a
dos columnas en `lg`, así que entre 768 y 1023 px el texto ocupa todavía el
ancho entero: con el corte en `md` le tocaría un degradado que deja limpia la
mitad izquierda, y medio titular quedaría sobre la foto. Lo vigila
`perito.test.mjs` a 1024, 768 y 390 px.

### La capa NO necesita el truco de `100vw`

En la cabecera la capa vive dentro de una lámina con `transform`, que crea
bloque contenedor, y por eso hay que sacarla con `left: 50%; width: 100vw`.
Aquí el ancestro posicionado es la sección entera, que ya lleva `relative` y
`overflow-hidden`: basta `inset: 0`. Sigue valiendo `z-index: 0`, nunca `-1`.

### La foto va compuesta, no subida cruda

Las dos piezas se generan con herramientas del repositorio, igual que las del
hero: `herramientas/componer-fondo-perito.mjs` (1920×1080) y
`componer-fondo-perito-movil.mjs` (1024×1536). Origen:
`docs/imagenes-origen/fondo-perito-campo.jpg` (2752×1536).

**Un redimensionado directo no vale.** El topógrafo ocupa el 97 % del alto del
original y la banda visible a 1920 px son 694 px de 1080: a tamaño completo se
le corta la gorra y las botas. Se encoge al **0,696** y lo que sobra lo rellena
la misma escena desenfocada y teñida de navy. Medido: sujeto en `y 211-869`,
dentro de la banda `193-887`.

- **La escala se CALCULA, no se adivina.** Se declaran `FRENTE` y `PIES` —el
  alto del sujeto en el original— y el guion deduce cuánto encoger. Si mañana
  cambia la foto, se miden dos números y el encuadre sale solo. Los dos guiones
  imprimen dónde queda el sujeto y si está DENTRO o FUERA.
- **La foto va anclada a la IZQUIERDA y se desvanece por la derecha**, al revés
  que en el hero. Allí el texto está a la izquierda.
- **Las plumas son anchas** (560 px a la derecha, 200 arriba). El cielo de esta
  foto es casi blanco y la base va oscura: con un desvanecido corto la frontera
  se ve como un resplandor, no como una transición. Cuanto más separados estén
  los dos brillos, más larga tiene que ser la rampa.
- **El molde de transparencia se calcula PÍXEL A PÍXEL.** El primer intento fue
  un SVG con tres rectángulos apilados con `mix-blend-mode: multiply`: **sharp
  no soporta `mix-blend-mode`**, los degradados se compusieron en modo normal
  —que SUMA opacidad— y el molde salió opaco de punta a punta, con cantos duros
  arriba, abajo y a la derecha. Multiplicar tres rampas es una línea de
  aritmética.
- Sigue valiendo lo de siempre: `.png()` en todos los pasos intermedios de
  sharp, o el desvanecido se hornea en negro.

### El velo se eligió midiendo, no mirando

`herramientas/contraste-fondo.mjs` calcula el contraste del texto blanco sobre
la imagen **y su velo**, solo en la zona que se ve Y lleva letras encima.

| Velo | Escritorio (peor) | Móvil (peor) |
|---|---|---|
| ninguno | 2,56:1 ✗ | 1,00:1 ✗ |
| ligero | 3,75:1 ✗ | 1,89:1 ✗ |
| medio | 4,95:1 ✓ | 3,19:1 ✗ |
| **fuerte** | **6,65:1 ✓** | **5,92:1 ✓** |

**Manda el móvil**, porque el velo es un solo campo para las dos imágenes. En
escritorio `fuerte` no castiga al topógrafo: allí el velo es un degradado que
vale 0 en su zona y solo aprieta donde está el texto.

**No se mide en el navegador, y por eso existe la herramienta.** Se intentó
capturar la página y leer los píxeles bajo el texto: los números salían
distintos en cada pasada porque el fondo va en `loading="lazy"` y este equipo
no siempre dispara la carga diferida. Se estaba midiendo si la foto había
llegado, no el contraste.

### Medidas para encargar la imagen

- **Escritorio 1920×1080.** La banda visible **depende del ancho**: a 1920 px es
  `y 193-887`, a 1440 px `y 75-1005`, y a 1024 px el recorte pasa a ser lateral
  (`x 199-1721`). Diseñar para la banda de 1920 —la más estrecha— y dejar el
  10 % de cada costado libre cubre todos los casos.
- **Móvil 1024×1536.** Se ve la banda **`x 97-927`**, el 81 % central. Ojo:
  con la figura enmarcada la franja medía 390×1040 y solo se veía el 56 %;
  **sin ella mide 390×721 y se ve mucho más**. El ancho visible decide cuánto
  hay que encoger al sujeto, así que este número se vuelve a medir cada vez que
  cambia el alto de la sección.
- **El motivo va a la IZQUIERDA**, que es donde no hay letras. Al revés que en
  la lámina laboral de la cabecera.
- **Estos números son del día que se midieron, y la sección ha crecido.** Al
  meter los avales dentro de la columna (13-11-2026) pasó a **1920×943** y
  **390×1093**. Las bandas de arriba se calcularon con la sección más baja,
  así que **antes de recomponer cualquiera de las dos imágenes hay que volver
  a medirlas**; los fondos publicados no se tocaron y siguen bien encuadrados.
  La capa cubre la sección exacta a los seis anchos: lo comprueba
  `perito.test.mjs`.

### La franja de entidades certificadoras

Va **dentro de la columna de texto**, debajo del botón, a ras del titular, del
texto y de los puntos (petición del cliente, 13-11-2026). Medido: el borde
izquierdo del titular, el del botón y el de la primera pastilla coinciden al
píxel a 1920, 1440, 1280, 1024, 768 y 390 px. Ver
`specs/008-certificaciones-perito/`.

Antes iba **a lo ancho de la sección**, y el motivo era bueno: en una fila
única de cinco, la columna de texto solo da 80 px por logotipo.

### Y desde el 17-11-2026 va en UNA SOLA FILA

Petición del cliente. **Es exactamente el caso del que avisaba el párrafo de
arriba**, y conviene que quien lea esto sepa que se entró con los ojos
abiertos: la columna no ha crecido, así que los cinco sellos se reparten sus
520 px.

Cómo se hace: `flex-wrap: nowrap` en la lista y `flex: 1 1 0` en la pastilla.
Las dos mitades hacen falta. Solo con `nowrap`, cinco pastillas de 160 px piden
824 y se salen de la columna por la derecha; `flex: 1 1 0` —base **cero**, no
`auto`— es lo que las iguala, porque con base `auto` cada una partiría del
ancho de su contenido y acabarían midiendo distinto, que es justo la simetría
que este bloque defiende. Y `min-width: 0`, porque el mínimo por defecto de un
elemento flexible es el de su contenido y sin anularlo la imagen impide que la
pastilla encoja.

El alto fijo de `5rem` se sustituye por **`aspect-ratio: 2 / 1`**. Con un alto
fijo, al encoger el ancho la pastilla se iría volviendo cuadrada y el logotipo
quedaría nadando; con la proporción del lienzo, el dibujo sigue cayendo
centrado en los dos ejes sin una regla más.

**Se fueron los tramos de ancho de `.avales`** (330/500 px) y el `min()` de la
pastilla. Eran la maquinaria que centraba la fila corta bajo la llena: sin
envoltura no hay fila corta que centrar. El rótulo sigue centrado sobre los
sellos porque franja y rótulo comparten el envoltorio, que ahora ocupa la
columna entera.

**El hueco bajó de 10 px a 6 px.** En una fila de cinco, cada píxel de hueco
sale **cuatro veces** del ancho de las pastillas; esos 16 px son 3 px más de
logotipo en cada sello. El relleno bajó de 12/20 px a 5/7 px por lo mismo: con
el de antes, una pastilla de 99 px dejaba 59 px útiles y el sello no se
reconocía.

#### Lo que cuesta la fila única, medido

| Ancho | Pastilla | Logotipo | Antes (3+2) |
|---|---|---|---|
| 1440–1280 px | 99×50 | **79×40** | 160×80 · logo 112×56 |
| 1152 px | 98×49 | 78×39 | ídem |
| 1024 px | 85×42 | 65×32 | ídem |
| 768 px | 136×68 | 116×58 | ídem |
| 640 px | 111×55 | 91×45 | ídem |
| 390 px | 64×32 | **44×22** | ídem |
| 360 px | 58×29 | **38×19** | ídem |

Comprobado a los nueve anchos: una sola fila, **sin desbordar**, el borde
izquierdo de la primera pastilla sigue coincidiendo con el del titular y el del
botón, y el rótulo sigue centrado sobre los sellos.

**En escritorio se sostiene.** A 1440 el logotipo baja a ~70 % de su tamaño
anterior y las cinco marcas se reconocen con su línea pequeña legible.

**En el teléfono NO, y es una deuda abierta, no un detalle.** A 390 px el
logotipo queda en 44×22 y a 360 px en 38×19: las marcas principales —ARAV, RAA,
Aeronáutica Civil, Delta Force— todavía se reconocen por su silueta, pero la
**segunda línea de cada sello deja de leerse** («Autorreguladora de
Avaluadores», «Unidad Administrativa Especial», «Registro Abierto de
Avaluadores»): se ve una mancha gris. Esto contradice el tope por abajo que
fijó la rebaja del 13-11 —«si su segunda línea deja de leerse, el bloque ya no
dice quién avala»—, y lo contradice **a sabiendas**, porque la fila única se
pidió después.

**La salida, si algún día se quiere recuperar, es de una línea:** devolver
`flex-wrap: wrap` por debajo de `sm` y dejar que el teléfono caiga en 3 + 2,
manteniendo la fila única de `sm` para arriba. No hace falta tocar nada más;
los tramos de `.avales` sí habría que recuperarlos para centrar la fila corta.

- **Cada sello lleva su NOMBRE, y es obligatorio.** Es el texto alternativo: un
  sello sin nombre es una imagen que un lector de pantalla no puede anunciar, y
  lo que aporta el bloque es precisamente quién avala.
- **Sin logotipo se pinta el nombre.** Así la franja se ve antes de que lleguen
  los archivos, y el día que falte uno deja el nombre en vez de un cuadro
  vacío.
- **Cada sello va en una PASTILLA clara, y todas miden lo mismo.** 160×80 px,
  `border-radius: 999px`, casi blanco (0,96) con aro clarísimo y sombra corta.
  Es el tercer diseño de esta franja, y los tres anteriores están en el
  historial de `ServicioDestacado.astro`:

  1. Cinco cajas `bg-white/95` sueltas. Rechazadas: «parches pegados encima».
  2. Un panel único con filetes de 1 px. Aceptado y luego retirado.
  3. Una cinta sin superficie, con los cinco logotipos en monocromo claro.
     Retirada el mismo día: obligaba a recolorear cinco marcas ajenas y
     dejaba los sellos pequeños.

  - **La simetría la da la PASTILLA, no el dibujo.** Todas miden igual lleve
    el logotipo la proporción que lleve; lo de dentro ya viene igualado por
    área óptica desde `preparar-logos-certificacion.mjs`. Son dos
    normalizaciones encadenadas y hacen falta las dos.
  - **La pastilla es 2:1, igual que el lienzo**, así que el logotipo cae
    centrado en los dos ejes sin una sola regla más.
  - **160×80 no es una medida redonda: es la que deja caber TRES por fila.**
    La columna de texto mide entre 514 y 527 px, y 3×160 + dos huecos de 10
    son 500. Con 11 rem solo caben dos y la franja se estira a tres filas.
  - **La última fila va CENTRADA, y eso obliga a clavar el ancho.** CSS no
    sabe apuntar a «la última línea de un contenedor envuelto»:
    `justify-content` manda sobre todas. Así que se centra todo y se le da a
    la lista el ancho **exacto** de una fila llena: las filas completas lo
    llenan y no se mueven ni un píxel —siguen a ras del titular y del
    botón—, y la que va corta se centra dentro de ese mismo ancho. Medido:
    a 1920 la lista va de 992 a 1492 y la fila de dos empieza en 1077, que es
    el centro.
  - **El tope se declara por TRAMOS, y el de en medio es el que sorprende.**
    No es un ancho estético: es el número de pastillas por fila. 2 = 20,625rem
    (330 px), 3 = 31,25rem (500). La columna de texto **no se ensancha de
    forma lineal**: por debajo de `lg` ocupa todo el ancho y caben tres; a
    partir de `lg` vuelve a empezar estrecha —unos 450 px a 1024— y no pasa
    de 500 hasta los **1152 px**. Por eso hay un tramo de dos pastillas *en
    medio* de dos tramos de tres. A ojo no sale.
  - **La pastilla es `min(10rem, calc(50% - 0.3125rem))`.** A 360 px —el ancho
    con el que se diseña en este proyecto— la columna da 328 y dos pastillas
    con su hueco piden 330: faltaban 2 px y los cinco sellos caían en
    columna, uno por fila. El `min()` les quita esos dos píxeles en lugar de
    romper la rejilla; por encima de 330 px de contenedor no hace nada.
  - **El rótulo de esta franja va en negrita** (`!font-bold`), no en el
    `font-semibold` de la utilidad. Es una excepción local, pedida por el
    cliente: los demás rótulos del sitio no cambian.
  - **El rótulo va CENTRADO sobre las pastillas, no sobre la columna.** Por
    eso el tope de ancho vive en el envoltorio `.avales` y no en la lista:
    rótulo y pastillas miden lo mismo, así que el centro es el mismo. Con el
    tope en la lista, el rótulo se centraría respecto al texto de arriba y
    quedaría descolgado de los sellos. Medido a 1920: la caja va de 992 a
    1492 y el centro del texto cae en 1242, que es el centro exacto.
  - **En color sobre navy no hay franja posible sin superficie:** el logotipo
    de Aeronáutica Civil es tinta navy `#083888` y da **1,08:1**. Por eso la
    cinta monocroma obligaba a recolorear, y por eso la pastilla no es
    decoración: es lo que permite que cada marca conserve su color.
#### Los sellos crecieron tres veces el 17-11-2026, y la última SE SALE

El cliente los pidió más grandes tres veces seguidas. Las dos primeras
salieron de apretar lo que había; la tercera no cabía sin ceder en algo.

**Primera — la pastilla deja de ser 2:1.** El lienzo del logotipo sí es 2:1,
así que con la pastilla igual el dibujo topaba **por el alto** y se quedaba en
`79×40` dentro de una caja de `99×50`: le sobraba ancho y le faltaba altura.
A **1,9:1** el límite pasa al ancho —lo único que no se puede estirar, porque
los cinco se reparten la columna— y el logotipo llena el hueco. Por debajo de
~1,85 la pastilla engorda sin que el dibujo crezca un píxel: solo se gana aire
muerto. El hueco bajó a 5 px y el relleno a 3/5, que es el mínimo que admite
una cápsula sin que un apaisado toque la curva.

**Segunda — el techo real.** Medido: dentro del `.contenedor` quedan **24 px**
libres a la derecha, **a cualquier ancho**. Los 400 px que se ven sobrar a
1920 están FUERA del contenedor, donde no llega ningún otro contenido del
sitio. Con una fila de cinco ahí dentro, `90×45` es el máximo y lo que queda
por exprimir son 3 píxeles.

**Tercera — la franja se sale hacia la derecha.** Decisión del cliente, tomada
sobre las tres salidas posibles (dos filas / salirse / dejarlo). Un margen
derecho negativo de `max(0px, (100vw - 72rem) / 2 - 1rem)` va a buscar el aire
que sobra fuera del contenedor.

**Cuarta — y un tope, porque el aire de una pantalla ancha no tiene fin.** Sin
él, a 1920 px la franja se comía los 888 px disponibles y el logotipo llegaba a
164 px. El cliente lo vio y pidió **un 30 % menos**. El tope son **40rem**
(640 px), o sea `5 × 124 + 4 huecos de 5`, que deja el logotipo en **114** —el
70 % justo de 164—.

**El tope se expresa en ancho de la FRANJA, no de la pastilla**, y eso importa:
las cinco van con `flex: 1 1 0`, así que reparten lo que haya y el borde
izquierdo no se mueve. Topando la pastilla, sobraría sitio en la fila y el
reparto centrado empujaría el primer sello hacia dentro —que es exactamente
como se perdió una vez la alineación con el titular—.

| Ancho | Antes de los cambios | Con la franja suelta | **Final** |
|---|---|---|---|
| 1920 px | 90×45 | 164×82 | **114×57** |
| 1536 px | 90×45 | 125×63 | **114×57** |
| 1440 px | 90×45 | 116×58 | **114×57** |
| 1280 px | 90×45 | 100×50 | 100×50 |
| 768 px | 127×64 | 127×64 | **114×57** |
| 1152 px y el resto | sin cambio | sin cambio | sin cambio |

El tope **no toca teléfono ni 1024–1280**: ahí la franja ya es más estrecha que
640 px. Sí afecta a 768, donde la columna ocupa todo el ancho y la franja
llegaba a 705.

Lo que se paga, y el cliente lo sabe:

- **Por debajo de 1280 px no se gana NADA.** El aire solo existe en pantallas
  anchas; en teléfono y tableta la franja sigue exactamente igual.
- **La franja queda más ancha que el resto del contenido de la página.** El
  borde IZQUIERDO sigue a ras del titular y del botón —lo que se pidió el
  13-11—; el derecho se sale.

**El tope de la pastilla subió a 11rem, y no es estético.** Con 10rem, a
1920 px la pastilla tocaba su máximo y sobraba sitio en la fila:
`justify-content: center` repartía ese sobrante a los dos lados y **el primer
sello dejaba de estar a ras del titular**. Con 11rem el tope no llega a
tocarse —a 1920 la pastilla pide 174—. Por encima no conviene subirlo: el
lienzo mide 320 px de ancho, así que a 176 todavía se sirve al doble de
densidad; más allá empieza a ampliarse.

**No hace falta `overflow` en la franja:** la sección ya lo recorta, porque lo
necesita para la capa del fondo a sangre.

- **El rótulo NO va en el rojo de marca.** Sobre una foto el rojo no aguanta
  —5,92:1 sobre navy plano, 2,31:1 sobre duotono— y este rótulo queda centrado
  donde el velo solo está a medias. Y el botón rojo está justo encima: dos
  rojos seguidos dejan de señalar cuál hay que pulsar. Va en `marino-100`.
- **Un hueco con su relleno de 1×1 NO es un logotipo, pero el componente cree
  que sí.** Apuntar una entidad a un hueco sin foto real deja la casilla en
  blanco: hay imagen, así que deja de pintarse el nombre. Lo vigila una
  comprobación que cuenta como vacía toda casilla sin texto cuya imagen mida
  menos de 4 px, y esa comprobación **se verificó fallando**: una prueba de
  regresión que nunca se ha visto fallar no demuestra nada.
- **La lista lleva `data-certificaciones`.** La sección tiene otra `<ul>` —la
  de los puntos del servicio— y una prueba que buscaba «la primera lista»
  medía la equivocada. Ya pasó.

### Los cinco logotipos llegaron el 12-11-2026, y solo entraron cuatro

Los prepara `herramientas/preparar-logos-certificacion.mjs`, no se suben
crudos. Vinieron con fondo blanco macizo y de 220 px a 7178 px de ancho.

- **El fondo blanco se quita por INUNDACIÓN desde los bordes**, la misma regla
  que los favicons. Un filtro «todo lo claro a transparente» agujerea el escudo
  de Delta Force, cuyo campo es gris muy claro. Y la condición es *claro Y
  neutro*: el amarillo pálido de ese mismo escudo es claro pero no neutro.
- **La inundación va con pila explícita, no con recursión.** El archivo de
  Delta Force son 22 millones de píxeles y una inundación recursiva desborda la
  pila de Node.

**El hueco es de 320×120, no de 320×160.** Medido: el hueco útil de una casilla
es de 170×64 px en escritorio, o sea 2,66:1. Con un lienzo 2:1 el logotipo se
contiene por el ALTO y se queda en 128 px de los 202 que mide la casilla, con
un palmo de blanco a los lados y la línea pequeña ya ilegible. Igualada la
proporción, lo llena: 170×64.

La medida tiene que ser **la misma en el registro y en `medios`**. El
desplegable solo ofrece huecos de la misma medida sugerida, así que si
discrepan el campo se queda sin un solo hueco que ofrecer.

**Aeronáutica Civil entró al segundo intento.** El primer archivo era la
versión en NEGATIVO: 63 % de tinta blanca y 33 % navy `#082858`, que da 1,03:1
sobre la superficie clara y 1,08:1 sobre navy. **No había color de casilla que
lo salvara** y recolorear una marca ajena no está sobre la mesa, así que esa
entidad se publicó sin logotipo, enseñando su nombre —que es exactamente para
lo que existe ese respaldo—. El cliente entregó la versión positiva el mismo
día (tinta navy `#083888` sobre blanco) y ya está puesta.

**El camino del nombre sigue ahí y no se quita** aunque hoy las cinco tengan
logotipo: es lo que evita un cuadro roto el día que falte un archivo.

### Los logotipos se igualan por ÁREA, no por altura

Cuatro de los cinco son apaisados (de 2,4:1 a 2,9:1) y el de Aeronáutica Civil
es **apilado** (1,38:1: emblema arriba, dos líneas de texto debajo). Contenidos
todos en el mismo lienzo, el apilado toca el techo antes de crecer a lo ancho y
se ve claramente más pequeño que sus vecinos, con su línea inferior ya
ilegible. Es el defecto clásico de una fila de avales, y se vio en cuanto el
panel dejó de distraer.

La herramienta coloca cada logotipo con la **misma área óptica** (30 000 px²
sobre un lienzo de 320×160): el apilado queda más alto y estrecho, el apaisado
más bajo y ancho, y los cinco pesan lo mismo. Es lo que se haría a mano en un
sistema de diseño; aquí lo hace la aritmética, que además no se olvida cuando
llegue un sexto.

- **El lienzo es solo el MARCO.** Hubo un paso por 320×120, igualando su
  proporción a la del hueco de la casilla para que un apaisado lo llenara:
  resolvía ese caso y rompía el apilado. Un lienzo de 320×160 admite las dos
  proporciones.
- **El CSS limita el alto del LIENZO, no el del logotipo.** Si volviera a
  ajustar cada imagen a su caja desharía la normalización y el apilado se vería
  pequeño otra vez. Arriba solo se elige a qué tamaño se sirve el marco.
- **La escala por área va sujeta al lienzo.** Sin ese tope, un logotipo muy
  apaisado se saldría por los lados al pedirle su área.

### El tamaño se bajó el 13-11-2026, y lo que lo agrandaba era la CASILLA

> **Superado el mismo día por la cinta minimalista.** Ya no hay casilla ni
> panel: los números de abajo son de un diseño que ya no está. Se conserva
> porque la lección sí sigue valiendo —cuando algo «se ve grande», mirar
> primero el aire que lo rodea— y porque el tamaño actual de los sellos
> (2,75rem en escritorio, 2,25rem en móvil) sale de esta misma rebaja.

Petición del cliente: los sellos se veían demasiado grandes. Lo primero que se
mira en un caso así es el logotipo, y era solo la mitad: una casilla alta con
mucho blanco alrededor hace que la marca de dentro lea como un titular.

Se bajaron **las dos cosas a la vez**, manteniendo la proporción entre ellas:

| | Antes | Ahora |
|---|---|---|
| Lienzo servido (escritorio) | 160×80 | **128×64** |
| Casilla (escritorio, a 1440) | 220×136 | **220×104** |
| Lienzo servido (móvil) | 112×56 | **88×44** |
| Casilla (móvil, a 390) | 179×96 | **179×76** |

**Solo cambió el CSS.** Los cinco archivos siguen con su área óptica igualada;
tocar `AREA` habría añadido margen transparente dentro del archivo, que no es
lo mismo: el blanco que sobraba era el de la casilla, no el del lienzo.

**El tope por abajo lo pone la línea pequeña de los logotipos apilados**, no el
gusto. Un aval se mira de refilón: tiene que reconocerse, no imponerse; pero si
su segunda línea deja de leerse, el bloque ya no dice quién avala.

### Dos comprobaciones que se pusieron rojas solas al llegar los logotipos

Las dos eran fallos de la prueba, no del sitio, y las dos son de manual:

- **Medir si una imagen «de verdad se pinta» NO se puede hacer en el
  navegador.** La comprobación de casillas vacías miraba `naturalWidth`, que
  vale 0 mientras la imagen no se haya cargado; los logotipos van en carga
  diferida y este equipo no la dispara. El día que los huecos estrenaron
  logotipo denunció cuatro casillas vacías que se ven perfectamente. Ahora el
  navegador devuelve solo la DIRECCIÓN de cada imagen y **quien la mide es
  Node**, descargándola y leyendo la cabecera del PNG o del WebP. Es la misma
  advertencia que ya estaba escrita para los fondos, incumplida en el archivo
  de al lado.
- **Una expresión regular con una ventana de N caracteres es una bomba de
  relojería.** La que comprobaba que el control pide `contener` buscaba
  `data-ajuste` dentro de los 800 caracteres siguientes al nombre del campo. Al
  crecer el desplegable de huecos la distancia pasó a 1101 y se puso roja sin
  que nada estuviera mal. Se busca dentro del CAMPO —hasta donde empieza el
  siguiente—, no a tantos caracteres.

### El panel sabe CONTENER, además de cubrir

`redimensionar()` escalaba siempre con `Math.max`: cubre el lienzo y recorta el
lado largo. A una fotografía le sienta bien; **a un logotipo le corta letras**.

Un campo de imagen puede declarar `ajuste: 'contener'`, que usa `Math.min` y
deja transparente lo que sobra. El lienzo nace transparente y WebP guarda el
canal alfa, así que el logotipo llega sin fondo y sirve sobre cualquier color.

**Las dos mitades hacen falta**: el sitio pinta con `object-contain`, pero si
el archivo ya llegara recortado no habría nada que hacer.

### Sin la figura, la franja encoge mucho en móvil

De 1040 a 721 px a 390, y de 1173 a 592 a 768. No es un fallo: la figura
ocupaba más de la mitad del alto apilado.

## «Nuestros clientes» cierra la portada, y por eso ya no hay botón final

Petición del cliente (17-11-2026). Ver `specs/009-nuestros-clientes/`.

La franja de cierre —«¿Evaluamos su caso sin costo?»— se sustituye por una tira
horizontal con los logotipos de los clientes del bufete. Migración `019`.

### Lo que se perdió, y se perdió a sabiendas

La franja que se apaga era **el último botón de la portada**: lo último que
veía un visitante antes del pie era «Agendar consulta» y el teléfono. Después
del bloque del perito **ya no queda ninguna acción** hasta el pie.

Se expuso con tres salidas —conservar el botón debajo de los logotipos,
quitarlo, o añadir la franja nueva sin tocar la vieja— y **el cliente eligió
quitarlo**. Queda escrito porque es justo el tipo de decisión que alguien lee
dentro de un año y «arregla» sin saber que se tomó.

El Sticky CTA de móvil y la burbuja de WhatsApp de escritorio siguen en pie, así
que la portada no se queda sin vía de contacto; lo que desapareció es el cierre
explícito. Volver atrás es un clic en `/panel/bloques`: el bloque sigue en la
base con su texto.

### Los siete logotipos salen de la web anterior, y vinieron con dos problemas

`docs/contenido-wordpress/imagenes/`, 210×150, PNG, **tinta blanca sobre
transparente**. `Cliente_ofies_1.png` y `Cliente_ofies_1-1.png` son el mismo
archivo: entra uno.

**Que la tinta sea blanca es la suerte del encargo.** La franja es navy, así
que entran **sin recolorear una sola marca ajena** —lo que en los avales del
perito obligó a inventar la pastilla clara—. Por eso aquí **no hay pastilla**:
sería decorar un problema que no existe, y partiría en siete cajas una tira
que se lee mejor seguida.

**Problema 1 — el velo.** Los originales no son transparentes del todo: llevan
blanco a **alfa ≈ 38** cubriendo entre el 74 % y el 96 % del rectángulo. Sobre
navy eso no se ve como «nada», se ve como un **recuadro pálido detrás de cada
marca**.

Lo quita `herramientas/preparar-logos-clientes.mjs` **reescalando el canal
alfa**, no con un umbral duro. El suelo se **mide en el borde del lienzo**
—que es fondo seguro— en vez de fijarlo a mano: los siete dieron 38, pero
basta con que llegue un octavo archivo con otro velo para que un número
escrito a mano deje de valer. Un umbral duro (`a < 64 → 0`) se comería la
rampa de los bordes de cada letra y el logotipo saldría dentado, que en una
marca ajena con tipografía fina se nota a simple vista.

**Problema 2 — la proporción.** El abanico va de **1,00** (Cámara de Comercio
de Tuluá, casi cuadrada) a **3,94** (Dixtrital, una tira). Es más abierto que
el de los avales del perito (1,38–2,90), donde ya hizo falta igualar por área
óptica. Contenidos a secas en el mismo lienzo, la Cámara tocaría el techo
antes de crecer y se vería la mitad que sus vecinas.

La herramienta coloca cada uno con la **misma área óptica** (23 000 px² sobre
un lienzo de 320×160). **23 000 no es un número redondo y no puede serlo:** con
el margen del 4 % el hueco útil es 307×154, así que la pieza cuadrada pide
`√A ≤ 154` → `A ≤ 23 716`, y la más apaisada `√(A·3,94) ≤ 307` → `A ≤ 23 925`.
**El tope lo marca la CUADRADA, no la apaisada**, que es lo contrario de lo que
se supondría mirando la tabla.

#### El área se iguala sobre la TINTA, no sobre el halo

Este es el fallo que más tardó en verse, y lo vio el cliente: *«hay unos que se
ven más grandes que otros»*.

Las marcas llevan un **resplandor suave** alrededor que sobrevive a la limpieza
del velo. El recorte era un `trim({ threshold: 1 })`, que se queda con todo lo
que no sea alfa cero —halo incluido—, así que el área óptica se igualaba
**sobre el halo**. Medido en los archivos ya publicados:

| | Dispersión entre los siete |
|---|---|
| Caja con halo (lo que se igualaba) | ×1,01 — aparentemente perfecto |
| **Tinta real** (alfa ≥ 128) | **×2,23 en área, ×2,86 en altura** |

Carmelita salía al **142 %** de la media y Dixtrital al **64 %**. La
normalización parecía correcta en los números de la herramienta y era falsa en
la página.

Ahora la caja se calcula sobre el **alfa sólido** (`UMBRAL_TINTA = 128`) con
tres píxeles de sangrado para no cortar el antialiasing del borde. Resultado
medido: **94 %–106 %** de la media, dispersión ×1,13.

**La altura sigue variando, y está bien.** Igualar el área significa que una
marca cuadrada queda más alta y estrecha y una apaisada más baja y ancha:
`140×139` la Cámara de Comercio frente a `272×68` Dixtrital. Eso **no es un
defecto, es lo que hace que pesen lo mismo**. Igualar la altura haría que
Dixtrital —cuatro veces más ancha que alta— dominara la fila; igualar el
ancho haría gigante a la Cámara. Si alguien vuelve a pedir «que midan todos
lo mismo», lo que hay que mirar es el área, no la caja.

**No bajar `UMBRAL_TINTA` a 64**: ahí vuelve a entrar parte del resplandor y la
igualación se desvía otra vez.

El lienzo es **320×160, el mismo que los avales del perito**, y a propósito: son
dos tiras de logotipos ajenos con el mismo problema, así que comparten la forma
de prepararlos y el desplegable de huecos del panel, que solo ofrece huecos de
la **misma medida sugerida**.

### La cinta se mueve sola, y SIN JavaScript

Petición del cliente (17-11-2026): que los logotipos se desplacen *«de
izquierda a derecha, como una cinta»*. **Va hacia la derecha**: entran por la
izquierda y salen por la derecha, que es lo que se pidió literalmente. Darle la
vuelta es cambiar `from` por `to` en el `@keyframes`.

El sitio público envía **0 KB de JavaScript** y un carrusel de logotipos no es
motivo para romperlo: la misma decisión que se tomó con el carrusel de la
cabecera. Comprobado después: `dist/` sigue sin un solo archivo `.js`.

**El truco es repetir el grupo TRES veces y desplazar la pista exactamente un
tercio.** Al final del ciclo, lo que se ve es idéntico a lo que se veía al
empezar, así que el salto del reinicio no existe.

Dos cosas que parecen detalles y son la pieza entera:

- **El hueco va en el `margin-inline-end` de cada marca, NO en un `gap` de la
  lista.** Con `gap`, siete marcas dejan seis huecos dentro del grupo y uno
  más entre grupos: los tres tercios dejan de medir lo mismo y en cada vuelta
  se ve un salto. Con el margen, cada marca ocupa siempre `ancho + hueco` y el
  tercio cuadra al píxel. Lo vigila `clientes.test.mjs`.
- **Tres copias, no dos.** La pista tiene que ser más ancha que la pantalla
  **más un grupo entero**, o al final del ciclo asoma un hueco por la derecha.
  Medido a once anchos: la holgura más ajustada es de 1104 px.

**Las propiedades de la animación van LARGAS, nunca la forma corta
`animation:`.** La corta reinicia todas las subpropiedades, incluida
`animation-play-state: running`, así que el congelado al pasar el ratón no
haría nada. Ya pasó en el carrusel de la cabecera.

**La duración cambia por tramo para que la VELOCIDAD no cambie.** El recorrido
de una vuelta es el ancho de un grupo, y ese ancho va de 756 px en un teléfono
a 1512 en un monitor ancho: con una duración única, la cinta iría al doble de
rápido en escritorio. Las cifras (21 s / 30 s / 36 s / 42 s) salen de dividir
cada recorrido entre ~36 px/s. Medido en la página: **36, 37 y 36 px/s** a
1920, 1280 y 390 px.

**Los extremos se desvanecen** con una `mask-image`. Sin eso las marcas
aparecen y desaparecen de golpe contra el borde, que es lo que delata que hay
un recorte en vez de una cinta que sigue más allá.

#### Esto añade una segunda deuda de WCAG 2.2.2

La **WCAG 2.2.2** pide un mecanismo para parar cualquier cosa que se mueva
sola más de cinco segundos. Esta cinta lo es, y **no lleva un control
rotulado**, igual que el carrusel de la cabecera. Es deuda consciente, no un
olvido, y ahora el sitio tiene **dos** sitios así.

Lo que sí cumple esa función:

| Mecanismo | Qué hace | Límite |
|---|---|---|
| `prefers-reduced-motion: reduce` | **Apaga la cinta del todo** y devuelve la fila estática | Solo si está configurado en el sistema |
| Pasar el ratón o entrar el foco | Congela mientras tanto | No es una parada, y no sirve con el dedo |

**Si hay que volver a cumplirlo**, el patrón es el que tenía la cabecera: una
casilla —sin JavaScript solo un `:checked` recuerda un estado— con una regla
de `animation-play-state: paused`.

**Con «menos movimiento» la cinta no se ralentiza: se APAGA**, y hay que
deshacer tres cosas a la vez, las tres necesarias: `width: auto` o la pista
sigue midiendo `max-content` y desborda; ocultar las copias o se verían
veintiuna marcas; y `flex-wrap` o las siete no caben en pantallas estrechas.
Comprobado: a 1280 y a 390 queda un solo grupo de siete, sin desbordar.

#### Lo que la cinta se llevó por delante

Antes la franja repartía las marcas en filas según el ancho, con topes
calculados para que no quedara ninguna suelta. **Eso ya no existe**: una cinta
es una fila continua. Los topes sobreviven únicamente dentro del bloque de
`prefers-reduced-motion`, que es donde vuelve a haber filas.

De regalo, el teléfono ganó mucho: la franja pasa de **294 a 170 px** de alto,
porque desaparece el apilado en 3 + 3 + 1.

El reparto por filas era, hasta la cinta:

| Ancho | Marcas por fila | Alto del lienzo |
|---|---|---|
| 1536 px y más | **7** | 88 px |
| 1280–1535 px | **7** | 78 px |
| 1024–1279 px | **7** | 60 px |
| 640–1023 px | 4 + 3 | 64 px |
| menos de 640 px | 3 + 3 + 1 | 46 px |

Los tamaños se subieron dos veces el 17-11-2026 a petición del cliente, y
están **al límite de lo que cabe**, no elegidos a ojo.

**La tira vive FUERA del `.contenedor` de los textos, y tiene el suyo**
(`max-w-[90rem]`). Esa es la segunda subida: `.contenedor` topa en
`max-w-6xl` (1152 px) y gasta 48 en margen interior, así que dejaba 1104 para
la fila y 144 px de ancho por marca como techo absoluto. Un titular sí tiene
que alinearse con el resto de la portada; **una fila de logotipos no**, es una
cinta. Con su propio contenedor el logotipo pasa de 72 a **88 px** a partir de
1536 px, un 22 % más. El rótulo y el titular siguen dentro del contenedor de
siempre, centrados.

Siete logotipos en los ~343 px de un teléfono salen a 48 px cada uno y no se
reconoce ninguno: es el mismo límite que se cruzó en los avales del perito,
aquí con siete piezas en vez de cinco.

- **El tope de ancho de la lista decide CUÁNTOS caen por fila**, y por eso
  existe. Sin él, flex llena de forma codiciosa y salían **6+1 a 1024 px y 5+2
  a 768**: un logotipo suelto debajo de seis parece un error de maquetación,
  no una fila. Cada tope es `N × ancho + (N−1) × hueco`, con el ancho = 2 × el
  alto, porque el lienzo es 2:1.
- **El techo NO es el ancho del `.contenedor`: es su ancho de CONTENIDO.** El
  contenedor topa en **1152 px** por mucho que crezca la pantalla, pero lleva
  24 px de margen interior a cada lado, así que para la lista quedan **1104**.
  Al agrandar los logotipos se calculó sobre 1152 y la fila se pasó por 28 px:
  rompió en **6+1** a partir de 1280, y lo mismo a 1024 y a 360. Con hueco de
  1 rem, el máximo absoluto para siete en fila es `7w + 96 ≤ 1104`, o sea
  **144 × 72 px**. De ahí no se puede subir sin romper la fila.
- **El tramo de 1280 px no es estético.** A 1024 la fila entra justa; mantener
  ese tope en pantallas anchas dejaba la tira encogida en mitad de la franja,
  con aire de sobra a los lados.
- **A 390 y 360 px queda una marca sola en la tercera fila.** Es el precio de
  tener **siete**, que no se reparte bien: con tres por fila salen 3+3+1 y con
  cuatro no caben. Forzar 4+3 exigiría bajar el lienzo a 32 px, y ahí la línea
  pequeña de Dixtrital o de Redes IMAT deja de leerse. Se prefirió el hueco a
  la ilegibilidad.
- **El CSS limita el alto del LIENZO, no el del logotipo.** Si volviera a
  ajustar cada imagen a su caja desharía la normalización por área.

### Sin rótulo, y con menos aire que el resto de la portada

`py-8 lg:py-10` frente a los `py-20 lg:py-28` de una sección normal. Petición
del cliente (17-11-2026), y el argumento es suyo: el rótulo «Confían en
nosotros» decía lo mismo que el titular «Nuestros clientes», así que sobraba,
y sin él la franja no necesita el colchón de una sección con texto. Un muro de
logotipos no se lee, se reconoce de un vistazo. Medido: la sección bajó de
**301 a 217 px** en escritorio y de **364 a 296 px** en móvil.

**El rótulo no se borró del registro, se vació.** El campo sigue ahí: el día
que alguien quiera uno distinto lo escribe en el panel y vuelve a salir, con su
separación, sin tocar código. Y el titular solo lleva margen superior **si hay
rótulo encima**; si no, ese margen era un hueco que no separaba nada.

Es la **segunda excepción al ritmo de la portada**, después del bloque de redes
sociales. Si algún día se repasa el espaciado general, ninguna de las dos es la
referencia.

### Las claves de los huecos van NUMERADAS

`cliente-1` … `cliente-7`, no `cliente-dolormed`. Un hueco es un sitio, no una
marca: el día que el bufete cambie de cliente se sustituye la foto desde el
panel y la clave sigue valiendo. Con el nombre dentro habría que tocar la base
para algo que es puro contenido.

**Cada cliente lleva su NOMBRE, y es obligatorio.** Es el texto alternativo y
es el respaldo cuando falta el archivo: sin logotipo se pinta el nombre. Lo
vigila `clientes.test.mjs`.

**Son marcas de terceros.** Se publican porque el cliente las entregó y las
usaba en su web anterior. Si alguna entidad pide retirar la suya, se quita
desde el panel sin tocar código.

### Un bloque nuevo en el registro obliga a REINICIAR la API

`muroClientes` se añadió a `frontend/src/bloques/registro.js`, que el backend
**importa tal cual**. La API lo tenía cargado en memoria de antes, así que
guardar ese bloque desde el panel respondía **409 «El bloque es de un tipo que
ya no existe»**, que suena a dato corrupto y no lo es. El sitio compilado sí lo
pintaba, porque `astro build` lee el registro cada vez.

Pasa con cualquier tipo nuevo. **Si un bloque recién registrado da 409 al
guardar, lo primero es reiniciar la API**, no buscar el fallo en el saneado.

## El bloque de redes sociales rompe los 0 KB de JavaScript

Y es a propósito. Ver `specs/006-redes-sociales/`.

El sitio no envía una sola línea de JS al visitante; es un principio, no una
casualidad. El embed de TikTok y el Page Plugin de Facebook cargan scripts de
terceros, así que este bloque lo paga. Es deuda consciente, como la del botón
de pausa del carrusel, con dos condiciones que la hacen tolerable:

- **Se paga SOLO donde se usa.** Los scripts se piden desde el componente y
  solo si la red está configurada. Comprobado: con las URLs vacías, la portada
  compilada vuelve a tener **0 archivos JavaScript**.
- **Nada bloquea el renderizado:** marcos en `loading="lazy"`, scripts en
  `defer`. El LCP lo sigue decidiendo la foto de la cabecera.

**Si algún día pesa, la salida es cambiar TikTok a vídeos elegidos a mano**,
que no lleva JavaScript. No hay que rediseñar el bloque para eso.

### TikTok se actualiza solo con el embed de PERFIL, no con la API

El embed de perfil de creador enseña hasta los diez vídeos más recientes, así
que publicar uno nuevo lo trae a la portada sin tocar el panel. Se saca del
propio TikTok (*Compartir* → *Insertar* en el perfil): **sin clave de API, sin
cuota y sin solicitud**.

La Display API (`/v2/video/list/`) hace lo mismo a cambio de Login Kit,
revisión de la app por TikTok, OAuth del titular de la cuenta y una auditoría
para pasar a producción. Para una franja de una portada no compensa, y
obligaría a guardar y renovar el token de la cuenta de un tercero.

### El botón de «Me gusta» de Facebook ya no existe

Meta lo descontinuó junto con el de comentarios el **10 de febrero de 2026**;
lo que quede se convierte en un elemento invisible. Sobrevive el *Page Plugin*,
que enseña la tarjeta de la página y permite seguirla, pero **la documentación
de Meta ya no describe un contador total**: solo la hilera de caras de los
amigos del visitante. Por eso el bloque promete «ver y seguir la fanpage», no
«ver el número».

La **versión del SDK va explícita** en la URL: Meta retira versiones con el
tiempo (la v20.0 en septiembre de 2026, la v21.0 en enero de 2027) y una
caducada deja de cargar sin error visible.

### Cada incrustación lleva un enlace normal debajo

No es adorno. Quien bloquea scripts de terceros —extensiones, redes
corporativas, navegadores estrictos— no vería nada y el bloque dejaría un hueco
en medio de la portada. Con el enlace sigue sirviendo para lo que se puso.

### Esta franja respira MENOS que las demás, a propósito

`py-6 lg:py-8` (1,5rem y 2rem) frente a los `py-20 lg:py-28` (5rem y 7rem) del
resto: el **30 % del habitual**, pedido por el cliente el 12-11-2026. Medido en
la página: 112px → 32px en escritorio y 80px → 24px en móvil.

Es una excepción al ritmo de la portada, no un descuido. El bloque ya trae su
propio aire dentro de cada incrustación, así que el colchón exterior sobraba.
**Si algún día se repasa el espaciado de la página entera, esta sección no es
la referencia.**

### Las tres URLs se editan en el PANEL, y eso tiene un precio

Nacieron repartidas: los perfiles en `src/data/contacto.js` —fuente única, de
donde los lee también la barra superior— y solo el vídeo en el bloque. El
argumento era bueno y sigue siéndolo: un perfil no cambia nunca, y dos listas de
redes acaban discrepando igual que discrepaba el NAP.

**Se cambió el 11-11-2026 a petición del cliente**, sabiendo lo que se compra y
lo que se paga. Lo que pesó: con los perfiles en código, el titular del bufete
no puede pegar su propio TikTok sin que un programador toque el repositorio, y
eso convierte un cambio de dos minutos en una tarea de otro.

**El agujero que se abre es el del NAP incoherente**, el mismo que el proyecto
ya cerró una vez con el teléfono y la dirección. Se mitiga así, y no conviene
aflojarlo:

- **`contacto.js` queda como RESERVA, no como segunda lista.** El componente usa
  lo del bloque y solo cae a `contacto.js` si el campo está vacío. Hay una sola
  respuesta a «¿cuál es el TikTok del bufete?»: la del bloque, si la hay.
- **La barra superior sigue leyendo `contacto.js`**, así que mientras los campos
  del bloque estén puestos y `contacto.js` vacío, sus iconos no se pintan.
  Cerrarlo del todo es llevar los datos de contacto a la base y que el sitio los
  consulte al compilar. **Está sin hacer**, y es la deuda que deja esta
  decisión.

### El marco reserva su alto, o la fila se descuadra

Cada incrustación lleva debajo un enlace normal, que es lo que sostiene el
bloque cuando los scripts de terceros no cargan. **No basta.**

Medido en una máquina cuya red filtra `tiktok.com` y `connect.facebook.net`:
sin la reserva, el marco de TikTok se queda en **28 px** —la altura de su
enlace— al lado de un vídeo de 362, y la portada parece rota aunque todos los
enlaces estén ahí. La clase `.reserva-red` le da un alto mínimo y un recuadro
discontinuo mientras no llegue la pieza real.

- **Las alturas van en CLASES, nunca en un `style` en línea.** Un atributo
  `style` gana a cualquier regla de la hoja, así que el `min-height: 0` que
  retira la reserva no se aplicaría nunca y el hueco seguiría empujando la
  incrustación ya cargada.
- **No se usa `:empty` para detectar que cargó.** TikTok y Meta **reemplazan**
  el contenido del nodo, no lo vacían. Se mira el rastro que deja cada uno:
  `data-tiktok-embed-processed` en el blockquote, y un `<iframe>` hijo en el
  `.fb-page`.

### Un error de consola de un tercero no es un fallo del sitio

Dos suites daban por sucia la consola por fallos de carga de `tiktok.com` y
`connect.facebook.net`, que esta red filtra. Eran **falsos rojos**, y de los
peores: dependían de qué página tuviera abierta el Chrome compartido, porque
`Log.enable` reproduce lo que ya había en el registro.

- `imagenes.test.mjs` se queda solo con los errores **del panel**.
- `fondos.test.mjs` mira el panel y el sitio, así que descarta los errores de
  **origen ajeno** y conserva los de `localhost` y los que no traen URL —una
  excepción de un guion en línea casi siempre es nuestra—.

Contarlos convertiría la comprobación en un termómetro de la red de quien
ejecuta las pruebas. Para eso está el enlace de respaldo debajo de cada
incrustación.

### Las pruebas no dan por puesto ningún archivo suelto

`fondos.test.mjs` leía `$TMPDIR/fondo-prueba.png`, un archivo que **ninguna
parte del proyecto crea**. Pasaba en la máquina donde alguien lo había dejado a
mano y reventaba con `ENOENT` en cualquier otra, dentro del `try` y antes de
comprobar nada. Ahora la suite **genera** el PNG con `herramientas/png.mjs`.
`FOTO` sigue sirviendo para apuntar a una foto real cuando se quiera mirar.

Este proyecto se trabaja en dos equipos: una prueba que depende de un archivo
suelto no viaja.

### Una URL es texto que acaba dentro de un `src`

Mismo agujero que los colores. El tipo `url` del registro valida con **lista de
dominios permitidos** y **devuelve una dirección reconstruida por nosotros**:
nunca se reenvía al `<iframe>` lo que escribió el editor, aunque haya pasado la
comprobación. De paso se tira la basura de sesión (`?si=`, `fbclid`…), igual
que se hizo con el enlace de Google Maps.

El vídeo de YouTube se sirve desde **`youtube-nocookie.com`**, armando la URL a
partir del id.

### El bloque al que sustituye se OCULTA, no se borra

`cifrasYPreguntas` guarda las respuestas a «¿cuánto cuesta la primera consulta?»
y «¿cómo se acuerdan los honorarios?»: justo las dudas que frenan a alguien
antes de llamar a un abogado, y texto que posiciona en buscadores. La migración
`012` lo apaga y pone el bloque nuevo **en su mismo orden**, para no romper la
alternancia claro/oscuro de la portada.

## Poner el proyecto en otra máquina

La guía paso a paso es `docs/puesta-en-marcha.md`. Lo que no se puede olvidar:

**`schema.sql` NO es la base de datos entera.** Solo crea `paginas`, `leads` y
`chat_logs`. Los bloques de la portada, el catálogo de imágenes, los usuarios
del panel, las sesiones y el registro de publicaciones viven en las migraciones
numeradas de `backend/db/`, y el contenedor no las aplica. El orden es
**esquema → semilla → migraciones**, y el tercer paso es `npm run db:migrar`.
Sin él, `astro build` falla pidiendo unos bloques que no existen.

El corredor (`backend/scripts/migrar.js`) lleva registro en
`migraciones_aplicadas` y **nunca repite una migración**: `003` inserta los
bloques de la portada y `009` copia colores dentro de cada lámina, así que
reejecutarlas duplica contenido o pisa lo que alguien editó desde el panel. Si
encuentra una base con las tablas puestas pero sin registro, las marca como
aplicadas **sin ejecutarlas** y lo dice; es lo único seguro que puede hacer.

**Los dos puertos del frontend no son intercambiables.** El `4321` es
`npm run dev`, para editar. El **`4340` es `npm run preview`**, el sitio ya
compilado, y es al que apuntan las herramientas de captura, el previsualizador
de fondos y las siete suites. Contra el servidor de desarrollo las medidas
salen mal —Vite inyecta los estilos por JavaScript y al medir aún no están
aplicados—, las láminas se ven apiladas y diez comprobaciones de maquetación
fallan sin que haya nada roto. Pasó al fijar los puertos: si aparecen fallos de
geometría en bloque, lo primero es mirar qué sirve el 4340.

**El 4340 se le pasa a `astro preview` por la línea de órdenes, en el guion de
`package.json`, y ahí tiene que quedarse.** Astro **no tiene una opción
`preview` de primer nivel**: `astro preview` usa el mismo `server.port` que el
servidor de desarrollo. Hubo una clave `preview: { port: 4340 }` en
`astro.config.mjs` que Astro **ignoraba en silencio**, y pareció funcionar
porque había un servidor del puerto correcto levantado de antes del cambio: las
siete suites dieron verde contra él. Un verde falso es peor que un rojo.

**Las suites de `.pruebas/` SÍ se versionan.** Estuvieron en `.gitignore` y eso
las dejaba fuera del repositorio: en otra máquina no había forma de verificar
nada. Son parte del proyecto, como el código que comprueban.

**Lanzar las siete seguidas agota el limitador de acceso** (ocho intentos cada
quince minutos, en memoria). Las últimas fallan con una redirección en vez de
con un error claro. Se arregla reiniciando la API.

**Lo que NO viaja por Git:** los `.env` y el contenido de la base. Las imágenes
del sitio sí van (`frontend/public/img/`), así que hay que confirmar y subir
después de sustituir fotos desde el panel. Para llevar el contenido de un
equipo a otro hay un volcado documentado en la guía; **ese volcado no se
versiona**, porque lleva los hashes de las contraseñas del panel.

## Convenciones del Proyecto
- **Idioma:** identificadores de dominio, columnas y mensajes al usuario en
  español. Palabras clave y APIs del lenguaje en inglés.
- **Capas del backend:** `routes → controllers → repositories`. Ningún
  controlador escribe SQL; ningún repositorio conoce `req` ni `res`.
- **SQL:** siempre consultas parametrizadas (`$1`). Nunca interpolación.
- **Mobile-First:** se diseña primero el ancho de 360px; los prefijos `sm:`
  y `md:` solo añaden, nunca corrigen.
- **Accesibilidad:** objetivo táctil mínimo de 44px y contraste AA (4.5:1).

## Restricciones Legales (Colombia)
- Ley 1581 de 2012 (Habeas Data): ningún lead se guarda sin
  `consentimiento_datos = TRUE`.
- El bot de triage **no da asesoría jurídica**: clasifica y recoge datos.
  Modificar `PROMPT_SISTEMA` sin revisar esta restricción es un riesgo legal.
