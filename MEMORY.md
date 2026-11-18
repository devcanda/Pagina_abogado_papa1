# MEMORY.md - Estado Vivo del Proyecto (Máx. 50 líneas)

## Estado Actual
- Arquitectura base completa y probada de extremo a extremo (spec `001`).
- `backend/`: Express + PostgreSQL por capas (health, paginas, leads, chat).
- `frontend/`: Astro 5 + Tailwind 4. 7 páginas, 44KB CSS, **0KB de JS**.
- `Layout.astro` elige Corporativo o Landing según `pagina.es_landing_page`.
- **Portada**: hero, bufete, franja, áreas, cifras, perito, casos y cierre.
- **Serif de titulares** (Playfair autoalojada); utilidades en `AGENTS.md`.
- **Azul principal en ENSAYO: `#195BA9`**; valores anteriores en `global.css`.
- Base de desarrollo en Docker (`docker compose up -d`, puerto 5434).

## Decisiones y Aprendizajes
- **Página `/quienes-somos/` implementada como ruta dedicada** (17-11-2026,
  spec `012`): excluye `'quienes-somos'` en `[...slug].astro` junto a `'inicio'`,
  rescata el linaje jurídico del fundador, biografía de Diego A. Candamil R.
  (`hero-abogado.webp`) y galería de 3 especialidades con selector por
  miniaturas en CSS puro (`GaleriaEspecialidades.astro`, radios + `:has()`,
  0 KB de JS), corrigiendo la descripción incompleta de *Asesoría Penal* que
  traía la web anterior.
- **Página `/contacto/` implementada** (17-11-2026, spec `011`): rescata el
  contenido humano, horarios (`8:00 a. m. – 6:00 p. m.`, lunes a viernes),
  teléfono fijo (`602 226 1303`), celular/WhatsApp, correo y mapa oficial de
  Google Maps de la web anterior, centralizados en `contacto.js` y con 0 KB JS.
  Resuelve el 404 del menú principal, pie, Sticky CTA y botón del hero.
- **Página `/areas/` implementada con catálogo completo** (17-11-2026, spec `010`):
  cuadrícula moderna de 3 columnas (patrón editorial de dos niveles: cabecera
  visual + cuerpo blanco de alta legibilidad sin truncar el texto descriptivo)
  con 15 servicios jurídicos y periciales (5×3), 3 planes de asesoría con
  tarifa ($100k, $120k, $150k), hero limpio sin migas de pan ni rótulo de
  sección, 0 KB de JS y enlaces directos de WhatsApp. Resuelve el 404 de la
  barra de navegación y del botón «Ver todas las áreas».
- **La portada se pinta desde la base**: `bloques` + `bloques/registro.js` +
  `Renderizador.astro`.
- **Los bloques guardan la CLAVE de la imagen, no la ruta** (ver `AGENTS.md`).
- **`/contacto/` existe desde el 17-11-2026** (spec `011`). La empezo otro
  agente y la termino Claude por decision del cliente; se comprobo que el
  archivo llevaba 11 min sin escrituras antes de tocarlo. **Ya no da 404.**
- **El correo del sitio es `contacto@candamilabogados.com`, DECIDIDO.** La web
  antigua publicaba `info@`; el cliente confirmo el 17-11-2026 que se queda
  `contacto@`. No volver a cambiarlo sin preguntarselo.
- **El mapa de `/contacto/` NO esta en la pagina de referencia**: lo anadio
  este proyecto y el cliente decidio conservarlo, **a sangre, al 100% del
  ancho**. Por eso va sin `.contenedor`, sin marco y sin esquinas redondeadas.
  **Sigue pendiente** nombrar a Google en la politica de privacidad: es un
  marco de terceros que carga sus scripts y sus cookies.
- **El parrafo de reputacion se RETIRO de `/contacto/`** el 17-11-2026, el
  mismo dia que se puso, a peticion del cliente. Era el de «Nuestra mejor
  carta de recomendacion...», con lo de auxiliar de la justicia y conciliador
  de las camaras de comercio de Tulua y Cali. **No es un descuido ni una falta
  de la calca: esta quitado a proposito.** El texto esta en el historial del
  archivo y en la web publicada.
- **La regla que pega el pie al contenido mira `[data-superficie]` con
  CUALQUIER valor**, no solo `oscura` (17-11-2026). En `/contacto/` la ultima
  seccion es gris humo y el `mt-20` del pie dejaba 80px de blanco. Marcar una
  seccion con `data-superficie` no es decorativo: ademas de cambiar el anillo
  de foco, pega el pie. Comprobado: solo cambio `/contacto/`.
