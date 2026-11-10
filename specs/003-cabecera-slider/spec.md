# Especificación Funcional — Cabecera en carrusel

## Objetivo

Convertir la cabecera de la portada (el bloque que va justo debajo del menú) en
un carrusel de **tres láminas**, cada una con su propia propuesta:

1. **Abogado** — la defensa jurídica general del bufete.
2. **Perito avaluador** — el avalúo de inmuebles y el dictamen pericial.
3. **Especialista en derecho laboral** — la rama donde el bufete tiene más peso.

El motivo es que hoy la cabecera comunica una sola cosa y el bufete vende tres
servicios distintos a tres públicos distintos. Quien llega buscando un avalúo no
ve nada que le hable a él hasta el sexto bloque de la página.

## Requisitos de Negocio

- **Tres láminas**, navegables por el visitante, con la de abogado por defecto.
- Cada lámina mantiene lo que hoy tiene la cabecera: rótulo, titular, texto,
  foto y **dos botones** (uno de conversión, otro secundario).
- Los tres contenidos son **editables desde el panel** por la persona de
  publicidad, igual que el resto de la página. No se codifican en la plantilla.
- Si solo se configura una lámina, la cabecera se comporta exactamente como
  hoy: sin controles ni carrusel. No se obliga a nadie a tener tres.
- **Cero JavaScript de cliente.** Es la restricción de arquitectura del
  proyecto y un carrusel no es motivo suficiente para romperla.

## Decisiones tomadas y por qué

### Sí hay avance automático, y no lleva control de pausa

Esta sección decía lo contrario y se ha quedado atrás dos veces. El orden real
de los hechos:

1. **Se diseñó sin avance automático**, porque un carrusel que gira solo exige
   un control de pausa (WCAG 2.2.2) y parecía que sin JavaScript no había forma
   de ofrecerlo.
2. **El cliente pidió que girara solo** y resultó que sí se podía, con un
   `:checked` haciendo de memoria. Se añadió con su botón de pausa (T17–T19).
3. **El cliente pidió quitar el botón de pausa** (27-10-2026). Se quitó.

El resultado es que el bloque **ya no cumple la WCAG 2.2.2 con un control
rotulado**, y eso lo baja del AA que el proyecto se fijó. Es la única deuda de
accesibilidad abierta del sitio y está asumida a sabiendas. Lo que queda en su
lugar, y lo que le falta a cada cosa, está en `AGENTS.md`, «No hay botón de
pausa, y eso tiene un coste».

### El cambio de lámina no mueve la página

Los carruseles de solo-CSS suelen hacerse con anclas (`href="#lamina-2"`). Se
descarta: el navegador desplaza la página para llevar el ancla a la vista, y en
móvil, donde la cabecera es más alta que la pantalla, eso da un salto. Se usan
`<input type="radio">` ocultos, que además traen gratis la navegación con las
flechas del teclado.

### Las láminas inactivas se ocultan con `visibility`

No con `opacity` sola. `visibility: hidden` las saca **del orden de tabulación y
del árbol de accesibilidad**: sus botones no se pueden enfocar a ciegas y el
lector de pantalla anuncia un solo `<h1>`, no tres.

## Casos Límite

| Situación | Comportamiento |
|---|---|
| Ninguna lámina configurada | Se usan los campos sueltos del bloque: una lámina, sin controles. Es el estado actual. |
| Una sola lámina | Igual: sin puntos de navegación ni `role="radiogroup"`. |
| Más de tres | El registro las limita a 3; el panel no deja añadir una cuarta. |
| Lámina sin foto | El hueco de la imagen no se pinta. El texto ocupa el ancho. |
| Lámina sin segundo botón | Se pinta solo el de conversión. |
| La API no responde en el build | La portada se genera sin bloques, como ya ocurre hoy. |

## Criterios de Aceptación

- [ ] Las tres láminas se ven y se cambian sin JavaScript.
- [ ] Con el teclado: `Tab` entra en los puntos, las flechas cambian de lámina.
- [ ] Los botones de una lámina oculta **no** reciben el foco.
- [ ] El resto de la portada no se mueve un píxel (`herramientas/visual.mjs`).
- [ ] La foto de la primera lámina sigue siendo la imagen de prioridad alta;
      las otras dos no compiten con ella por el LCP.
- [x] Los dos huecos de foto nuevos (`hero-perito`, `hero-laboral`) salen en la
      biblioteca de imágenes del panel y se pueden cambiar por separado.
- [ ] **El TEXTO de las láminas todavía no se edita desde el panel.** No es un
      fallo de esta spec: la pantalla de composición es la fase 3 de la spec
      002 y aún no está hecha. El campo `laminas` ya está declarado en el
      registro, que es lo que genera los formularios, así que aparecerá sola
      cuando esa fase llegue. Hasta entonces, el texto se cambia por SQL.
