# Especificación Funcional (Spec)

## 014 · SEO profundo y marco legal que lo sostenga

### Objetivo

El sitio deja de ser solo un canal a WhatsApp y pasa a tener una **segunda
meta declarada: posicionar en buscadores y medir**. Eso cambia dos cosas a la
vez, y por eso van en la misma spec:

- **SEO:** que Google pueda rastrear, entender y preferir este sitio frente al
  de otro bufete de la zona.
- **Marco legal:** medir implica tratar datos. El andamiaje legal tiene que
  cubrir lo que el sitio hace **de verdad**, no una versión idealizada.

Petición del cliente, 18-11-2026, con una frase que fija el rumbo: *«sé que no
es viable dejar el sitio sin compartir información»*. Queda descartado, pues,
el camino de quitar las incrustaciones.

### Punto de partida, medido

Lo que **ya está bien** y no hay que tocar:

| | |
|---|---|
| `<html lang="es-CO">` | en las siete páginas |
| Canónicas | en las siete |
| Open Graph y Twitter Card | 7–8 etiquetas por página |
| Títulos y descripciones | **únicos**, sin un solo duplicado |
| `404` | existe y lleva `noindex, nofollow` |
| Fuentes | autoalojadas: ni una petición a Google Fonts |

Lo que **está roto o falta**:

| Hallazgo | Por qué importa |
|---|---|
| **No hay sitemap**, y `robots.txt` anuncia `sitemap-index.xml` | Le estamos mandando a Google a un 404. Es lo primero que lee un rastreador |
| **La portada tiene TRES `<h1>`** | Son las tres láminas del carrusel. Para un rastreador, tres encabezados de primer nivel compitiendo |
| **Datos estructurados mínimos** | `LegalService` con solo `name`, `url`, `areaServed` y `telephone`. **Sin dirección, sin geo, sin horario, sin perfiles.** Para búsqueda local es casi no tener nada |
| El mismo bloque se repite **idéntico en las 7 páginas** | Siete entidades sueltas en vez de una sola bien descrita |
| **7 enlaces rotos**, en todas las páginas | `/blog/`, `/terminos-y-condiciones/`, `/tratamiento-de-datos/` y cuatro `/areas/derecho-*` |
| `<link rel="preconnect" href="http://localhost:3000">` | En las seis páginas. Apunta a la máquina del visitante |
| Descripciones fuera de rango | `/contacto/` 219 y `/areas/` 180 (Google corta ~160); portada 113 y `/demanda-laboral/` 93 (desaprovechadas) |
| **«Valle del Cauca, Valle del Cauca»** | En la descripción de `/quienes-somos/`: `${ciudad}` ya trae el departamento |
| Sin `BreadcrumbList` ni `FAQPage` | Son los dos fragmentos enriquecidos al alcance de este sitio |
| **El bloque de redes lleva datos de EJEMPLO** | `@tiktok`, `facebook.com/meta` y «Me at the zoo». La portada promociona las cuentas de TikTok y Meta como si fueran del bufete |

Y el hueco de fondo: **contenido**. Portada 806 palabras, `/areas/` 683,
`/quienes-somos/` 429, `/contacto/` 249, `/demanda-laboral/` 124.

### La contradicción que hay que poner sobre la mesa

**Ayer se decidió NO crear las seis páginas de área** y abrir una ficha
desplegable en su lugar. Se expuso entonces que eso cuesta posicionamiento de
cola larga. Hoy el SEO pasa a ser una meta declarada, así que **esa decisión y
esta meta se contradicen**.

Una ficha desplegable no es una URL. «Abogado laboral Tuluá», «restitución de
inmueble Valle del Cauca» o «demanda contra el Estado Tuluá» se ganan con una
página por materia, con su título, su descripción, su encabezado y su
contenido. Hoy el sitio tiene **una sola página** compitiendo por las seis
materias, y encima enlaza a cuatro URLs que no existen.

**No se revierte nada sin que el cliente lo decida.** Las fichas se quedan
como están; lo que esta spec propone es **añadir** las seis páginas y que la
ficha enlace a la suya además de abrirse. Queda como decisión D5.

### Requisitos

1. Google puede descubrir todas las páginas: sitemap válido y `robots.txt`
   que apunte a él de verdad.
2. Ningún enlace interno lleva a un 404.
3. Una sola entidad de negocio bien descrita, con NAP, geolocalización,
   horario y perfiles, y no siete copias pobres.
4. Un `<h1>` por página.
5. Cada página con título y descripción dentro de rango y sin errores.
6. **El marco legal cubre lo que el sitio hace**, incluida la medición que se
   va a añadir.
7. Las dos páginas legales que el pie ya enlaza existen.

### Restricciones que esto NO puede romper

- **El sitio sigue siendo estático.** Nada de SSR.
- **Analítica y 0 KB de JavaScript no caben juntas**, y hay que elegir con los
  ojos abiertos. Ver D3.
- **Ningún dato de contacto se vuelve a declarar fuera de `contacto.js`.** El
  NAP de los datos estructurados sale de ahí, o el día que cambie la dirección
  tendremos dos.
- **El texto legal lo firma el abogado.** Aquí se prepara el andamiaje, los
  apartados y lo que la ley exige; la revisión y la firma son suyas.

### Casos límite

| Caso | Qué pasa |
|---|---|
| El cliente no da el NIT ni el plazo de conservación | Las páginas legales quedan con el marcador visible. **No se inventan**: un NIT falso en una política es peor que no tenerla |
| No hay perfiles de redes reales | `sameAs` se omite. Un `sameAs` a la cuenta de TikTok sería decirle a Google que ese es el bufete |
| El cliente no quiere analítica con cookies | El plan deja la salida: Search Console sola, que no toca al visitante |

### Lo que decide si está bien hecho

- `sitemap-index.xml` existe, es válido y lista las páginas reales.
- Cero enlaces internos rotos.
- Un `<h1>` por página.
- Los datos estructurados pasan la prueba de Google sin avisos.
- Ninguna descripción pasa de 160 ni baja de 120.
- El pie no enlaza a ninguna página inexistente.