- **El horario y el telefono de `/contacto/` van DEBAJO DE LOS BOTONES**, en
  la segunda columna, no al final de la tercera como en el original
  (17-11-2026, peticion del cliente). Llena el hueco de esa columna y junta las
  cuatro vias de contacto. La tercera sigue dando los datos en su lista.
- **Cuando un texto «se ve apagado» pero el contraste PASA, el problema es el
  tamano y la jerarquia, no el color** (17-11-2026, `/contacto/`). El parrafo
  del abogado daba 6,83:1 sobre el fondo humo —muy por encima del 4,5:1— y aun
  asi se perdia: iba a 15px (por calcar el original) y en el gris secundario
  siendo el texto principal de su columna. Se subio a 16px y a `tinta`
  (11,54:1). El gris suave queda para lo accesorio.
- **El bloque bajo el hero presenta AL ABOGADO, con su nombre** (17-11-2026,
  migracion `020`). Antes salia su retrato y el texto hablaba de «un abogado
  titular» en abstracto: **el bloque no decia quien era**. El texto pasa a
  PRIMERA PERSONA, como la pagina de contacto. Los datos salen de la biografia
  de la web anterior (`docs/contenido-wordpress/quienes-somos.md`): **Diego A.
  Candamil R., abogado especialista, ejerciendo desde el ano 2000**. No se
  inventaron.
- **Ajustes del bloque del abogado** (17-11-2026, migracion `021`): 26 anos
  —cuadra con «desde el ano 2000», no tocar uno sin el otro—, titular nuevo,
  tres puntos en vez de dos y el boton «Agenda ahora» llevando a WhatsApp.
- **El pie de la cifra dice «anos defendiendo sus derechos»** (18-11-2026,
  migracion `023`). Decia «anos de ejercicio», que describe la carrera del
  abogado; el nuevo describe lo que recibe el visitante. **Cabe JUSTO: el
  registro declara `max: 30` y la frase mide 29.** `sanearDatos` recorta sin
  avisar, asi que un caracter mas se publicaria cortado.
  Medido en la pagina: el pie pasa a 3 lineas (59px) y sigue por debajo de la
  cifra (72px en escritorio, 60 en movil), que es quien fija el alto de la
  fila; la chapa NO crecio y el texto no desborda sus 88px.
- **La portada se CONTRADICE en los anos y no se toco**: la chapa dice 26
  mientras las tres laminas del hero y la meta descripcion dicen «Mas de 20»
  (y la del perito, «Mas de 25»). Es contenido del cliente, no un fallo de
  codigo; esta avisado y pendiente de su decision.
- **El tercer punto ya NO promete consulta gratis** (18-11-2026, migracion
  `022`). Decia «La primera valoracion de su caso no tiene costo.» y dice «De
  el primer paso conociendo su panorama legal.». No es cosmetico: el bloque
  deja de comprometer por escrito un precio, y el punto deja de competir con
  el boton —invita a dar el paso en vez de anunciar una tarifa—.
- **`enlaceBoton` admite el valor especial `whatsapp`.** El componente lo
  resuelve con `enlaceWhatsApp()`. **No escribir el `wa.me/573165325335` en el
  contenido**: duplicaria el numero, que es el agujero del NAP ya cerrado.
- **El telefono de ese bloque va EN CAJA**, perfilado, junto al boton relleno.
  El filete va en `box-shadow` y no en `border`: un borde real suma 3px al
  alto y las dos cajas dejarian de medir lo mismo.
- **`textoConImagen` gano `nombre`, `cargo` y `altImagen`**, los tres
  opcionales. `nombre` y `cargo` se pintan en la chapa que monta sobre la foto
  Y componen el texto alternativo cuando `altImagen` esta vacio: la foto iba
  con `alt=""` y un retrato NO es decorativo.
- **Los tics y el icono del telefono de ese bloque pasaron a AZUL.** Iban en
  rojo, con el boton tambien rojo: tres rojos compitiendo y el boton dejaba de
  ser lo mas saliente. El rojo es solo para la accion.
- **Ese componente declaraba el TELEFONO por su cuenta** leyendo el `.env`:
  NAP duplicado, y ademas lo pintaba pegado («+573165325335»). Ahora sale de
  `contacto.js` y usa `telefonoLegible`.
