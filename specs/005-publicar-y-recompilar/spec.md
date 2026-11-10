# Especificación Funcional — Publicar recompila el sitio

## Objetivo

Que pulsar «Publicar» en el panel haga que el cambio **se vea en el sitio**.

Hoy no ocurre. El frontend es estático: consulta la API durante `astro build` y
el visitante recibe HTML plano. Editar contenido cambia la base de datos y la
API al instante, pero la página publicada sigue siendo la de la última
compilación.

Para cambiar una foto al mes se aguantaba. Para que publicidad edite textos a
diario, no: edita, pulsa publicar, no ve nada cambiar y concluye que está roto.

## Requisitos de Negocio

- «Publicar» deja el sitio actualizado **sin que nadie entre al servidor**.
- El panel dice en qué estado va: *publicando*, *publicado hace X*, o *falló*.
- Si la compilación falla, **el sitio anterior sigue en pie**. Nunca se queda a
  medias ni se sirve una versión rota.
- Dos personas pulsando publicar a la vez no lanzan dos compilaciones.
- Queda registrado quién publicó y cuándo.

## La decisión técnica, y por qué

Había tres caminos:

| Camino | Qué gana | Qué cuesta |
|---|---|---|
| **Recompilar al publicar** | El sitio sigue siendo HTML plano: rápido, barato de servir y **funciona aunque la API se caiga**. | Publicar tarda unos segundos. Hay que poder ejecutar la compilación en el servidor. |
| Renderizar en servidor (SSR) | Los cambios se ven al instante, sin compilar. | Cada visita pasa por Node y PostgreSQL. **Si la API cae, el sitio cae.** Se pierde la ventaja principal de la arquitectura. |
| SSR solo en la portada | Lo mismo, acotado a una página. | Dos modelos de despliegue conviviendo, y la portada —la más visitada— es justo la que pierde la resistencia. |

**Se elige recompilar al publicar.** El sitio de un bufete se lee mucho más de
lo que se edita, y que siga en pie cuando la base de datos no responde vale más
que ahorrar unos segundos al publicar. Además conserva los 0 KB de JavaScript y
el HTML cacheable, que son la razón de que el sitio cargue como carga.

El precio —que publicar tarde— se paga una vez por publicación y se puede
enseñar en pantalla. El precio de SSR se paga en cada visita y el día que la
base falle no se puede enseñar nada.

## Casos Límite

| Situación | Comportamiento |
|---|---|
| Se pulsa publicar dos veces seguidas | La segunda no lanza nada: se le dice que ya hay una en marcha. |
| Alguien edita mientras se compila | El cambio entra en la siguiente publicación, no en la que está corriendo. |
| La compilación falla | Se guarda el error, el panel lo enseña y **el sitio anterior queda intacto**. |
| La compilación se cuelga | Se corta pasados 5 minutos y se marca como fallida. |
| Se reinicia el servidor a mitad | Al arrancar, una publicación «en marcha» de hace rato se marca como interrumpida; no se queda colgada para siempre. |
| No hay nada que publicar | Se permite igual: recompilar sin cambios es inofensivo. |

## Criterios de Aceptación

- [ ] «Publicar» lanza la compilación y el panel enseña el estado sin recargar.
- [ ] Al terminar, el HTML servido contiene el cambio.
- [ ] Una compilación fallida deja el sitio anterior sirviendo.
- [ ] Dos pulsaciones seguidas producen una sola compilación.
- [ ] Sin sesión no se puede publicar; sin rol `admin`, tampoco.
- [ ] Queda en la auditoría quién publicó.
- [ ] `deploy/README.md` explica cómo funciona esto en cPanel.
