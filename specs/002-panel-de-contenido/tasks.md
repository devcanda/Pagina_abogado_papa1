# Tareas — 002 Compositor de bloques

## Fase 0 — Comprobación en el servidor real (medio día)

Sin esto, todo lo demás es especulación.

- [ ] T0.1 ¿Puede el proceso Node escribir en `~/public_html/img/`?
- [ ] T0.2 ¿Cuánta memoria concede cPanel a la aplicación Node?
- [ ] T0.3 Levantar un Astro SSR mínimo bajo Passenger y comprobar que responde.
- [ ] T0.4 Medir el TTFB real de una página servida por Node desde el hosting.
- [ ] T0.5 Confirmar que `.htaccess` puede excluir `/img/` del enrutado a Node.

**Si T0.1 falla:** las imágenes van a una carpeta propia servida por Node, con
caché agresiva. **Si T0.3 falla:** se vuelve al plan de recompilar en servidor
y las fases 2 y 3 cambian por completo.

## Fase 1 — Acceso e imágenes

El sitio sigue siendo estático. Esta fase resuelve ya el encargo mensual.

### Base de datos
- [x] T1.1 Migración: `usuarios`, `sesiones`, `medios`, `auditoria`.
- [x] T1.2 Sembrar `medios` con las 17 imágenes actuales.
- [x] T1.3 Crear el primer `admin` por script, nunca por formulario abierto.

### Autenticación
- [x] T1.4 Hash con `scrypt` de `node:crypto`, comparación en tiempo constante.
- [x] T1.5 Sesiones en cookie `httpOnly` + `Secure`, token hasheado en base.
- [x] T1.6 Middlewares `exigirSesion` y `exigirRol`.
- [x] T1.7 Límite de intentos de acceso por IP y por cuenta.
- [x] T1.8 Token anti-CSRF en los formularios.

### Imágenes
- [x] T1.9 Redimensionado y conversión a WebP en el navegador (`canvas.toBlob`).
- [x] T1.10 `PUT /api/admin/medios/:clave` con límite de tamaño.
- [x] T1.11 Validación por bytes de cabecera, no por extensión.
- [x] T1.12 Escritura atómica con el nombre que decide el servidor.
- [ ] T1.13 `.htaccess` de la carpeta: sin PHP ni CGI, caché de 300 s.
- [x] T1.14 Registrar cada sustitución en `auditoria`.

### Panel
- [x] T1.15 Pantalla de acceso.
- [x] T1.16 Biblioteca de imágenes: miniatura, dónde aparece, tamaño exigido.
- [x] T1.17 Vista previa de la imagen y su peso final antes de confirmar.
- [x] T1.18 Mensajes de error comprensibles para alguien que no es técnico.

### Validación
- [x] T1.19 Sustituir una imagen y verla en el sitio sin recompilar.
- [x] T1.20 Subir un `.php` renombrado a `.webp` y comprobar el rechazo.
- [x] T1.21 Subir 20 MB y comprobar que se corta antes de leer el cuerpo.
- [x] T1.22 Comprobar que sin sesión ningún endpoint del panel responde.

## Fase 2 — Bloques en base de datos (sin cambio visible)

- [x] T2.1 Escribir `frontend/src/bloques/registro.js` con el catálogo inicial.
- [x] T2.2 Mover los diez componentes a `components/bloques/` y extraer **todo**
      su contenido a props; cero texto codificado.
- [ ] T2.3 Añadir a cada componente las variantes que declare el registro.
- [ ] T2.4 **Medir el contraste de cada combinación de variantes** y descartar
      del catálogo las que no lleguen a 4.5:1.
- [x] T2.5 Tablas `paginas` (ampliada), `revisiones` y `bloques`.
- [x] T2.6 Migración de datos: la portada actual y `src/data/inicio.js` pasan a
      filas de `bloques`.
- [x] T2.7 Renderizador: `[...slug].astro` pinta desde el registro.
- [ ] T2.8 Astro a `output: 'server'` con `@astrojs/node` en modo middleware.
- [ ] T2.9 Montar Astro dentro del Express existente.
- [ ] T2.10 Caché en memoria de la revisión publicada, invalidada al publicar.
- [ ] T2.11 Cabeceras `Cache-Control` y `ETag` en las páginas.
- [x] T2.12 Retirar `src/data/inicio.js`.

### Validación de la fase 2
- [x] T2.13 **Comparar la portada con la de hoy**: debe ser idéntica.
- [x] T2.14 Verificar que sigue enviando **0 KB de JavaScript**.
- [ ] T2.15 Comparar el TTFB antes y después y dejarlo anotado.
- [x] T2.16 Comprobar que no hay desbordamiento horizontal a 360 px.

## Fase 3 — El compositor