- **El boton decia «Conocer al equipo»** mientras el texto vendia «atencion
  directa del titular, sin intermediarios», y el bloque de equipo esta
  retirado de la portada. Dice «Conocer mi trayectoria».
- **El texto corrido de ese bloque pasa a `text-tinta`.** La clase decia
  `tinta-suave` mientras el registro declaraba `#373435` (tinta) como color por
  defecto del campo: quien eligiera «el color por defecto» en el panel veia
  cambiar el texto sin haber cambiado nada.
- **Los titulares van en LORA desde el 17-11-2026**, no en Playfair Display
  (peticion del cliente). Playfair es una didona: a 72px brilla, pero a 24-32px
  —donde esta la mayoria de los titulares— sus remates de hilo se afinan y el
  titular pierde cuerpo. Lora tiene trazo parejo y esta dibujada para pantalla.
  Eje 400-700 (no se pierde peso: `font-bold` es 700), +1,4KB en total, los
  woff2 de Playfair **borrados**.
- **La LINEA BASE VISUAL de `docs/linea-base/` quedo invalida con el cambio de
  fuente.** Las siete capturas van a dar diferencias en todas partes porque
  cada titular del sitio se movio. Regenerarla **solo cuando el cliente de el
  diseno por bueno**, y anotarlo en `docs/punto-de-control-visual.md`.
- **El menu del header ya no tiene «Casos»** (17-11-2026). Apuntaba a `/casos/`,
  que devuelve 404. **«Blog juridico» sigue roto igual**, y aparece en la
  cabecera Y en el pie.
- **`/politica-de-privacidad/` EXISTIA COMO ENLACE Y NO COMO PAGINA** hasta el
  17-11-2026: el pie de las corporativas y el pie minimo de cada landing
  apuntaban ahi y la ruta devolvia **404**. Ya esta escrita.
- **La politica va como pagina ESTATICA, no como fila de `paginas`.** Un texto
  legal no debe poder cambiarse por descuido desde el panel: se versiona en
  git, con fecha y autor, que es lo que hay que poder demostrar si alguien
  reclama. Es la diferencia con «Quienes somos», que si vive en la base.
- **El contenido se escribio MIRANDO el sitio compilado, no de plantilla.**
  Comprobado: cero `<form>` en `dist/`, cero analitica (ni Analytics, ni Tag
  Manager, ni pixeles) y cuatro incrustaciones de terceros activas —Google
  Maps, YouTube (nocookie), TikTok y Meta—. `leads` y `chat_logs` existen en la
  base pero el bot no esta en el sitio, asi que el texto los describe EN
  FUTURO. **Si se anade un formulario o analitica, hay que volver a esta
  pagina.**
- **PENDIENTE DEL CLIENTE en la politica: el NIT y el plazo de conservacion.**
  Estan marcados con la palabra `PENDIENTE` dentro del texto publicado, a
  proposito, para que se vean y no se olviden. **No inventarlos.**
- **El texto legal lo tiene que revisar el abogado antes de publicar.** Lo
  redacto Claude mirando la Ley 1581 de 2012; no es asesoria juridica.
- **Las tres columnas de `/contacto/` van PLANAS, sin tarjeta** (17-11-2026).
  Marco, sombra y esquinas redondeadas eran una interpretacion; el original las
  pinta sobre el fondo gris. Rotulo en versales+negrita, botones al ancho de la
  columna (`boton-contacto`, no `btn`), etiquetas en tinta y valores en azul
  enlazados.
- **Los subtitulos de `/contacto/` NO van en cursiva** (17-11-2026). Estuvieron
  en Playfair cursiva calcando el original y se cambiaron a la sans del texto
  corrido, peso medio, azul de marca. Es la SEGUNDA vez que el proyecto tropieza
  con lo mismo (la primera, los titulares, el 13-11): la cursiva de Playfair es
  otro diseno, no la redonda inclinada, y debajo de un rotulo en versales y sans
  se lee como adorno. Lo que separa un rotulo de su linea de apoyo es el COLOR
  y el PESO, no una segunda familia tipografica.
- **En `/contacto/` solo UNO de los dos botones va relleno** (17-11-2026).
  WhatsApp lleno, correo PERFILADO (`boton-contacto-perfil`: blanco, filete y
  letra en `marino-600`). Con los dos llenos nada decia cual pulsar primero.
  El filete va en `box-shadow`, no en `border`: un borde real suma 3px al alto
  y los dos botones dejarian de medir lo mismo.
- **La sombra del boton de WhatsApp va en el MISMO `box-shadow` que su aro.**
  La propiedad es una sola: declararla dos veces pisa la primera y el boton se
  queda sin contorno.
