# Especificación Funcional (Spec)

## 013 · Las seis fichas de áreas abren una descripción, no una página

### Objetivo

Las seis tarjetas de «Áreas de práctica» de la portada llevan hoy a
`/areas/derecho-laboral/`, `-civil/`, `-familia/`, `-penal/`,
`-inmobiliario/` y `-administrativo/`. **Ninguna de esas seis páginas
existe**, así que las seis dan 404.

En vez de crear seis páginas, la ficha **se abre sobre sí misma** y enseña una
descripción breve del servicio y un botón **«Consultar ahora»** que lleva a
WhatsApp con el mensaje ya escrito.

Petición del cliente, 18-11-2026.

### Por qué esta salida y no las seis páginas

Las dos eran defendibles y la decisión es del cliente, pero conviene dejar
escrito lo que se gana y lo que se pierde:

- **Se gana la conversión.** Hoy el recorrido es ficha → página → botón →
  WhatsApp. Pasa a ficha → botón → WhatsApp: dos pasos menos, sin salir de la
  portada y sin perder el sitio donde estaba quien mira.
- **Se gana no publicar seis páginas vacías.** Con el material que hay
  —`areas.js` tiene un subtítulo de una línea por área— esas seis páginas
  saldrían flacas, y una página flaca posiciona peor que no tenerla.
- **Se pierde posicionamiento de cola larga.** Una página por área es lo que
  compite por «abogado laboral Tuluá» o «restitución de inmueble Valle».
  Una ficha desplegable no es una URL y Google no la indexa aparte. **Esto no
  es un detalle: es la pérdida real de esta decisión**, y queda anotada para
  que nadie la redescubra dentro de un año.
- **No se cierra ninguna puerta.** El campo `enlace` de cada tarjeta se
  conserva; el día que existan las páginas, basta vaciar la descripción y la
  ficha vuelve a enlazar.

### Requisitos de negocio

1. Pulsar una ficha **abre una descripción breve** dentro de la propia ficha.
   No navega a ninguna parte.
2. El panel abierto lleva un botón **«Consultar ahora»** que abre WhatsApp con
   un mensaje que nombra el área.
3. Volver a pulsar la ficha la cierra.
4. **Cada ficha es independiente**: abrir una no cierra otra. Lo contrario
   —acordeón exclusivo— haría saltar la rejilla cada vez que alguien pulsa.
5. La ficha **cerrada se ve exactamente como hoy**. Este cambio no es un
   rediseño de la tarjeta.
6. La descripción y el mensaje de WhatsApp **se editan desde el panel**, como
   el resto del contenido del bloque.
7. El texto del botón se edita una sola vez para las seis, desde el bloque.

### Restricciones del proyecto que esto NO puede romper

- **Cero JavaScript en el sitio público.** Se hace con `<details>` y
  `<summary>` nativos, como el menú móvil y los acordeones que ya hay. Si al
  terminar `dist/` tiene algún `.js`, el trabajo está mal.
- **Un solo acceso a WhatsApp por pantalla** no aplica aquí: la regla habla de
  la burbuja flotante y el Sticky CTA, que son accesos permanentes. Este botón
  vive dentro de un panel que el visitante abre a propósito.
- **El número de WhatsApp sale de `contacto.js`**, con `enlaceWhatsApp()`.
  Ningún componente vuelve a declararlo: es el agujero del NAP.
- **Objetivo táctil de 44 px** para el botón y para la zona que abre la ficha.
- **Contraste AA.** La ficha va sobre navy con una foto detrás; el panel
  necesita fondo propio, no puede apoyarse en la foto.

### Casos límite

| Caso | Qué pasa |
|---|---|
| La tarjeta **no tiene descripción** | Se pinta como hoy: un `<a>` a su `enlace`. Es lo que hace que añadir el campo no rompa ninguna otra rejilla del sitio. |
| La tarjeta tiene descripción pero **no mensaje** | El mensaje se arma con el nombre del área: «Hola, deseo una consulta sobre Derecho laboral.» El cliente no tiene que escribir seis mensajes para que funcione. |
| **No hay número de WhatsApp** configurado | `enlaceWhatsApp()` ya devuelve el enlace con el número vacío; el botón no se pinta si no hay número, para no ofrecer un enlace muerto. |
| El navegador **no soporta `<details>`** | No existe ninguno vigente que no lo soporte; los que no lo soportan muestran el contenido siempre visible, que sigue siendo legible y con su botón. |
| Hay **más de seis** tarjetas | El bloque admite hasta 12. Nada en el diseño depende de que sean seis. |
| La descripción es muy larga | `max: 160` en el registro, y `sanearDatos` **recorta sin avisar**. Lo que se escriba por API hay que leerlo después de guardarlo. |

### Lo que decide si está bien hecho

- Las seis fichas abren y cierran con ratón, con dedo y con teclado.
- `dist/` sigue sin un solo archivo `.js`.
- La portada cerrada es **idéntica** a la de antes del cambio.
- Ningún enlace de la portada apunta ya a `/areas/derecho-*`.
- El panel del bloque deja editar descripción y mensaje de las seis.
