# MEMORY.md - Estado Vivo del Proyecto (Máx. 50 líneas)

## Estado Actual
- Arquitectura base completa y probada de extremo a extremo (spec `001`).
- `backend/`: Express + PostgreSQL por capas (health, paginas, leads, chat).
- `frontend/`: Astro 5 + Tailwind 4. 4 páginas, 44KB CSS, **0KB de JS**.
- `Layout.astro` elige Corporativo o Landing según `pagina.es_landing_page`.
- **Portada**: hero, bufete, franja, áreas, cifras, perito, casos y cierre.
- **Serif de titulares** (Playfair autoalojada); utilidades en `AGENTS.md`.
- **Azul principal en ENSAYO: `#195BA9`**; valores anteriores en `global.css`.
- Base de desarrollo en Docker (`docker compose up -d`, puerto 5434).

## Decisiones y Aprendizajes
- **La portada se pinta desde la base**: `bloques` + `bloques/registro.js` +
  `Renderizador.astro`.
- **Los bloques guardan la CLAVE de la imagen, no la ruta** (ver `AGENTS.md`).
- **CORS solo en la API, nunca en el panel** (global rompía el acceso).
- **Punto de control visual:** `docs/linea-base/` + `herramientas/visual.mjs`;
  espera la fuente por su efecto, no por `fonts.ready`.
- **SSG, no SSR** (de momento): hay que recompilar para publicar.
  `es_landing_page` decide el layout; las landings llevan `noindex`.
- **Tailwind 4, trampas sin error de compilación** (se ven en el CSS, no en el
  build): `@apply` no acepta clases propias; el importante va como sufijo;
  `@apply ring-*` en `@utility` se descarta; sin usar no se emite.
- **La portada no usa `contenido`:** de `inicio` solo toma título y metadatos;
  `[...slug].astro` excluye ese slug.
- **Las capas CSS ganan a la especificidad:** lo no estratificado gana a toda
  capa; por eso la regla `:has()` del pie va fuera de `@layer`.
- **`API_BASE_PATH`:** si Passenger monta la app en `/api`, va vacía o las
  rutas quedan en `/api/api`. `trust proxy` activo o el rate limit ve una IP.
- **El logotipo NO se modifica** (ver `AGENTS.md`).
- **Contacto:** todo en `frontend/src/data/contacto.js`, **fuente única**:
  teléfono, WhatsApp, correo, dirección y enlace a la ficha de Google Maps.
  Tocarlos ahí y en ningún otro sitio: el NAP incoherente hunde el SEO local.
  Un solo acceso a WhatsApp por pantalla. Burbuja en el verde **oficial**
  `#25D366` con aro `#128C7E`: el aro da el contorno que el verde claro no
  tiene y **no se quita** (ver `AGENTS.md`).
  El glifo de WhatsApp es la **marca oficial**, no una aproximación.

## Entorno local
- El PostgreSQL del puerto **5432 es de Veeam Backup**: no usarlo ni tocarlo.

- **La cabecera son 3 láminas** (abogado · perito · laboral), sin JavaScript:
  radios ocultos + `:has()`. Lo oculto va con `visibility:hidden` para que no
  reciba foco. El `display:none` de los puntos va ANTES del `@supports` o no se
  ven. Relevo de 1,2 s, seis flechas (dos visibles por
  estado) y **pase automático** de 5 s por lámina, que funciona porque ningún
  radio nace marcado. Las animaciones van con propiedades LARGAS: la forma
  corta `animation:` reinicia `animation-play-state` y rompe el congelado. **Las
  anulaciones de `prefers-reduced-motion` tienen que repetir los selectores
  `:has()` enteros: una `@media` no añade especificidad.** Ver `specs/003-cabecera-slider/` y `AGENTS.md`.
- **El botón de pausa del slider se RETIRÓ** a petición del cliente
  (27-10-2026). Es una deuda de accesibilidad consciente: el pase automático se
  queda sin control rotulado para pararlo y el bloque baja del AA (WCAG 2.2.2).
  Queda que pulsar un punto o una flecha lo detiene para siempre, que
  `prefers-reduced-motion` lo apaga y que `:focus-within` lo congela. **No
  reponerlo sin hablarlo**: se quitó a sabiendas.

- **El panel se organiza por BLOQUES** (`/panel/bloques`), no por imágenes
  sueltas, y cada bloque se enciende y apaga (`bloques.visible`, solo `admin`).
  El agrupado se deduce del JSON de los bloques.
- **«Publicar cambios» recompila el sitio** desde el panel (spec `005`). El
  candado es una fila de `publicaciones`, no una variable. Se compila en un
  taller **fuera** del proyecto de Astro y en el mismo volumen que `dist/`, y
  los renombrados llevan reintentos: dentro del proyecto, el vigilante de Vite
  bloquea el renombrado en Windows y publicar no funciona con `astro dev`
  levantado.