- **El azul del original (`#2582f5`) NO se usa**: con texto blanco da 3,4:1 y no
  llega al 4,5:1 del AA del proyecto. Se usa `marino-600`.
- **`contacto.js` gano `departamento`, `pais`, `telefonoLegible` y
  `horario.horasCompactas`.** `direccion` YA termina en «Tulua», asi que
  pegarle `ciudad` detras repetia la ciudad. `horasCompactas` («8:00-18:00») es
  el MISMO horario en la notacion del original: si cambia el horario, cambian
  las dos lineas.
- **`/contacto/` es una CALCA de la pagina publicada**, no una version libre
  (peticion del cliente, 17-11-2026). Lo que se anada ahi tiene que estar en el
  original o ser una decision explicita suya: se retiro una frase de cierre
  inventada en la columna de WhatsApp por no estar en la referencia, y el
  titular volvio al tuteo («Contactanos»), que es el que usa el original.
- **Los avales del perito SE SALEN del ancho de la pagina por la derecha**
  (17-11-2026, decision del cliente tras exponerle las tres salidas). Margen
  derecho negativo `max(0px, (100vw - 72rem)/2 - 1rem)`. El logotipo pasa de
  90x45 a **114x57** —llego a 164 y el cliente pidio un 30% menos, topado con
  `max-width: 40rem` en la FRANJA, no en la pastilla—, pero **por debajo de
  1280 no gana nada** y la
  franja queda mas ancha que el resto del contenido. El borde izquierdo sigue
  a ras del titular y del boton.
- **Dentro del `.contenedor` solo hay 24 px libres a la derecha, a cualquier
  ancho.** El aire que se ve sobrar en pantallas grandes esta FUERA del
  contenedor. Es el numero que decide si una fila puede crecer o no.
- **La franja de clientes es una CINTA que se mueve sola, sin JavaScript**
  (17-11-2026). Grupo repetido 3 veces y desplazamiento de un tercio exacto;
  el hueco va en `margin-inline-end`, **nunca en `gap`**, o los tercios no
  cuadran y se ve un salto en cada vuelta. Duracion por tramo para que la
  velocidad sea la misma (~36 px/s medidos). Va **hacia la derecha**.
  **Segunda deuda de WCAG 2.2.2** del sitio, tras el carrusel de la cabecera:
  no hay control de pausa; con `prefers-reduced-motion` se apaga del todo.
- **Chrome en segundo plano CONGELA el reloj de las animaciones.** `playState`
  dice `running` y `currentTime` no avanza: medir el movimiento asi da 0 px/s
  siempre. Hace falta `Emulation.setFocusEmulationEnabled` +
  `Page.setWebLifecycleState: active`. Es la hermana del aviso de la carga
  diferida.
- **Los logotipos de clientes se igualan sobre la TINTA, no sobre el halo**
  (17-11-2026). El `trim({threshold:1})` se quedaba con el resplandor de los
  archivos, así que el área óptica salía «perfecta» (×1,01) mientras la tinta
  real iba ×2,23: Carmelita al 142 % y Dixtrital al 64 %. Ahora la caja se
  calcula con alfa ≥ 128 y 3 px de sangrado → 94 %–106 %. **La altura sigue
  variando a propósito**: igualar área es lo que hace que pesen lo mismo.
- **El ancho útil del `.contenedor` es 1104 px, no 1152.** Topa en 1152 pero
  lleva 24 px de margen interior por lado. Calcular una fila sobre 1152 la
  rompe por 28 px: pasó al agrandar los logotipos de clientes. El máximo para
  siete en fila es **144×72 px** con hueco de 1 rem.
- **`bloques.test.mjs` dejaba un bloque ENCENDIDO** (arreglado el 17-11-2026):
  probaba el interruptor sobre el id 7 clavado y «devolvía» encendiendo, así
  que al ejecutarla volvió a publicar «Casos resueltos», que el cliente había
  mandado ocultar. Ahora elige el bloque, lee su estado antes y lo repone en un
  `finally`. **Tras correr suites, comprobar `SELECT tipo, visible FROM
  bloques`.**
