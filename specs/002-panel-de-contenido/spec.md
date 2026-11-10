# Especificación (Spec) — 002 Compositor de bloques

## Objetivo

Que la persona encargada de publicidad, **sin acceso al repositorio ni al
servidor**, componga y mantenga las páginas del sitio desde el navegador:
añadir bloques de un catálogo, ordenarlos, rellenarlos con sus textos e
imágenes y publicarlos.

El diseño sigue siendo responsabilidad del código. Ella decide **qué se dice y
en qué orden**, no cómo se ve.

## Quién lo usa

| Perfil | Quién | Qué puede hacer |
|---|---|---|
| `admin` | El titular del proyecto | Todo, incluidos usuarios y plantillas |
| `editor` | Publicidad / diseño | Componer, editar y publicar páginas |

## Qué es un bloque

Una pieza de página ya diseñada —cabecera, rejilla de tarjetas, testimonio,
franja de cierre— que expone dos cosas al editor:

- **Contenido:** textos, imágenes, enlaces, elementos de lista.
- **Variantes:** un conjunto cerrado de opciones que yo apruebo de antemano.
  Fondo claro u oscuro, imagen a izquierda o derecha, dos o tres columnas.

Lo que **no** expone: tipografías, colores, tamaños, espaciados ni posiciones.
Por eso una página mal compuesta puede quedar sosa, pero nunca rota.

## Criterios de aceptación

1. Entra con usuario y contraseña desde cualquier equipo.
2. Ve la lista de páginas y puede abrir cualquiera a editar.
3. Dentro de una página: **añade** bloques del catálogo, los **reordena**,
   los **elimina** y **rellena** su contenido.
4. Elige la variante de cada bloque entre las opciones ofrecidas.
5. Sustituye cualquier imagen; se redimensiona sola y se ve sin recompilar.
6. Pulsa **ver cómo queda** y se abre en una pestaña nueva la página real con
   los cambios **sin publicar**.
7. Pulsa **publicar** y el cambio queda visible para los visitantes.
8. Crea una página nueva de dos maneras: **desde una plantilla** que ya trae
   sus bloques puestos, o **en blanco** añadiéndolos uno a uno.
9. Toda combinación de variantes que se le ofrezca **cumple WCAG AA**
   verificado. No puede elegir una que no contraste.
10. Cada cambio queda registrado: quién, qué y cuándo.

## El catálogo inicial

Son los bloques que ya componen la portada, convertidos en piezas reutilizables:

| Bloque | Tono | Para qué |
|---|---|---|
| Cabecera | Oscuro | Titular grande, texto y foto |
| Texto con imagen e insignia | Claro | Argumento con foto y cifra destacada |
| Franja de una línea | Medio | Separador con un mensaje corto |
| Rejilla de tarjetas con icono | Oscuro | Áreas de práctica, servicios |
| Cifras y preguntas | Claro | Datos en cuadrícula + acordeón |
| Servicio destacado | Oscuro | Texto, lista con marcas e imagen |
| Tarjetas con fotografía | Claro | Casos, noticias, proyectos |
| Equipo | Medio | Retratos circulares |
| Testimonio | Oscuro | Cita destacada |
| Franja de cierre | Oscuro | Llamada a la acción final |
| Texto libre | Claro | Párrafos y subtítulos sueltos |

## Casos límite

- *Pone tres bloques oscuros seguidos:* el editor **avisa** de que se pierde el
  ritmo de la página. No lo impide; es su decisión.
- *Deja un bloque sin imagen:* se publica con el marcador de posición, que es
  evidentemente provisional, no con un hueco roto.
- *Sube un JPG de 8 MB:* se redimensiona y convierte a WebP **en su navegador**
  antes de salir; al servidor no llega el original.
- *Sube algo que no es una imagen:* se rechaza validando los bytes de cabecera.
- *Borra un bloque por error:* se recupera mientras no haya publicado; una vez
  publicado, desde el historial de la página.
- *Crea una página con un slug que ya existe:* se rechaza con un aviso claro.
- *Deja una página a medias:* queda en borrador y no la ve ningún visitante.
- *Se cae la base de datos:* el sitio deja de servir contenido. Es el coste de
  la publicación instantánea (ver Decisión).

## Decisión de arquitectura

Publicar páginas nuevas al instante es incompatible con un sitio estático: una
página nueva es un archivo HTML que alguien tiene que generar. Las dos salidas,
medidas en este proyecto:

| | Recompilar en el servidor | Servir desde Node (SSR) |
|---|---|---|
| Página nueva | 30-60 s | Instantáneo |
| Respuesta por página | 10 ms | ~30-50 ms (la consulta tarda 20 ms) |
| Memoria exigida | **400-900 MB al compilar** | ~80 MB en reposo |
| Si cae Node | El sitio sigue en pie | El sitio deja de servirse |

**Se elige SSR**, y el factor decisivo es la memoria: los planes compartidos de
cPanel rara vez conceden 900 MB a una aplicación Node, y una compilación que
falla por memoria deja el sitio congelado sin avisar.

No se pierde nada de lo construido: cero JavaScript en el navegador, la
tipografía autoalojada, las imágenes optimizadas y toda la maquetación.

Las **imágenes siguen siendo archivos estáticos** servidos por Apache, con
nombre fijo: el HTML apunta a `/img/<clave>.webp` y lo que cambia son sus
bytes. Por eso una imagen nueva se ve al instante sin tocar nada más.

## Fuera de alcance

Arrastrar y soltar libre, control de colores y tipografías, aprobación por un
tercero, edición simultánea de la misma página, traducciones, publicación
programada y recuperación de clave por correo.

---

## Apéndice (27-10-2026) — Edición de textos y colores

La fase 3 se retoma con dos añadidos sobre lo especificado:

### Tipo de campo `color`

Nuevo tipo en el registro. El panel pinta un selector de color nativo más la
casilla del valor hexadecimal, y **el contraste medido al lado**.

Decidido en **D4**: el selector es **libre y no bloquea**. Se expone el número
porque informar no es impedir; quien edita verá «2,01:1» junto a un color
ilegible y decidirá.

El contraste se calcula contra el fondo que declara el bloque en su `tono`:
claro → blanco, oscuro → navy. No es exacto para cada píxel —hay cuñas y
texturas por medio— pero es el fondo dominante y es lo que decide la lectura.

**Un color es texto que acaba dentro de un atributo `style`.** Se valida contra
`^#[0-9a-f]{6}$` y se descarta lo que no encaje. Sin eso, el campo sería una
vía de inyección de CSS: `red;background:url(...)` o peor.

### Formularios generados desde el registro

Se leen `campos` y `variantes` de `frontend/src/bloques/registro.js`, importado
tal cual desde el backend. **No se duplica el catálogo**: duplicarlo garantiza
que un día el formulario y la página dejen de coincidir.

Los campos de tipo `grupo` —las láminas del slider, las tarjetas de servicios—
se pintan anidados, con añadir y quitar elementos.

Los de tipo `imagen` **no** salen en el formulario: ya están arriba, en la
rejilla de imágenes del bloque, con su tamaño y su vista previa.
