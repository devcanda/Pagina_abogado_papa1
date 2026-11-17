# Especificación — «Nuestros clientes»

Petición del cliente, 17-11-2026.

## Qué se pide

Convertir la franja de cierre de la portada —hoy «¿Evaluamos su caso sin
costo?»— en una franja **«Nuestros clientes»** con los logotipos de los
clientes del bufete **en horizontal**, como se estila en las páginas
corporativas.

Los logotipos salen de los recursos de la web anterior
(`docs/contenido-wordpress/imagenes/`), que es material del propio cliente.

## La llamada a la acción final DESAPARECE, y es una decisión tomada

La franja que se sustituye es **el último botón de la portada**: lo último que
ve un visitante antes del pie es «Agendar consulta» y el teléfono.

Se expuso que convertirla deja la portada sin cierre de conversión, con tres
salidas sobre la mesa —conservar el botón debajo de los logotipos, quitarlo, o
añadir la franja nueva sin tocar la vieja—. **El cliente eligió quitarlo**
(«solo los logos»).

Queda escrito porque es el tipo de cosa que alguien lee dentro de un año y
«arregla» sin saber que se decidió:

- Después del bloque del perito **no queda ninguna acción** hasta el pie. El
  Sticky CTA de móvil y la burbuja de WhatsApp de escritorio siguen ahí, así
  que la portada no se queda sin ninguna vía de contacto; lo que se pierde es
  el cierre explícito.
- El contenido de la franja anterior **no se borra**: el bloque se apaga con
  `visible = FALSE`, igual que `cifrasYPreguntas` y «Casos resueltos».
  Volver a encenderlo es un clic.

## Los ocho archivos son siete clientes, y vienen con dos problemas

Medido sobre los originales (`210×150`, PNG, tinta **blanca** sobre
transparente):

| Cliente | Caja de tinta | Proporción |
|---|---|---|
| Cámara de Comercio de Tuluá | 117×117 | 1,00 |
| Carmelita (Trujillo-Valle) | 133×118 | 1,13 |
| Distribuidora OFT Escolar | 139×74 | 1,88 |
| Redes IMAT (Clínica de Fracturas S.A.S.) | 143×68 | 2,10 |
| DolorMed | 142×47 | 3,02 |
| Tradex | 161×44 | 3,66 |
| Dixtrital Mega Store | 142×36 | 3,94 |

`Cliente_ofies_1.png` y `Cliente_ofies_1-1.png` son **el mismo archivo**: entra
uno.

**Problema 1 — el velo.** Los originales no son transparentes del todo: el
fondo lleva blanco a **alfa ≈ 38** cubriendo entre el 74 % y el 96 % del
rectángulo. Sobre el navy de la franja eso no se ve como «nada», se ve como un
**recuadro pálido detrás de cada marca**. Hay que limpiarlo antes de servirlos.

**Problema 2 — la proporción.** El abanico va de **1,00 a 3,94**: más abierto
que el de los avales del perito (1,38–2,90), donde ya hubo que igualar por
área óptica. Contenidos en un mismo lienzo, la Cámara de Comercio tocaría el
techo antes de crecer a lo ancho y Dixtrital se vería el doble de grande.

Que la tinta sea **blanca** es la suerte del encargo: la franja es navy, así
que los logotipos entran **sin recolorear una sola marca ajena**, que es
justamente lo que este proyecto no se permite.

## Decisiones

**D1 — Igualar por ÁREA ÓPTICA, no por altura.** Es la misma regla que los
avales del perito y por el mismo motivo, agravado: con proporciones de 1,00 a
3,94, igualar la altura haría que Dixtrital pesara cuatro veces más que la
Cámara de Comercio.

**D2 — Cada logotipo lleva su NOMBRE, obligatorio.** Es el texto alternativo y
es el respaldo cuando falta el archivo. Un muro de clientes que un lector de
pantalla no puede anunciar no dice quién confía en el bufete.

**D3 — Se preparan con una herramienta del repositorio**, no se suben crudos
ni se arreglan a mano. El velo y el área óptica son aritmética, y el día que
llegue un octavo cliente tiene que salir igual sin que nadie se acuerde de los
números.

**D4 — Una fila en escritorio; en el teléfono se envuelve.** Siete logotipos en
los ~350 px de un móvil salen a 48 px cada uno y no se reconoce ninguno. Es el
mismo límite que se cruzó en los avales del perito, y aquí con siete piezas en
vez de cinco. La fila única se respeta donde cabe.

**D5 — La franja sigue siendo OSCURA.** No es una elección estética: la tinta
de los siete logotipos es blanca y sobre fondo claro desaparecerían.

## Criterios de aceptación

1. Sale un logotipo por cliente declarado, ni uno más.
2. Un cliente sin logotipo enseña su nombre; no queda hueco roto.
3. Todo logotipo tiene texto alternativo.
4. Ningún logotipo se recorta ni se deforma.
5. Los siete pesan ópticamente lo mismo pese a ir de 1,00 a 3,94.
6. No queda rastro del velo: ningún recuadro pálido detrás de las marcas.
7. En escritorio van en una sola fila horizontal; en móvil se envuelven sin
   desbordar.
8. El bloque sustituido queda apagado, no borrado.

## Lo que NO entra

- Enlaces a los sitios de los clientes: no se han pedido y no los tenemos.
- Un carrusel automático de logotipos. El proyecto envía 0 KB de JavaScript al
  visitante y un muro de siete piezas cabe entero sin moverse.
- Permiso de uso de marca. **Son logotipos de terceros**: se publican porque
  el cliente los entregó y los usaba en su web anterior. Si alguna entidad
  pide retirarlo, se quita del panel sin tocar código.