- **«Nuestros clientes» sustituye a la franja de cierre** (17-11-2026,
  migración `019`, spec `009`). Bloque nuevo `muroClientes`: tira horizontal
  con los siete logotipos de clientes de la web anterior, tinta blanca sobre
  navy, igualados por **área óptica** (23 000 px² en 320×160) con
  `herramientas/preparar-logos-clientes.mjs`, que además **quita un velo de
  alfa 38** que los originales traen en todo el rectángulo. Una fila de
  1024 px para arriba; 4+3 en tableta y 3+3+1 en teléfono.
  **La portada se queda sin botón final**: decisión del cliente, expuesta y
  tomada. El bloque viejo queda apagado, no borrado.
- **Un tipo de bloque nuevo obliga a REINICIAR la API.** El backend importa
  `frontend/src/bloques/registro.js` y lo guarda en memoria: guardar un bloque
  recién registrado da **409 «tipo que ya no existe»** hasta que se reinicia.
  El sitio compilado sí lo pinta, porque `astro build` relee el registro.
- **Los avales del perito van en UNA SOLA FILA desde el 17-11-2026** (petición
  del cliente): `flex-wrap: nowrap` + `flex: 1 1 0` + `aspect-ratio: 2/1`, sin
  los tramos de ancho de `.avales`. Medido a nueve anchos: una fila, sin
  desbordar, a ras del titular y del botón. **El precio está en el móvil**: a
  390 px el logotipo queda en 44×22 y la línea pequeña de cada sello deja de
  leerse. Es deuda consciente; se revierte solo en el teléfono devolviendo
  `flex-wrap: wrap` por debajo de `sm`.
- **«Casos resueltos» está APAGADO desde el 14-11-2026** (petición del cliente):
  `bloques.visible = FALSE` en el id 7, contenido intacto. Se vuelve a encender
  con un clic en `/panel/bloques`. Deja tres superficies oscuras seguidas
  —perito, franja de cierre y pie—; se sostiene porque el cierre es
  `marino-800` y estrecho, pero cualquier sección nueva que entre ahí va en
  claro.
- **El `destacado` de los titulares va en REDONDA desde el 13-11-2026.** El
  cliente pidió «la fuente de los titulares del slider» para el resto: la
  familia ya era la misma (Playfair 700 en los dos), lo que se veía distinto era
  la cursiva, que en Playfair es un diseño aparte y no la redonda inclinada. Se
  quitó `italic`; el subrayado rojo se queda. La cursiva del archivo sigue
  usándose en `FranjaTexto` y `FranjaCompromiso`: no se puede borrar el woff2.
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
- **Bloque de redes sociales IMPLEMENTADO** (11-11-2026): tipo `redesSociales`
  en el registro, `RedesSociales.astro`, migración `012`. Falta solo pegar las
  URLs reales. **Con las URLs vacías el bloque no pinta nada**, así que la
  portada tiene hoy una sección menos.
- **Astro NO tiene opción `preview` de primer nivel**: `astro preview` usa
  `server.port`. Mi clave `preview: {port:4340}` se ignoraba y las pruebas
  dieron verde contra un servidor levantado de antes. El 4340 va como
  `--port` en el guion de `package.json`.
- **Dos pruebas nombraban contenido** («los 8 bloques», «=== 8 editores») y se
  pusieron rojas al añadir el bloque. Ahora cuentan contra la base.
- **Bloque de redes sociales, especificado** (11-11-2026):
  `specs/006-redes-sociales/`. Sustituye a `cifrasYPreguntas`, que se OCULTA,
  no se borra. Decidido con el cliente: TikTok **automático** (embed de perfil
  oficial: hasta 10 vídeos recientes, sin clave de API ni aprobación; la
  Display API exigiría revisión de la app y OAuth del titular) y el bloque
  actual oculto entero.
  **El botón de «Me gusta» de Facebook está descontinuado desde el 10-02-2026**
  junto con el de comentarios; sobrevive el Page Plugin, que ya no documenta un
  contador total.
  **Este bloque rompe los 0 KB de JavaScript** del sitio: es deuda consciente,
  y la salida si pesa es pasar TikTok a vídeos elegidos a mano.
  **Bloqueado**: faltan las tres URLs del cliente (perfil TikTok, vídeo YouTube,
  fanpage Facebook).
- **Los iconos sociales de la barra superior apuntan a `#`**: nunca se
  configuraron. Las URLs van a `contacto.js`, fuente única, no al bloque.
- **No existe tipo `url` en `sanearDatos`** (hay `lista`, `grupo`, `opcion`,
  `imagen`, `color`). Hay que crearlo con lista de dominios permitidos: una URL
  acaba dentro del `src` de un `<iframe>`, mismo agujero que los colores.
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

