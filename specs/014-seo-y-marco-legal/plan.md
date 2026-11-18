# Plan Técnico

## 014 · SEO profundo y marco legal

### D1 · El sitemap con `@astrojs/sitemap`, no a mano

`robots.txt` ya anuncia **`sitemap-index.xml`**, que es exactamente el nombre
que genera la integración oficial. Alguien la dio por instalada y no lo
estaba; el archivo que el rastreador va a buscar lleva meses devolviendo 404.

Se instala la integración en vez de escribir el XML a mano porque mantiene
`lastmod` sola, se parte en varios archivos si el sitio crece y no hay que
acordarse de añadir cada página nueva. Es **dependencia de compilación**, no
de ejecución: no añade un byte a lo que descarga el visitante.

`site` ya está configurado en `astro.config.mjs`, que es su único requisito.

**El 404 se excluye.** Lleva `noindex` y aun así aparecería en el sitemap, que
es una contradicción que Search Console señala.

### D2 · Una sola entidad, descrita en serio

Hoy las siete páginas repiten el mismo `LegalService` con cuatro campos. Pasa
a haber **una** entidad con `@id`, en la portada, con todo lo que la búsqueda
local usa:

- `address` (`PostalAddress` completo), `geo`, `areaServed`
- `openingHoursSpecification`
- `telephone`, `email`, `image`, `logo`, `priceRange`
- `founder` (`Person`), `foundingDate`
- `sameAs` **solo cuando haya perfiles reales**

Las demás páginas la referencian por `@id` en vez de copiarla. Así hay una
entidad con señales fuertes, no siete débiles.

**Todo sale de `contacto.js`.** Es la misma regla del NAP: un dato de contacto
escrito dos veces acaba discrepando.

**Nada de `aggregateRating` ni `review`.** No hay reseñas que respalden eso, e
inventarlas es motivo de penalización —y, en un bufete, de algo peor—.

### D3 · Analítica: Search Console primero, GA4 después y con consentimiento

Son dos cosas distintas y conviene no mezclarlas:

| | Qué da | Coste |
|---|---|---|
| **Search Console** | Qué busca la gente, qué posición tiene cada página, errores de rastreo | **0 KB, 0 cookies, 0 datos del visitante.** Se verifica con un archivo o un registro DNS |
| **GA4** | Audiencia, recorrido, conversiones | ~50 KB de JavaScript, cookies e identificadores que viajan a Google |

**Search Console es la herramienta de SEO.** GA4 es de audiencia. Para
«optimización profunda en SEO», la indispensable es la primera, y no cuesta
nada ni legalmente ni en peso.

GA4 **rompe los 0 KB de JavaScript del sitio público**, que es un principio
declarado del proyecto, igual que lo rompió el bloque de redes. Es deuda
asumible si se paga con las mismas condiciones que aquella: se carga
`defer`, no bloquea el renderizado y no decide el LCP.

Y **requiere consentimiento**: la Ley 1581 pide autorización previa, expresa e
informada para tratar datos personales, y un identificador de analítica lo es.
Por eso GA4 va detrás de un aviso con aceptación, y **sin aceptación no se
carga el script** —no basta con cargarlo y «respetar» la decisión después—.

Orden: Search Console ya; GA4 cuando el cliente tenga la propiedad creada y
decida sobre el aviso.

### D4 · El marco legal: tres piezas, no una

El pie ya enlaza tres y solo existe una.

1. **Política de privacidad** (existe). Está bien escrita y es **fiel a lo que
   el sitio hace**: lo verifiqué apartado por apartado contra el HTML
   compilado. Le faltan los dos datos del cliente y le faltará el apartado de
   analítica cuando se añada.
2. **Política de Tratamiento de la Información** (`/tratamiento-de-datos/`).
   Es la que el **Decreto 1377 de 2013, art. 13** exige a todo responsable, y
   no es lo mismo que el aviso de privacidad: debe incluir finalidades,
   derechos del titular, el canal para ejercerlos, el procedimiento de
   consultas y reclamos y la fecha de entrada en vigencia.
3. **Términos y condiciones** (`/terminos-y-condiciones/`). Aquí va lo que a
   un bufete le importa de verdad: que el contenido es divulgativo, que **no
   crea relación abogado-cliente**, y la propiedad intelectual.

**Lo que NO se inventa:** el NIT y el plazo de conservación. Un dato
tributario falso en una política es peor que el marcador.

### D5 · Las seis páginas de área (propuesta, decide el cliente)

Es **la pieza de SEO con más recorrido** y contradice la decisión de ayer, así
que no se ejecuta sin que el cliente lo diga.

Qué ganaría: seis URLs con su título, su descripción y su contenido,
compitiendo por «abogado laboral Tuluá», «sucesiones Valle del Cauca»,
«restitución de inmueble», etc. Hoy hay **una** página para las seis materias.

Qué cuesta: redactar seis textos con fondo. El material de partida está en
`areas.js` —un subtítulo por área— y es claramente insuficiente: con 90
caracteres no se hace una página.

Cómo encajaría sin deshacer lo de ayer: la ficha **sigue abriéndose**, y en el
panel, junto al botón de WhatsApp, aparece un «Ver todo sobre esta área» a su
página. No se quita nada.

### D6 · Un solo `<h1>` en la portada

Las tres láminas llevan `<h1>` porque cada una es el titular de su pantalla.
Para un lector de pantalla no hay problema —las inactivas van
`visibility: hidden` y salen del árbol de accesibilidad—, pero **en el HTML
hay tres**, y un rastreador los lee todos.

La primera lámina conserva el `<h1>`; las otras dos pasan a `<p>` con las
mismas clases. **No cambia un píxel** y deja un solo encabezado de primer
nivel. Hay que comprobarlo con la línea base visual.

### Orden de ejecución

1. Sitemap + `robots.txt`.
2. Limpieza: `preconnect` a localhost, descripciones, el bug de
   «Valle del Cauca» duplicado.
3. Datos estructurados.
4. `<h1>` único.
5. Enlaces rotos: las dos páginas legales nuevas los reducen de 7 a 5.
6. Search Console.
7. Lo que depende del cliente: NIT, plazo, perfiles reales, GA4, D5.

### Cómo se comprueba

- `herramientas/visual.mjs comparar` antes y después: **cero diferencias**
  esperadas salvo donde el cambio sea de texto visible.
- La auditoría del taller (`auditoria-seo.mjs`), que da títulos, descripciones,
  encabezados y datos estructurados de las siete páginas de un vistazo.
- El contador de enlaces rotos (`rotos.mjs`).
- El JSON-LD, validado contra el validador de Google antes de dar por bueno.
