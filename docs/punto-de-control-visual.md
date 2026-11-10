# Punto de control visual

Acta del estado del diseño en el momento de congelarlo, **antes** de acometer
la spec 002 (compositor de bloques).

Si una refactorización cambia cualquiera de estos números o cualquiera de las
siete capturas, es un cambio de diseño. Puede ser deliberado, pero tiene que
ser consciente.

## Cómo se verifica

```bash
# 1. Compilar y servir
cd frontend && npm run build && npx astro preview --port 4340 &

# 2. Arrancar Chrome con el protocolo de depuración abierto
chrome --headless --disable-gpu --remote-debugging-port=9222 about:blank &

# 3. Capturar el estado actual y enfrentarlo a la línea base
node herramientas/visual.mjs capturar http://localhost:4340 /tmp/actual
node herramientas/visual.mjs comparar docs/linea-base /tmp/actual
```

Devuelve `0` si todo coincide y `1` si algo cambió. Por cada vista distinta
escribe una imagen en `/tmp/actual/diferencias/` con **los píxeles alterados en
rojo** sobre el resto en gris, para localizar el cambio de un vistazo.

## Las siete vistas

| Vista | Resolución | Alto de página |
|---|---|---|
| portada-escritorio | 1440 | 5513 px |
| portada-movil | 390 | 7851 px |
| corporativa-escritorio | 1440 | 1227 px |
| corporativa-movil | 390 | 1666 px |
| landing-escritorio | 1440 | 1270 px |
| landing-movil | 390 | 1161 px |
| error-404 | 1440 | 1014 px |

Las imágenes están en `docs/linea-base/`. **No se regeneran salvo que el cambio
de diseño sea intencionado**, y entonces se regeneran en un paso aparte, para
que quede claro en el historial qué se aceptó.

## Fiabilidad de la herramienta, medida

No se da por supuesta. Se comprobó así:

| Prueba | Resultado |
|---|---|
| Cuatro capturas seguidas sin tocar nada | **0 píxeles** de diferencia en las 7 vistas |
| Cambiar el espaciado de un bloque (`py-28` → `py-32`) | Detectado: la portada pasa de 5513 a 5545 px; las otras 5 vistas intactas |
| Cambiar **una sola palabra** de un titular | Detectado: 1936 px en escritorio, 1588 en móvil; 0 en las páginas sin esa palabra |

Dos ajustes salieron de esas pruebas y conviene conocerlos:

- **Se espera a `document.fonts.ready`.** Con `font-display: swap` el titular se
  pinta primero en Georgia y luego cambia a Playfair. Sin esperar, los
  titulares salían con otra tipografía según el instante del disparo y daban
  1,73% de falso positivo.
- **Se emula `prefers-reduced-motion`.** El sitio ya respeta esa preferencia
  desactivando el desplazamiento suave y la franja rotatoria. Sin ello, la
  cabecera fija quedaba a distinta altura y la franja en distinta palabra.
- **Se mide el alto del documento hasta que dos lecturas coinciden.**
  `Page.getLayoutMetrics` devuelve a veces el alto del viewport contra un
  Chrome recién arrancado, y la captura salía recortada.
- **La fuente se espera por su EFECTO, no por su promesa.** Ni
  `document.fonts.ready` ni `fonts.check()` garantizan que el texto ya se haya
  repintado: se mide el ancho de un titular hasta que dos lecturas coinciden.
  Sin esto, la primera pasada tras arrancar el servidor daba 1,7% de falso
  positivo con los titulares en Georgia.
- **El umbral es absoluto (150 píxeles), no porcentual.** Un porcentaje engaña:
  una palabra cambiada son unos 2.000 píxeles, que sobre una portada de 7,9
  millones es un 0,024% y pasaba desapercibida.

## Peso del sitio

| | Valor |
|---|---|
| CSS total | 44.326 bytes |
| HTML de la portada | 43.686 bytes |
| **JavaScript enviado al navegador** | **0 archivos** |
| Tipografía autoalojada | 2 archivos WebOpenFont, 80 KB |
| Sitio compilado completo | 611 KB |

El **cero de JavaScript** es el número que más fácil se pierde en una
refactorización y el más difícil de recuperar después.

## Paleta en uso

```
--color-marino-50   #f0f5fb      --color-rojo-300    #d98a8c
--color-marino-100  #dce8f5      --color-rojo-400    #c4686b
--color-marino-200  #b6cde8      --color-rojo-500    #a0373a   ← acción
--color-marino-600  #195ba9      ← azul principal
--color-marino-700  #134782      --color-rojo-600    #8a2f32
--color-marino-800  #0e345e      --color-tinta       #373435
--color-marino-900  #0a2443      --color-tinta-suave #5b5557
--color-humo        #f4f8fc      --color-humo-200    #e3ecf6
```

El azul `#195BA9` está **en ensayo**: lo eligió el cliente y es más vivo que el
del logotipo. Los valores anteriores están anotados en la cabecera de
`global.css` por si se revierte.

## Contrastes verificados contra WCAG 2.1

| Combinación | Ratio | Nivel |
|---|---|---|
| Azul sobre blanco | 6.75:1 | AA |
| Blanco sobre navy del hero | 15.60:1 | AAA |
| Blanco sobre la cabecera | 12.56:1 | AAA |
| Blanco sobre el rojo del botón | 6.77:1 | AA |
| Azul claro sobre navy | 10.99:1 | AAA |
| Rojo claro sobre navy | 5.16:1 | AA |

**Rojo de marca sobre navy: 2.01:1 — falla.** Por eso existe
`btn-primario-oscuro`, que añade un filete claro al botón para cumplir el 3:1
que WCAG 1.4.11 exige al borde de un control. No eliminar ese filete.

## Composición de la portada

| | Bloque | Tono |
|---|---|---|
| 1 | Hero | Oscuro |
| 2 | SobreBufete | Claro |
| 3 | FranjaCompromiso | Medio |
| 4 | AreasPractica | Oscuro |
| 5 | CifrasYPreguntas | Claro |
| 6 | PeritoAvaluador | Oscuro |
| 7 | CasosRecientes | Claro |
| 8 | FranjaCierre | Oscuro |

La alternancia claro/oscuro es lo que da ritmo a la página. Dos bloques del
mismo tono seguidos la aplanan.

## Invariantes que no deben romperse

1. **Cero KB de JavaScript** en el sitio público.
2. **Cero desbordamiento horizontal** a 360 px (medido: `scrollWidth = 360`).
3. Un solo `<h1>` por página, con la jerarquía de titulares intacta.
4. El anillo de foco en **azul**, y en blanco sobre superficies oscuras.
5. El filete claro de `btn-primario-oscuro`.
6. `og:image` nunca puede ser un SVG.
7. El logotipo no se modifica (ver `AGENTS.md`).

## Cuándo regenerar la línea base

Solo cuando un cambio de diseño esté aprobado. Entonces:

```bash
node herramientas/visual.mjs capturar http://localhost:4340 docs/linea-base
```

Y se anota aquí qué cambió y por qué. Regenerarla para "que deje de fallar" es
exactamente lo que convierte un punto de control en decoración.