- **El bloque de redes ya se ve, con cuentas de PRUEBA.** `@tiktok`, la página
  de Meta y un vídeo cualquiera, puestos desde el panel el 11-11-2026 para
  poder mirar la maqueta. **Hay que sustituirlas por las del bufete.**
- **Los tres campos se editan en el panel** desde esa misma fecha, por decisión
  del cliente; `contacto.js` queda de reserva. El precio está anotado en
  AGENTS.md: la barra superior sigue leyendo `contacto.js`, y sus iconos
  siguen en `#`.
- **Esta máquina filtra `tiktok.com` y `connect.facebook.net`.** Ni sale la
  petición (`000` en curl, cert inválido en Chrome). Las incrustaciones de esas
  dos no se pueden ver aquí; YouTube sí responde. No es un fallo del sitio.
- **`.reserva-red` sostiene la columna** cuando una incrustación no llega. Sin
  ella el marco se queda en 28px y la fila se descuadra, aunque el enlace de
  respaldo esté ahí.
- **Dos suites contaban errores de consola de TERCEROS** y daban falsos rojos
  según qué página tuviera abierta el Chrome compartido. Ahora filtran por
  origen.
- **`fondos.test.mjs` dependía de un PNG suelto en `$TMPDIR`** que nada crea:
  reventaba en cualquier otra máquina. Ahora lo genera.

- **El panel declara su icono** (`/favicon-32.png`). Sin él, Chrome pedía
  `/favicon.ico` y el servidor respondía 404: inofensivo, pero la suite de
  imágenes comprueba que la consola esté limpia y se ponía roja **según el
  perfil de Chrome** con que se abriera. En local lo sirve `app.js`; en
  producción, Apache.
- **Los respaldos de las pruebas van al temporal del SISTEMA**, no a `.`. En
  Windows no hay `TMPDIR`, así que `fondos.test.mjs` dejaba el respaldo y un
  PNG de 750KB sueltos dentro de `backend/`, visibles en `git status`.
- **Arrancar el proyecto tras un reinicio** pide cuatro cosas, y las pruebas
  fallan raro si falta alguna: Docker Desktop, la API (3000), `npm run preview`
  (4340) y **un Chrome con `--remote-debugging-port=9222`**. Sin el último, las
  suites que miden en el navegador no arrancan y `npm run probar` se corta tras
  las dos primeras sin decir por qué.

- **El bloque de redes lleva `py-6 lg:py-8`**, el 30 % del espaciado de las
  demás franjas (12-11-2026, pedido por el cliente). Medido: 112px → 32px en
  escritorio, 80px → 24px en móvil. Excepción deliberada al ritmo de la portada.
- **Un comentario JSX suelto antes del `<section>` no compila** dentro de
  `{hayAlgo && (…)}`: cuenta como segundo hijo. Las notas de ese componente van
  al bloque de encabezado.

- **La franja del perito admite foto de fondo** (`imagenFondo`,
  `imagenFondoMovil`, `velo`), y al ponerla **la figura con marco rojo se
  retira**: es opaca y tapaba justo donde iría la foto. Reversible con
  «— sin imagen —». Migración `013`, huecos `fondo-perito` (1920×1080) y
  `fondo-perito-movil` (1024×1536), los dos con el relleno de 1×1.
- **El velo de ese bloque es el ESPEJO del de la cabecera** y corta en `lg`, no
  en `md`: el texto está a la derecha y la sección pasa a dos columnas a
  1024 px.
- **`reservaSuperada()` entiende ahora cadenas**, no solo arrays.
- **La banda visible de un fondo depende del ancho**: a 1920 px `y 193-887`, a
  1440 px `y 75-1005`, y a 1024 px el recorte pasa a ser lateral
  (`x 199-1721`). Diseñar para la de 1920 cubre todas.
- **Chrome aquí NO dispara la carga diferida** con la ventana en segundo plano:
  cargan 0 de las 13 imágenes `lazy` de la portada. Si una captura sale sin
  foto, es esto, no el componente. Para capturar hay que forzar `eager`.
- **`publicar()` en una prueba tiene que esperar a VER arrancar la
  compilación**: la ruta responde 202 al coger el candado, no al terminar.
- **Para quitar un campo desde el panel hay que mandarlo en blanco**, no
  omitirlo: `conciliar()` conserva lo que no se envía.

- **La franja del perito YA lleva su foto** (12-11-2026): topógrafo con
  estación total y dron en campo. Origen en
  `docs/imagenes-origen/fondo-perito-campo.jpg`; las dos piezas se generan con
  `herramientas/componer-fondo-perito{,-movil}.mjs`. 75 KB y 85 KB.