- [ ] T3.1 Listado de páginas con su estado.
- [ ] T3.2 Pantalla de composición: columna de bloques y formulario del activo.
- [x] T3.3 Formularios generados automáticamente desde el registro.
- [x] T3.3b **Las imágenes se editan dentro del formulario**, junto al texto al
      que acompañan: miniatura, desplegable de huecos de la misma medida y
      botón de sustituir. La rejilla de arriba queda solo para lo que el
      formulario no pinta. Prueba: `backend/.pruebas/imagenes.test.mjs`.
- [x] T3.3c **Colores por lámina y fondo de la franja** (migración `009`). El
      contraste se mide contra el fondo elegido, no contra el tono congelado.
      Prueba: `backend/.pruebas/colores.test.mjs`.
- [x] T3.3d **Imagen de fondo por lámina**, con velo regulable (migración
      `010`). Prueba: `backend/.pruebas/fondos.test.mjs`, que incluye la subida
      real desde el navegador.
- [x] T3.3f **Imagen de fondo VERTICAL para móvil** (`imagenFondoMovil`,
      migración `011`), servida con `<picture>` + `<source media>`. El fondo
      apaisado solo enseña el 32–39 % de su ancho en el teléfono.
- [x] T3.3e **Color del rótulo por lámina** (`colorEtiqueta`). Hace falta
      porque sobre una foto de fondo el rojo de marca no alcanza el mínimo de
      contraste por oscura que se ponga.
- [ ] T3.4 Añadir bloque desde el catálogo, con descripción y tono.
- [ ] T3.5 Reordenar arrastrando; eliminar con confirmación.
- [x] T3.6 Selector de variantes por bloque.
- [ ] T3.7 Aviso de ritmo cuando dos bloques consecutivos comparten tono.
- [x] T3.8 Guardado (por ahora sobre la revisión publicada; las revisiones
      como borrador siguen pendientes).
- [ ] T3.9 Vista previa en pestaña nueva, con token caducable y `noindex`.
- [x] T3.10 Publicar: recompila el sitio (spec `005`).
- [ ] T3.11 Crear página: slug, título, SEO, si es landing.
- [ ] T3.12 Validación de slug único y de formato.
- [ ] T3.13 Despublicar sin borrar.
- [x] T3.14 Saneado con lista blanca en el bloque de texto libre.

### Validación de la fase 3
- [ ] T3.15 Componer una landing nueva de principio a fin como lo haría ella.
- [ ] T3.16 Verificar que una landing sale con `noindex` y sin menú ni pie.
- [ ] T3.17 Comprobar que un borrador no es accesible sin token.
- [ ] T3.18 Intentar inyectar `<script>` en un bloque de texto libre.

## Fase 4 — Plantillas e historial

- [ ] T4.1 Tabla `plantillas` y dos iniciales: landing de campaña e informativa.
- [ ] T4.2 Crear página desde plantilla.
- [ ] T4.3 Crear página en blanco.
- [ ] T4.4 Historial de revisiones y volver a una anterior.
- [ ] T4.5 Pantalla de actividad consultable.
- [ ] T4.6 Gestión de usuarios y revocación de sesiones.
- [ ] T4.7 Manual de una página para quien va a usarlo.

## Qué decidir antes de empezar

- [ ] **D1** ¿Se construye la fase 1 y se evalúa, o se asume el plan completo?
- [ ] **D2** ¿Puede cambiar el **texto alternativo** de cada imagen? Importa
      para accesibilidad y para SEO; son dos campos más por imagen.
- [ ] **D3** ¿Las imágenes sustituidas se conservan o se sobrescriben?
      Conservarlas permite deshacer y cuesta espacio en disco.
- [x] **D4** RESUELTA (27-10-2026): **selector de color libre, sin bloqueo.**
      Decisión del cliente, tomada tras exponerle que rompe el AA del proyecto
      —el rojo de marca sobre navy da 2,01:1 frente al mínimo de 4,5:1— y que
      la alternativa de variantes cerradas y medidas ya existía en el registro.
      Se construye como pidió. Lo único que se conserva es el **contraste
      medido a la vista** junto al selector: informa, no impide guardar.
      Las variantes cerradas (`variantes` del registro) se mantienen para lo
      estructural: lado de la imagen, número de columnas, ancho del texto.

## Estado al 27-10-2026

Hechas de la fase 3: **T3.3** (formularios desde el registro), **T3.6**
(variantes), **T3.8** (guardado) y **T3.10** (publicar, vía spec `005`).

Más el apéndice de colores: campo `tipo: 'color'` con contraste medido a la
vista y sin bloqueo, según D4.

Comprobado de extremo a extremo con Chrome —formulario, guardar, publicar, HTML
servido— en `backend/.pruebas/editor.test.mjs`: 14/14.

**Queda de la fase 3:** listado de páginas (T3.1), pantalla de composición con
añadir y quitar bloques del catálogo (T3.2, T3.4), reordenar (T3.5), aviso de
ritmo (T3.7), vista previa con token (T3.9) y crear página (T3.11). Y la fase 4
entera: plantillas, historial y gestión de usuarios.
