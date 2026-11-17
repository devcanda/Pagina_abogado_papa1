# Especificación — Entidades que certifican el peritaje

> **Nota de proceso.** Esta spec se escribió DESPUÉS de implementar, y eso
> incumple la regla 2 del proyecto. Queda anotado porque disimularlo sería
> peor: el orden existe para que las decisiones se tomen antes y no se
> justifiquen después.

## Qué se pide

El servicio de avalúo se respalda con el aval de otras entidades. La franja del
perito tiene que enseñar los **logotipos de cinco entidades certificadoras**.

Petición del cliente, 12-11-2026. Los logotipos los entrega él; lo que se pide
primero es **la estructura y el espacio**, para poder valorar cómo queda.

## Dónde van, y por qué no en la columna de texto

Medido en la página: la columna de texto va del 52 % al 98 % del ancho, o sea
el 46 %. Cinco logotipos ahí salen a unos **80 px** cada uno y no se lee
ninguno.

La franja va **a lo ancho de la sección, bajo las dos columnas**, separada por
un filete. Ahí caben a **220 px**. En móvil baja a dos columnas (2+2+1).

## Cada logotipo lleva su NOMBRE, y no es un detalle

El nombre es el texto alternativo. Un sello sin nombre es una imagen que un
lector de pantalla no puede anunciar, y lo que aporta este bloque es
precisamente **quién avala**.

Además resuelve el encargo de hoy: **mientras no haya logotipo, la casilla
pinta el nombre**. La estructura se ve desde el primer día sin inventar
imágenes falsas, y el día de mañana una entidad sin logotipo deja su nombre en
vez de un cuadro vacío.

## Dos decisiones que no son de gusto

**Casilla clara detrás de cada logotipo.** La franja es navy y los logotipos
son marcas ajenas: casi todos vienen pensados para fondo blanco y tinta
oscura. Sobre navy desaparecerían. La alternativa —recolorearlos— **no está
sobre la mesa**: una marca ajena no se toca, igual que no se toca la del
cliente.

**El logotipo se CONTIENE, no se recorta.** El panel reduce con `cover`, que
corta el lado largo. A una fotografía le sienta bien; a un logotipo le corta
letras. Hace falta un ajuste nuevo en el panel.

## Criterios de aceptación

1. Sale una casilla por entidad declarada, ni una más.
2. Una entidad sin logotipo enseña su nombre; no queda hueco roto.
3. Todo logotipo tiene texto alternativo.
4. El logotipo cabe entero en su casilla, sin recorte ni deformación.
5. En móvil la fila se reparte en dos columnas sin desbordar.
6. El rótulo de la franja **no va en rojo** (ver `plan.md`).

## Lo que NO entra

- Los logotipos. Los entrega el cliente.
- Los nombres reales de las entidades: los cinco que hay son **provisionales**
  y hay que sustituirlos antes de publicar en el hosting.

## Cómo quedó (12-11-2026, misma tarde)

El cliente entregó los cinco logotipos y los cinco nombres el mismo día.
Entraron **cuatro** a la primera: ARAV, RAA, Lonja de Colombia y Delta Force.

**Aeronáutica Civil se quedó fuera**, y el criterio de aceptación 2 es justo lo
que lo salvó: enseñó su nombre. El archivo entregado era la versión en NEGATIVO
—63 % de tinta blanca, 33 % navy `#082858`—, que da 1,03:1 sobre la superficie
clara y 1,08:1 sobre navy. Ningún color de casilla lo rescata, y recolorear una
marca ajena era precisamente lo que esta spec dejó fuera de la mesa. El cliente
entregó la versión positiva el mismo día y ya está puesta.

**Lo que no previó esta spec fueron dos cosas, y las dos las vio el cliente:**

1. **Cinco casillas blancas sueltas leen como parches**, no como una fila de
   avales. La spec razonó bien el fondo claro —que no es negociable— y no dijo
   nada de la forma, que sí lo era. Ahora es un solo panel con filetes finos.
2. **Un logotipo apilado entre cuatro apaisados se ve más pequeño.** Con todos
   contenidos en el mismo lienzo, el de Aeronáutica Civil tocaba el techo antes
   de crecer. Se igualan por **área óptica**, no por altura. Ver `AGENTS.md`.

## Un tercer ajuste, el 13-11-2026

Los sellos se veían **demasiado grandes**. Lo que los agrandaba no era solo el
logotipo: era la casilla. Se bajaron las dos cosas a la vez manteniendo su
proporción —lienzo servido 160×80 → 128×64 y casilla 220×136 → 220×104 en
escritorio; 112×56 → 88×44 y 179×96 → 179×76 en móvil—, sin tocar los archivos.

El criterio sigue siendo el 4: el logotipo cabe entero, sin recorte ni
deformación. El tope por abajo lo pone la línea pequeña de los logotipos
apilados.

## La superficie clara cayó el mismo día (13-11-2026)

El cliente pidió una **cinta minimalista de avales** y quitar el fondo blanco.
Esta spec había dejado la superficie clara fuera de discusión —«recolorearlos
no está sobre la mesa»—, así que el cambio **deroga esa decisión**, y conviene
que quede escrito por qué se pudo.

El argumento de entonces seguía siendo cierto: en color sobre navy, el
logotipo de Aeronáutica Civil da **1,08:1** y desaparece. Lo que había era una
disyuntiva, no una prohibición: **caja clara o monocromo**. La spec solo
consideró la primera salida.

Elegida la segunda, el recoloreado deja de ser un daño evitable y pasa a ser
el precio de la cinta. Lo paga el cliente, que lo pidió sabiéndolo.

**Lo que sí era un error de ejecución y se corrigió:** aplastar los logotipos
a blanco plano (`brightness(0) invert(1)`) convierte en silueta todo lo que
dependía del color —la «A» de Aeronáutica Civil dentro de su círculo—.
Invirtiendo el gris se conserva el dibujo.

El criterio de aceptación 2 (una entidad sin logotipo enseña su nombre) sigue
valiendo: el nombre de respaldo pasó a `marino-100`, porque ya no cae sobre
blanco.

Medido sobre la foto publicada: **6,99:1 en escritorio, 5,95:1 en móvil**.

## Y vuelve la superficie clara, dentro de la columna (13-11-2026)

La cinta monocroma duró unas horas. El cliente pidió tres cosas a la vez:
**alinear la franja bajo el bloque de texto**, **agrandar los logotipos** y
**devolverles un fondo claro** —«un círculo u óvalo»— en vez de perder su
color contra el fondo.

Las tres se resuelven con la misma pieza: una **pastilla por sello**, todas de
160×80, dentro de la columna de texto.

**Esto deroga la razón que daba esta spec para sacar la franja de la
columna.** El argumento era que ahí solo hay el 46 % del ancho y cinco
logotipos salen a 80 px. Era cierto **para una fila única**. Envueltos en 3 + 2,
cada sello dispone de 160 px: el doble que entonces, y más que en la cinta
monocroma que iba a lo ancho.

**La simetría sale de la pastilla, no del logotipo.** Son dos normalizaciones
encadenadas: el área óptica iguala el peso de cada marca dentro de su lienzo,
y la pastilla iguala el marco. Quitar cualquiera de las dos devuelve la fila
desigual.

Criterios 1 a 5, sin cambios. El 4 —cabe entero, sin recorte ni deformación—
sigue siendo lo que fija el tamaño: la pastilla es 2:1 como el lienzo, así que
el logotipo centra solo.