- **Velo `fuerte`, elegido midiendo** con `herramientas/contraste-fondo.mjs`:
  es el mínimo que pasa 4,5:1 en MÓVIL (5,92:1). En escritorio da 6,65:1 y no
  apaga al topógrafo, porque ahí el velo es degradado.
- **La banda visible en móvil es `x 97-927`**, no `224-800`: cambió al quitar
  la figura, porque la sección pasó de 390×1040 a 390×721.
- **sharp NO soporta `mix-blend-mode` en SVG.** Un molde de tres degradados
  apilados sale opaco. Las máscaras se calculan píxel a píxel.
- **Capturar a 1920 px sale sin foto** aunque el DOM esté bien: es un límite de
  rasterización del navegador emulado. Con `deviceScaleFactor: 0.5` aparece.
  No es un fallo del sitio.

- **La franja del perito lleva una fila de 5 entidades certificadoras**
  (12-11-2026). Grupo `certificaciones` en el registro: nombre obligatorio,
  logotipo **320×160** y enlace opcional. Las cinco entidades están puestas con
  su nombre y su logotipo: ARAV, RAA, Lonja de Colombia, Aeronáutica Civil y
  Delta Force.
- **Sin logotipo, la casilla pinta el NOMBRE.** Es lo que permite ver la
  estructura antes de que lleguen los archivos, y evita huecos rotos después.
- **El panel ya sabe `ajuste: 'contener'`** además de cubrir. Antes recortaba
  siempre con `Math.max`, que a un logotipo le corta letras.
- **El rótulo de esa franja va en `marino-100`, no en rojo**: está sobre la
  foto y el botón rojo queda justo encima.
- **La franja de sellos va DENTRO de la columna de texto**, bajo el botón
  «Solicitar un avalúo», a ras del titular (13-11-2026). Comprobado al píxel a
  1920, 1440, 1280, 1024, 768 y 390.
- **Cada sello va en una PASTILLA clara de 160×80**, `border-radius: 999px`,
  todas iguales. La simetría la da la pastilla, no el logotipo; lo de dentro
  ya viene igualado por área óptica.
- **160×80 es la medida que deja caber tres por fila** en los ~520 px de la
  columna. Caen 3+2, y 2+2+1 en móvil y entre 1024 y 1151.
- **La última fila va centrada**, y para eso la lista lleva el ancho EXACTO de
  una fila llena (330 px para dos pastillas, 500 para tres) y
  `justify-content: center`: las filas completas no se mueven y la corta se
  centra. CSS no puede centrar solo la última línea.
- **El tope va por tramos y el de en medio es el raro:** 3 pastillas por
  debajo de `lg`, 2 entre 1024 y 1151, 3 desde 1152. La columna de texto no se
  ensancha de forma lineal.
- **La pastilla es `min(10rem, calc(50% - 0.3125rem))`**: a 360 px faltaban
  2 px para dos pastillas y los cinco sellos caían uno por fila.
- **El rótulo de esta franja va en negrita y CENTRADO sobre las pastillas**,
  excepción local a `etiqueta-seccion-clara`. El tope de ancho vive en el
  envoltorio `.avales`, no en la lista: así rótulo y sellos miden lo mismo y
  comparten centro.
- **Hubo tres diseños antes**, todos en el historial de
  `ServicioDestacado.astro`: cinco cajas blancas (rechazadas), un panel con
  filetes (retirado) y una cinta monocroma sin superficie (retirada el mismo
  día: obligaba a recolorear cinco marcas ajenas y dejaba los sellos
  pequeños).
- **Sin superficie clara no hay franja en color:** Aeronáutica Civil es tinta
  navy `#083888` y da 1,08:1 sobre este fondo. La pastilla es lo que permite
  que cada marca conserve su color.
- **La sección creció al meter los avales en la columna**: 1920×943 y
  390×1093. Las bandas visibles de los fondos se midieron con la sección más
  baja; hay que remedirlas antes de recomponer esas imágenes.
- **La `<ul>` de sellos lleva `data-certificaciones`**: la sección tiene otra
  lista antes y una prueba medía la equivocada.
- **La spec 008 se escribió DESPUÉS de implementar**, incumpliendo la regla 2.
  Anotado en la propia spec.
- **Texto del perito reescrito** (12-11-2026): 25 años en público y privado,
  inmuebles, bienes muebles y avalúos especiales, y piloto de dron certificado
  UAS. 309 caracteres, leídos después de guardar.
