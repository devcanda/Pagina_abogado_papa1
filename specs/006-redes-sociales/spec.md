# Especificación Funcional — Bloque de redes sociales

## Objetivo

Sustituir la franja de **cifras y preguntas frecuentes** de la portada por una
sección que enseñe la actividad de Diego Candamil en redes: los últimos vídeos
de **TikTok** en vertical, un vídeo de **YouTube** en horizontal y la fanpage de
**Facebook**.

La idea es prueba social. En un bufete, ver que el abogado publica y que la
gente lo sigue vale como recomendación: convence a quien duda entre llamar o
seguir buscando.

## Requisitos de Negocio

- Los vídeos de TikTok **se actualizan solos**: cuando Diego sube uno nuevo, la
  página lo enseña sin que nadie entre al panel. Es la petición explícita del
  cliente (11-11-2026).
- Un vídeo de YouTube, apaisado, elegido desde el panel.
- La fanpage de Facebook visible, con la opción de seguirla.
- El bloque se puede **ocultar desde el panel** como cualquier otro, y los
  textos que lo acompañan se editan ahí.
- El bloque que hay hoy (`cifrasYPreguntas`) **se oculta, no se borra**.

## Lo que se decidió, y por qué

### TikTok: embed de perfil, no API

Tres caminos para enseñar «el último vídeo»:

| Camino | Se actualiza solo | Coste |
|---|---|---|
| **Embed de perfil de creador** | **Sí**, hasta 10 vídeos recientes | Carga el script de TikTok; la tarjeta la dibuja TikTok |
| Display API (`/v2/video/list/`) | Sí | Login Kit + revisión de la app + OAuth del titular + auditoría para producción |
| Vídeos sueltos elegidos a mano | No | Cero JavaScript y diseño propio, pero hay que mantenerlo |

**Se eligió el embed de perfil.** El código se saca del propio TikTok
(*Compartir* → *Insertar* en el perfil): no hay clave de API, ni cuota, ni
solicitud que presentar. La Display API resuelve lo mismo a cambio de un
trámite de aprobación desproporcionado para una franja de una portada, y además
obligaría a guardar y renovar un token de la cuenta de un tercero.

### Facebook: la fanpage, no el contador

**El botón de «Me gusta» suelto ya no existe:** Meta lo descontinuó junto con el
de comentarios el **10 de febrero de 2026**, y las instancias que quedan se
convierten en elementos invisibles. Lo que sigue vivo es el *Page Plugin*, que
muestra la tarjeta de la página y el botón de seguir.

La documentación de Meta **ya no describe un contador total de «me gusta»**:
solo la hilera de caras de los amigos del visitante que siguen la página. Por
eso el requisito se formula como «que se vea la fanpage y se pueda seguir», no
como «que se vea el número». Si algún día Meta retira también este plugin, el
bloque tiene que degradar a un enlace, no a un hueco en blanco.

### YouTube: `<iframe>` pelado

No necesita JavaScript. Va en `youtube-nocookie.com`, que no deja la cookie de
seguimiento hasta que el visitante le da al play.

## El precio: el sitio deja de enviar 0 KB de JavaScript

Hoy la portada compilada tiene **0 archivos JavaScript**, y eso es un principio
defendido en AGENTS.md, no una casualidad. El embed de TikTok y el Page Plugin
de Facebook cargan scripts de terceros, así que **este bloque lo rompe**.

Es una deuda consciente, igual que la del botón de pausa del carrusel. Lo que
la hace tolerable y lo que no:

- **Se paga solo donde se usa.** Los scripts se cargan desde el bloque, así que
  una página sin este bloque sigue enviando 0 KB.
- **Nada bloquea el renderizado.** Los `<iframe>` van en `loading="lazy"` y los
  scripts en `defer`: el LCP de la portada lo sigue decidiendo la foto de la
  cabecera, no las redes.
- **Lo que no se puede evitar:** esos scripts son de TikTok y de Meta, y pueden
  cambiar de tamaño o de comportamiento sin avisar. El día que el bloque
  ralentice la portada, la salida es cambiar TikTok a vídeos elegidos a mano,
  que no lleva JavaScript.

## Privacidad (Ley 1581 de 2012)

Los tres servicios rastrean al visitante desde el momento en que cargan. En un
sitio que recoge datos de personas con problemas laborales, eso no es neutro:

- Las incrustaciones **no cargan solas hasta que el visitante baja hasta el
  bloque** (`loading="lazy"`), que reduce el rastreo de quien nunca lo ve.
- YouTube va en `youtube-nocookie.com`.
- **Pendiente de decidir con el cliente:** si la política de privacidad del
  sitio tiene que mencionar estos terceros. No es una decisión técnica.

## Casos Límite

- **La cuenta de TikTok no tiene vídeos, o es privada.** TikTok no permite
  incrustar cuentas privadas ni de menores. El bloque debe seguir en pie con el
  resto de las redes, sin un hueco roto.
- **El visitante bloquea los scripts de terceros** (extensión, red corporativa,
  navegador estricto). Es frecuente. Cada incrustación tiene que llevar debajo
  un **enlace normal al perfil**, de modo que el bloque siga sirviendo para algo
  aunque no cargue ni un embed.
- **Sin JavaScript en el navegador.** Igual que el caso anterior: quedan los
  enlaces.
- **Falta una URL** (todavía no hay canal de YouTube, por ejemplo). Esa parte no
  se pinta; el bloque se reparte entre las que sí están.
- **Móvil.** Tres incrustaciones apiladas en un teléfono es mucha página. El
  orden y el tamaño se deciden mirando, no suponiendo.

## Fuera de alcance

- Publicar en redes desde el panel.
- Contar seguidores o interacciones en el sitio.
- Un muro agregado de varias redes.

## Lo que hace falta para empezar

Tres datos que solo tiene el cliente, y sin los cuales no se puede montar:

1. URL del **perfil de TikTok**.
2. URL del **vídeo de YouTube** (o del canal, si se prefiere el último).
3. URL de la **fanpage de Facebook**.

Van a `frontend/src/data/contacto.js`, que ya es la fuente única de los datos de
contacto. **Hoy los iconos de Facebook, LinkedIn e Instagram de la barra
superior apuntan a `#`**: nunca se configuraron. Con esto se arreglan de paso, y
no quedan dos listas de redes que un día dejarían de coincidir.
