# Tareas de Implementación — Cabecera en carrusel

## Dato
- [x] T1: Añadir `laminas` (grupo, máx. 3) al bloque `cabecera` del registro.
- [x] T2: Comprobar que `sanearDatos` y `resolverMedios` recorren el grupo.

## Interfaz
- [x] T3: `Cabecera.astro` pinta N láminas; con una, sin controles.
- [x] T4: Radios ocultos + puntos de navegación de 44px.
- [x] T5: Reglas del carrusel en `global.css` con `:has()`.
- [x] T6: Prioridad de carga: lámina 1 alta, resto baja.

## Contenido
- [x] T7: Migración `006` con las tres láminas, sobre todas las revisiones.
- [x] T8: Huecos `hero-perito` y `hero-laboral`, visibles en el panel.
      Nacen con copia de la foto del abogado: es el mismo abogado en tres
      papeles. Publicidad las cambia por separado cuando tenga las suyas.

## Validación
- [x] T9: El resto de la portada no se mueve (`herramientas/visual.mjs`).
- [x] T10: Teclado: flechas cambian de lámina; lo oculto no recibe foco.
- [x] T11: Peso de la portada antes/después.
- [x] T12: Actualizar `AGENTS.md` y `MEMORY.md`.

## Resultado

Las 12 tareas, hechas. Comprobado con Chrome sin interfaz:

| Comprobación | Resultado |
|---|---|
| Arranca en la lámina 1 | ok |
| Flechas del teclado cambian de lámina | ok (derecha, derecha, izquierda) |
| Solo la lámina activa expone sus enlaces | 1 de 5 |
| Solo se expone un `<h1>` | 1 de 3 en el DOM |
| La sección no cambia de alto al pasar | 774 / 774 / 774 px |
| El resto del sitio no se mueve | 5 de 7 vistas idénticas al píxel |

La portada crece 64px de alto en escritorio y en móvil: es la fila de puntos
(44px de objetivo táctil + 20px de aire). Ninguna otra vista cambia.

## Fallo encontrado durante la implementación

El `display: none` de los puntos estaba **detrás** del bloque `@supports`. Con
la misma especificidad gana la última regla del archivo, así que los puntos no
se pintaban nunca y el carrusel solo se podía cambiar con el teclado. Se detectó
midiendo el `display` calculado, no mirando la captura: en la captura el hueco
de los puntos parecía simplemente aire.

## Ampliación: relevo de 1,2 s y flechas

- [x] T13: Relevo secuencial de 1,2 s (1,4 s declarados; 1,31 s medidos).
- [x] T14: Seis flechas, dos visibles por estado, con vuelta circular.
- [x] T15: Flechas fuera del árbol de accesibilidad; el nombre lo pone el radio.
- [x] T16: Anulación de movimiento con la especificidad correcta.

| Comprobación | Resultado |
|---|---|
| «siguiente» 1→2→3 y vuelve a 1 | ok |
| «anterior» 1→3 y 3→2 | ok |
| Solo dos flechas visibles por estado | ok |
| El relevo dura al menos 1,2 s | 1,31 s medidos |
| La saliente se oculta al acabar de desvanecerse | 0,5 s de retraso |
| Con «menos movimiento», cambio instantáneo | 1 ms |
| Objetivo táctil de las flechas | 44x44 |
| El resto del sitio no se mueve | 5 de 7 vistas idénticas al píxel |

## Segundo fallo encontrado

La anulación de `prefers-reduced-motion` no hacía nada: estaba escrita con el
selector corto (`.cabecera-pila > .cabecera-lamina`) y perdía por especificidad
contra la regla de `:has()`. Una `@media` **no** añade especificidad. Con
«menos movimiento» activado el relevo seguía durando 452 ms. Corregido
repitiendo los selectores completos dentro del `@supports`.

## Ampliación: pase automático

- [x] T17: Pase automático sin JavaScript, 5 s por lámina, 15 s la vuelta.
- [x] T18: Botón de pausa (WCAG 2.2.2) y congelado con `:focus-within`.
- [x] T20: **Retirado el botón de pausa** a petición del cliente (27-10-2026).
      El congelado por `:focus-within` se queda. Comprobado en el navegador
      que siguen funcionando los tres mecanismos que quedan: pulsar un punto
      detiene el pase para siempre (`animation-name: none`), el foco dentro lo
      congela (`paused` con foco, `running` sin él) y con «menos movimiento» no
      arranca. **Deuda de accesibilidad asumida**, ver `AGENTS.md`.
- [x] T19: El mando manual detiene el pase; con «menos movimiento» no arranca.

Observado con Chrome, mirando 17 s sin tocar nada:

    1@0.0s   2@4.5s   3@9.5s   1@14.4s

| Comprobación | Resultado |
|---|---|
| Pasa por las tres sin tocar nada | ok |
| La vuelta completa dura unos 15 s | 14,4 s |
| Un solo punto encendido | ok |
| Con la pausa puesta no avanza | lámina 1 → 1 tras 6,5 s (botón ya retirado) |
| Pulsar un punto detiene el pase | lámina 3 tras 8 s |
| El botón de pausa desaparece al tomar el mando | ok (botón ya retirado) |
| Con «menos movimiento» no arranca, pero los puntos mandan | ok |
| Teclado y flechas siguen enteros | 10/10 y 8/8 |
| El resto del sitio no se mueve | 5 de 7 vistas idénticas al píxel |

## Tercer fallo encontrado

El botón de pausa no pausaba. Las reglas del pase usaban la forma corta
`animation:`, que **reinicia `animation-play-state` a `running`**, y tenían más
especificidad (0,6,0) que la regla de la pausa (0,4,0): se marcaba `paused` y
la forma corta lo devolvía a `running`. Corregido pasando a propiedades largas,
con lo que `animation-play-state` deja de escribirse ahí.

Es la tercera vez en esta spec que el fallo es de especificidad o de orden de
reglas. Las tres se habrían escapado mirando capturas: solo salieron al leer
los valores calculados y al cronometrar el comportamiento real.