- **Apuntar una entidad a un hueco con su relleno de 1×1 deja la casilla
  VACÍA**: el componente cree que hay logotipo y deja de pintar el nombre. Pasó
  al tocar el texto. Lo vigila una comprobación que cuenta como vacía toda
  casilla sin texto cuya imagen mida menos de 4 px, **y se verificó que falla**
  —dos veces: primero inyectando el fallo en la página y, con los logotipos ya
  puestos, apuntando una entidad al hueco de 1×1 y recompilando.
- **Esa medición NO puede hacerse en el navegador.** Miraba `naturalWidth`, que
  vale 0 mientras la imagen no cargue, y los logotipos van en carga diferida:
  el día que llegaron, denunció cuatro casillas vacías que se ven perfectamente.
  Ahora el navegador devuelve la dirección y **la mide Node**, leyendo la
  cabecera del PNG o del WebP.
- **Una expresión regular con ventana de N caracteres se pone roja sola.** La
  que comprobaba `data-ajuste="contener"` buscaba dentro de 800 caracteres;
  creció el desplegable de huecos, la distancia pasó a 1101 y falló sin que
  nada estuviera mal. Se busca dentro del campo, no a tantos caracteres.
- **La franja es UN panel, no cinco cajas** (12-11-2026). Las cinco cajas
  blancas de esquina recta las rechazó el cliente: leían como parches pegados
  sobre el diseño. Ahora es una sola pieza con esquinas suaves, sombra y
  filetes de 1 px, que son el fondo del panel asomando por un `gap: 1px`. El
  fondo claro no era negociable —marcas ajenas pensadas para blanco—; la forma
  sí lo era.
- **Los logotipos se igualan por ÁREA óptica, no por altura.** Cuatro son
  apaisados y el de Aeronáutica Civil es apilado: contenidos por alto, ese se
  veía mucho más pequeño. La herramienta los coloca a 30 000 px² sobre un
  lienzo de 320×160. **El lienzo es solo el marco**; si el CSS volviera a
  ajustar cada imagen a su caja desharía la normalización.
- **La medida tiene que coincidir en el registro y en `medios`**, o el
  desplegable del panel se queda sin huecos que ofrecer.
- **Los logotipos los prepara `herramientas/preparar-logos-certificacion.mjs`**,
  no se suben crudos: quita el fondo blanco por inundación desde los bordes
  —con pila explícita, que el de Delta Force son 22 millones de píxeles—,
  recorta y contiene en el lienzo del hueco.
- **El logotipo de Aeronáutica Civil llegó primero en NEGATIVO** (63 % tinta
  blanca, 33 % navy `#082858`): 1,03:1 sobre la superficie clara y 1,08:1 sobre
  navy, invisible en ambos. Se publicó sin logotipo, enseñando el nombre, y el
  cliente entregó la versión positiva el mismo día. **El camino del nombre no
  se quita** aunque ya no haga falta: es lo que evita un cuadro roto el día que
  falte un archivo.
- **`fondos.test.mjs` nunca tuvo la espera de publicación.** Comprobaba
  `disabled` en la misma vuelta del `click()`, así que salía a la primera y
  medía el `dist/` anterior. Colaba casi siempre; el día que no, dieron DIEZ
  rojos describiendo una página sin estilos —sección de 6300 px, 1928 px de
  desbordamiento—, que es cómo se ve leer el árbol a medio cambiar. Arreglada
  igual que en `perito` y `redes`: esperar a verla ARRANCAR y luego a que
  acabe.
- **La API pública devuelve las claves de imagen RESUELTAS a ruta.** Reenviar
  ese objeto al panel sin devolverlas a su clave descarta las fotos.

## Pendientes / Próximos Pasos
- [ ] **Faltan las URLs reales de las redes del bufete**: TikTok, la fanpage de
      Facebook y el vídeo de YouTube. Hasta que lleguen, la portada enseña
      cuentas de prueba que no son del cliente.
- [ ] **Los iconos de la barra superior siguen en `#`** (LinkedIn, Instagram,
      Facebook). Se cierra llevando los datos de contacto a la base.
- [ ] **Ver el bloque con las incrustaciones montadas** en una red que no
      filtre TikTok ni Meta, y medir si mueven el LCP de la portada.
- [x] **`/contacto/` y `/areas/` IMPLEMENTADAS** (17-11-2026, specs `010` y `011`):
      ya no dan 404 desde el menú, pie, Sticky CTA ni botones del hero.
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