- **Los formularios del panel se generan desde `registro.js`**, importado tal
  cual desde el backend. Los nombres llevan la ruta (`laminas.1.titulo`). Lo que
  el formulario no envía —los campos de `reserva`— lo conserva `conciliar()` en
  el servidor, o se borraría. **Colores de texto LIBRES** (D4), con el contraste
  a la vista pero sin bloquear; validados contra `^#[0-9a-f]{6}$` porque acaban
  dentro de un `style`.
- **Cada foto se edita DENTRO del formulario de su bloque** (27-10-2026), junto
  al texto al que acompaña: miniatura, desplegable para apuntar a otro hueco de
  la misma medida y botón de sustituir. La rejilla de arriba solo enseña lo que
  el formulario no pinta. Las claves se validan dos veces: la forma en
  `sanearDatos`, la existencia en `conciliar()`. El desplegable nunca ofrece
  `prueba-*`.
- **Los colores del slider van POR LÁMINA** (27-10-2026, migración `009`); el
  **color** de fondo (`colorFondo`) y la **cuña** (`colorCuna`) son del bloque
  entero. `papel: 'fondo'` hace que ese campo no mida su propio contraste y que
  los demás midan el suyo **contra él, en vivo**.
- **La lámina 1 del hero es DERECHO LABORAL** (03-11-2026, decisión del
  cliente): orden laboral · bufete · perito. Lleva fondo propio tratado en
  duotono navy desde `HOMBRE-TRAJE.jpg` de la web vieja, y su rótulo va en
  claro (`colorEtiqueta`) porque **sobre foto el rojo de marca cae a 2,31:1**:
  para llegar a 4,5:1 el fondo tendría que ser casi negro. El orden y las fotos
  son CONTENIDO y se cambian desde el panel.
- **El fondo de la lámina llega hasta debajo de los mandos** (03-11-2026): la
  lámina no lleva `relative`, así la capa se ancla al contenedor. Obligó a
  subir `.cabecera-mandos` a `z-index: 10` o las flechas quedaban tapadas.
- **El botón de conversión dice «Consulta ahora»**, no «Consulta gratuita»
  (03-11-2026). El campo de RESERVA del bloque no se puede cambiar desde el
  panel —`conciliar()` lo protege a propósito—, así que ese fue por SQL.
- **La lámina laboral lleva foto de ingenio de caña** (05-11-2026), entregada
  por el cliente y guardada en `docs/imagenes-origen/` (la primera versión
  queda como `-v1`). **No se recorta: se CORRE a la derecha** hasta pegar el
  brazo del trabajador al canto, y el 15 % que queda a la izquierda se rellena
  con la MISMA escena muy desenfocada y oscurecida debajo (no un navy plano:
  ese bloque muerto rompía la estética), borde DESVANECIDO (420 px) y velo
  `medio`. El bloque de texto se sale del contenedor a la izquierda
  (`xl:-ml-12 2xl:-ml-20`) para ocupar esa penumbra; solo desde 1280 px, que es
  donde hay holgura, y a cambio deja de alinearse con el logotipo. Lo oscuro de
  la izquierda sale de dos sitios —el velo y la base desenfocada— y se regulan
  por separado. **Se probó a aclararla y el cliente la quiso de vuelta**
  (05-11-2026): el contraste medido daba 19:1 y aun así el titular blanco se
  apoyaba peor. El número dice si se PUEDE leer, no si se lee cómodo. No
  aclararla sin hablarlo. Así la cara del abogado queda al
  48–60 %, libre del titular, sin tener que estrechar la foto. Recortando no
  había salida: estrechar acercaba la escena y ensanchar metía la cara bajo el
  texto. **Se quitó el retrato recortado** de esa lámina. El velo es ahora
  DEGRADADO desde `md` y plano en móvil. Las flechas y los puntos llevan disco
  y aro oscuros propios: sobre una foto no se puede confiar en el fondo.
- **Para probar encuadres: `herramientas/previsualizar-fondo.mjs`**. Monta cada
  recorte en la cabecera real, captura escritorio y móvil, y deja
  `docs/vista-previa-fondo.png`. Devuelve la imagen original en un `finally`.
  No pasa por el panel: el limitador de acceso se agota probando.
- **A 1440 y 1920 px se ve el 100 % del ancho del fondo**, así que recortar
  menos solo llega hasta usar el archivo entero. Si las figuras llenan la foto
  de origen, en la página se verán grandes y eso NO se arregla con el recorte:
  hay que pedir la foto más abierta.
