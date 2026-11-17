# Tareas de Implementación — Bloque de redes sociales

Estado al 11-11-2026: el bloque **se ve en la portada**, con tres cuentas de
prueba puestas desde el panel (`@tiktok`, la página de Meta y un vídeo
cualquiera de YouTube) para poder mirar la maqueta. **Hay que sustituirlas por
las del bufete antes de publicar en el hosting.**

Lo que sigue sin poder comprobarse aquí: **esta máquina filtra `tiktok.com` y
`connect.facebook.net`** —ni sale la petición—, así que esas dos incrustaciones
no se han visto montadas. Es, en cambio, una prueba involuntaria y valiosa del
caso «scripts de terceros bloqueados», que destapó que la fila se descuadraba.

## Datos y validación

- [x] **T1** — Tipo `url` en `sanearDatos`, con lista de dominios permitidos.
      Lo que no encaje se descarta y se conserva lo guardado.
- [x] **T2** — Limpieza de las URLs al guardar: fuera `?si=`, `?entry=` y demás
      parámetros de sesión. Extraer el ID de YouTube y reconstruir la URL de
      incrustación en el servidor.
- [x] **T3** — ~~Las URLs de los perfiles a `contacto.js`~~ → **al panel**, por
      decisión del cliente (11-11-2026). `contacto.js` queda de reserva. Ver
      AGENTS.md, «Las tres URLs se editan en el PANEL, y eso tiene un precio».
- [ ] **T3b** — **Los iconos de la barra superior siguen apuntando a `#`.** Es
      la deuda que deja T3: la barra lee `contacto.js`, que está vacío. Cerrarlo
      es llevar los datos de contacto a la base.

## Bloque

- [x] **T4** — Entrada `redesSociales` en `registro.js`: campos, tono y
      componente. El formulario del panel sale solo del registro.
- [x] **T5** — `RedesSociales.astro`: TikTok vertical a un lado; YouTube
      apaisado y fanpage al otro. En móvil, en columna.
- [x] **T6** — Las tres incrustaciones, cada una **con su enlace normal
      debajo**, para quien bloquee scripts de terceros.
- [x] **T7** — `012-redes-sociales.sql`: inserta el bloque nuevo y pone
      `visible = FALSE` en `cifrasYPreguntas`. **No lo borra.**

## Comprobación

- [x] **T8** — Mirado a 1920, 1440, 1024 y 390 px con cuentas de prueba. Sin
      desbordamiento horizontal en ninguno; en móvil apila en columna. A 1440,
      TikTok ocupa 384×448 y el vídeo 643×362. **Falta verlo con las
      incrustaciones montadas**, que aquí no cargan.
- [x] **T8b** — Arreglada la fila descuadrada cuando una incrustación no llega:
      clase `.reserva-red`, con prueba que la vigila.
- [ ] **T9** — Medir el peso y el LCP de la portada antes y después. Si el
      bloque mueve el LCP, aplicar la salida escrita en la spec.
- [x] **T10** — Comprobado **con los scripts de terceros bloqueados**, sin
      querer: la red de este equipo los filtra. Quedan los cuatro enlaces y, con
      la reserva puesta, ningún hueco roto.
- [x] **T11** — Suite `redes.test.mjs` (ver plan), con copia al empezar y
      devolución en un `finally`.
- [x] **T12** — Pasar las siete suites existentes: el bloque cambia la portada y
      `publicar`, `bloques` e `imagenes` la recorren.

## Documentación

- [x] **T13** — AGENTS.md: la deuda de los 0 KB de JavaScript, por qué el embed
      de perfil y no la Display API, y que el botón de «Me gusta» de Facebook
      está descontinuado desde el 10-02-2026.
- [x] **T14** — MEMORY.md y `docs/punto-de-control-visual.md` si cambia la línea
      base.

## Pendiente de decidir con el cliente

- [ ] **T15** — Si la política de privacidad debe mencionar a TikTok, YouTube y
      Meta como terceros que rastrean al visitante. No es decisión técnica, y
      el sitio recoge datos personales bajo la Ley 1581 de 2012.
