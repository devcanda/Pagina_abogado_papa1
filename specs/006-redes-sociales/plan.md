# Plan Técnico — Bloque de redes sociales

## Forma del bloque

Un tipo nuevo en el registro, `redesSociales`, con su componente. Nada de
código suelto en la portada: el bloque tiene que poder ocultarse, reordenarse y
editarse desde el panel como los otros ocho.

```
redesSociales
├── etiqueta, titulo, destacado        rótulo y titular, como el resto
├── tiktokPerfil                       URL del perfil  → embed automático
├── youtubeVideo                       URL del vídeo
├── facebookPagina                     URL de la fanpage
└── colorTitulo, colorTexto            libres, con contraste medido al lado
```

Maquetación: los vídeos verticales de TikTok a un lado y, al otro, el de
YouTube apaisado con la fanpage debajo. En móvil, en columna.

## El tipo `url` hay que crearlo, y con lista de lo permitido

`sanearDatos` entiende `lista`, `grupo`, `opcion`, `imagen` y `color`. **No hay
tipo para URL**, y aquí hace falta uno: estas URLs acaban dentro del `src` de un
`<iframe>`, que es exactamente el mismo agujero que ya está documentado para los
colores —un campo de texto que se escribe crudo en un atributo es una vía de
inyección—.

Se valida **contra una lista de lo permitido, no de lo prohibido**, igual que el
color:

| Campo | Patrón aceptado |
|---|---|
| `tiktokPerfil` | `https://www.tiktok.com/@` + nombre de usuario |
| `youtubeVideo` | `youtube.com/watch?v=` o `youtu.be/` + id |
| `facebookPagina` | `https://www.facebook.com/` + página |

Lo que no encaje se descarta y se conserva lo que hubiera, que es como ya se
comporta el saneado con las claves de imagen. El ID del vídeo de YouTube se
extrae en el servidor y se reconstruye la URL de incrustación: **nunca se
reenvía al `<iframe>` lo que escribió el usuario**.

El panel, además, acepta pegar la URL tal cual sale del navegador —con
`?si=`, `?entry=` y demás basura de sesión— y la limpia. Es lo mismo que ya se
hace con el enlace de Google Maps.

## Las tres incrustaciones

**YouTube** — `<iframe>` normal contra `youtube-nocookie.com`, con
`loading="lazy"` y `title`. Sin JavaScript.

**TikTok** — `<blockquote class="tiktok-embed">` con el `cite` del perfil, más
su `embed.js` en `defer`. Es el único modo de que se actualice solo. El script
se carga **una sola vez y solo si el bloque está en la página**.

**Facebook** — Page Plugin. Carga el SDK de Meta; se le pasa la versión del SDK
de forma explícita, porque Meta va retirando versiones (v20.0 en septiembre de
2026, v21.0 en enero de 2027) y una versión fijada a mano deja de cargar sin
avisar.

**Las tres llevan debajo un enlace normal al perfil.** No es adorno: quien
bloquea scripts de terceros —extensiones, redes corporativas, navegadores
estrictos— no vería nada, y el bloque dejaría un hueco. Con el enlace, sigue
sirviendo para lo que se puso.

## Dónde se guardan las URLs

**Se reparten por naturaleza**, que es un matiz que apareció al implementarlo:
el plan original las mandaba todas a `contacto.js`, y eso habría obligado a
tocar código y recompilar cada vez que se quisiera cambiar el vídeo.

- **Perfiles** (TikTok, Facebook, y de paso Instagram y LinkedIn) →
  `frontend/src/data/contacto.js`. No cambian nunca.
- **El vídeo de YouTube** → campo del bloque, editable desde el panel. Eso sí
  cambia: es contenido.

La razón es la misma por la que el teléfono y la dirección ya viven ahí: hoy los
iconos de Facebook, LinkedIn e Instagram de la barra superior apuntan a `#`
porque nunca se configuraron. Si las redes se guardaran en el bloque, habría dos
listas y un día dejarían de coincidir, que es justo el agujero del NAP
incoherente que el proyecto ya cerró una vez.

## Migración

`012-redes-sociales.sql`:

1. Inserta el bloque `redesSociales` en la portada, en el orden donde está hoy
   el de cifras.
2. Pone `visible = FALSE` en el bloque `cifrasYPreguntas`. **No lo borra:** sus
   preguntas son texto que costó escribir y el panel permite reactivarlo con un
   clic.

Va con el corredor (`npm run db:migrar`), así que llega sola al otro equipo y a
cPanel.

## Rendimiento y privacidad

- Todos los `<iframe>` en `loading="lazy"`: no se cargan hasta que el visitante
  baja al bloque, lo que de paso reduce el rastreo de quien nunca lo ve.
- Los scripts en `defer`, para que no bloqueen el renderizado.
- **Se mide después**, no se supone: la portada tiene un control visual y un
  presupuesto de peso. Si el bloque mueve el LCP, la salida está escrita en la
  spec —pasar TikTok a vídeos elegidos a mano, que no lleva JavaScript—.

## Riesgos

| Riesgo | Qué hacemos |
|---|---|
| El sitio deja de enviar 0 KB de JS | Asumido y anotado en AGENTS.md como deuda consciente, igual que el botón de pausa |
| Meta retira el Page Plugin | El enlace de debajo mantiene el bloque en pie; se quita el plugin y ya |
| TikTok cambia el aspecto de su tarjeta | Es suya y puede cambiarla. Si rompe el diseño, se cambia a vídeos elegidos |
| Una cuenta privada o vacía no se puede incrustar | El bloque se reparte entre las redes que sí cargan |

## Pruebas

Suite nueva, `redes.test.mjs`, con las reglas de la casa —copia al empezar,
devolución en un `finally`, nada de nombrar contenido—:

- Una URL que no sea de los dominios permitidos **se descarta** y se conserva la
  anterior.
- Una URL de YouTube con basura de sesión se guarda limpia.
- El bloque sale en el HTML publicado con sus tres enlaces, **aunque ningún
  script de terceros cargue**.
- La portada no se desborda a lo ancho a 360 px con el bloque puesto.
- El bloque de cifras sigue existiendo en la base, solo que oculto.