- **Encargo de un fondo de cabecera: `docs/encuadre-fondo-hero.md`** y la
  plantilla visual `docs/encuadre-fondo-hero.png` (la genera
  `herramientas/plantilla-fondo-hero.mjs`). 1920×1080, 16:9 exacta, sin texto
  impreso y en color natural. **Lo importante va en x 944–1300, y 153–927**:
  es lo único visible en todas las pantallas y libre del texto. Los límites
  están MEDIDOS; si cambia el alto de la cabecera, hay que volver a medir.
- **Las fotos de fondo se tratan antes de subirlas** con `sharp` (viene con
  Astro, es herramienta de autoría, no dependencia del servidor): recorte,
  gris y rampa navy. 9 KB y el velo puede quedarse en «ninguno».
- **Cada lámina puede llevar IMAGEN de fondo** (`imagenFondo`, migración `010`,
  huecos `fondo-lamina-{1,2,3}` de 1920×1080). La capa va **dentro** de la
  lámina para heredar el fundido del carrusel sin tocar sus reglas `:has()`, y
  se saca a sangre con `100vw` + `translateX(-50%)`; la sección recorta. Lleva
  campo `velo` porque el contraste sobre una foto **no se puede medir** desde el
  panel. Si la lámina 1 tiene fondo, la figura recortada cede el
  `fetchpriority: high`.
- **La suite `fondos` borraba el fondo de la lámina 2** (06-11-2026): daba el
  hueco `fondo-lamina-2` por vacío y lo devolvía a su relleno de 1×1. Ahora
  guarda archivo y fila de `medios` y los repone, y toda la parte que escribe
  va en `try`/`finally` con las variables declaradas fuera del `try`.
  **Un hueco de imagen es contenido igual que un titular.**
- **El correo del panel es `publicidad@candamilabogados.com`**, no el de la
  cuenta del sistema. Las suites lo reciben en `CORREO`.
- **El proyecto ya se puede clonar en otro equipo** (10-11-2026): guía en
  `docs/puesta-en-marcha.md`. Lo que faltaba y se añadió: corredor de
  migraciones (`npm run db:migrar`), `.nvmrc`, `.gitignore` de raíz y las
  suites de `.pruebas/` dentro del repositorio. El `deploy/.htaccess` ya
  existía y se endureció: bloqueo de punto-archivos y de `.env`, cabeceras de
  seguridad y caché de imágenes bajada de 6 meses a 1 semana, porque el panel
  las sustituye conservando el nombre y media caché larga dejaba la foto vieja
  medio año.
- **`schema.sql` no basta para levantar la base**: solo trae 3 tablas. Orden
  obligatorio esquema → semilla → migraciones. El corredor nunca repite una
  migración y adopta las bases que ya estaban migradas sin ejecutarlas.
- **4321 = `npm run dev`; 4340 = `npm run preview`** (sitio compilado). Las
  herramientas y las pruebas usan el 4340; contra el de desarrollo las medidas
  salen mal porque Vite aún no ha aplicado los estilos.
- **La capa de fondo del hero se ancla a la LÁMINA, no al contenedor**
  (06-11-2026): la lámina lleva `transform` para el relevo y eso crea bloque
  contenedor aunque no haya `position`. Dejaba los 4rem de la fila de mandos
  sin foto —una franja de otro color bajo el carrusel, en las tres láminas—.
  Se estira con `--cabecera-mandos`, **exacto**, porque alargarla cambia el
  recorte `cover`. La banda visible a 1920px pasó de `156-924` a `133-947`.
  Lo vigila `fondos.test.mjs` a cuatro anchos.
- **Lo que está al pie de una foto de fondo no entra si va pegada abajo.**
  Hay que despegarla (`SUBIR`) y rellenar con la base. Así se ven los planos
  de la lámina 3.
- **La lámina 3 es «perito avaluador de muebles e inmuebles»** (06-11-2026):
  foto de despacho con maqueta y cinta métrica, misma receta, fundido de
  **48 % a 62 %** (su izquierda es pared blanca hasta el 40 %). Las tres
  láminas llevan ya foto de fondo, figura recortada ninguna, y un solo botón.
- **En el fondo vertical, solo recortar por ABAJO baja un objeto**: la tira va
  pegada al borde inferior, así que lo que quede debajo lo empuja hacia arriba.
  Parámetro `ALTO` de `herramientas/componer-fondo-hero-movil.mjs`.
- **Los rótulos (`etiqueta`) se truncan en silencio a 40 caracteres.** El panel
  lo impide con `maxlength`; un guion que escribe por la API, no. Lo que se
  escriba desde un guion hay que releerlo después de guardarlo.
- **El fondo de la lámina 2 va al 87 % y anclado abajo-derecha** (06-11-2026):
  a 1920 px el navegador solo enseña la banda `y 156-924` del lienzo y le
  cortaba la frente al abogado. Encogerla baja la cabeza a `y 210` sin moverla
  de la derecha; arriba cubre la base borrosa con 100 px de desvanecido.
  Guion: `herramientas/componer-fondo-hero.mjs`.
  **En sharp, `.png()` en cada paso intermedio**: desde un JPEG, `toBuffer()`
  devuelve JPEG, se pierde el alfa y el desvanecido sale negro macizo.
- **La lámina 2 es «su abogado de confianza»** (06-11-2026): foto de despacho
  con apretón de manos, misma receta que la 1 pero **sin correr la foto** (los
  sujetos ya están a la derecha) y con el fundido de **46 % a 66 %**, porque
  esa imagen es clara hasta el 48 % y el texto llega al 49 %. **El fundido se
  calcula por foto, no se copia.** En móvil lleva además un velo VERTICAL
  dentro del archivo, y el recorte arranca en el 32 % para bajar el apretón:
  ensanchar el recorte baja los elementos, recortar por arriba no.
- **En móvil la cabecera sirve otra imagen, vertical** (`imagenFondoMovil`,
  huecos `fondo-movil-*` de 800×1270, migración `011`), con `<picture>` +
  `<source media>` y `display: contents` en el `<picture>`. Hace falta porque
  en el teléfono solo se ve el 32–39 % del ancho del fondo apaisado y los dos
  personajes ocupan el 52 %: no entran, se mueva el encuadre donde se mueva.
- **`imagenes.test.mjs` llegó a DESTROZAR la portada** (05-11-2026): su
  comprobación de clave inventada manda láminas con `titulo: x/y/z` y borra
  todo lo demás; la devolución estaba suelta al final. Ya va en `finally`,
  igual que la de `colores.test.mjs`. **Toda prueba que escriba sobre un
  bloque real lleva `try`/`finally`.**
- **Ninguna prueba puede nombrar contenido** (orden de láminas, qué foto lleva
  cada una, cuántos campos de color hay). Reordenar el carrusel y añadir un
  campo puso en rojo 5 comprobaciones de 3 suites sin que nada estuviera roto.
  Se comprueba comportamiento y se leen los valores de la copia.
- **Un selector de atributo cuenta como una clase**: `.campo input[type=text]`
  (0,2,1) ganaba a `.fila-color .hex` (0,2,0) y el hexadecimal salía al 100%,
  empujando el contraste fuera de la ficha.
- **En el guion del panel no se puede escribir la etiqueta de cierre de
  `script`, ni en un comentario**: el navegador cierra el bloque ahí y el panel
  entero deja de responder. Pasó escribiendo el comentario que avisaba de ello.
  Misma familia que las comillas invertidas dentro de ese literal.
- **El panel tiene CSP propia con nonce.** La de `helmet` prohíbe el script en
  línea y tenía bloqueado TODO el JavaScript del panel, incluida la subida de
  imágenes. `img-src` necesita `blob:` o la subida falla.

## Pendientes / Próximos Pasos
- [ ] **`/contacto/` y `/areas/` NO existen**: los botones de la cabecera, el
      pie y el Sticky CTA apuntan ahí y dan 404. Solo hay `inicio`,
      `quienes-somos` y `demanda-laboral`.
- [ ] **El botón principal del hero apunta a `/contacto/`, que NO existe**: la
      llamada a la acción más visible del sitio da 404. Es el mismo pendiente
      de siempre, pero ahora está en la primera lámina.
- [ ] **Fotos propias para las láminas 2 y 3**: hoy las tres usan la misma
      (`hero-perito.webp` y `hero-laboral.webp` son copias de `hero-abogado`).
      Ya se cambian una a una desde el formulario de cada lámina en `/panel`:
      solo faltan las fotos.
- [ ] **ANTES DE DESPLEGAR: la clave del panel es `admin123`.** Puesta a
      petición del cliente para trabajar en local (27-10-2026). Es de
      diccionario y el panel publica en el sitio real. Cambiarla con
      `scripts/cambiar-clave.js <correo>` sin segundo argumento. El script la
      rechaza solo si `NODE_ENV=production`, así que no es una red fiable.
- [ ] **Se trabaja en LOCAL**; el despliegue va al final.
- [ ] **El sitio NO refleja el negocio real**: 15 servicios con precio y 3
      planes de suscripción. Rescatado en `docs/contenido-wordpress/`.
- [ ] Spec `002` **compositor**: 31/72. Hechas las fases 1 y 2. **Falta la
      pantalla de composición** (fase 3) y las plantillas (fase 4).
      El panel vive en `/panel`; usuarios por `scripts/crear-usuario.js`.
- [ ] **11 huecos con fotos reales** (`asignar-imagenes.mjs`, `--revertir`
      deshace). **La línea base visual ya NO coincide.** Las 6 de áreas llevan
      el título impreso y el recorte 3:4 lo corta: hacen falta sin texto.
