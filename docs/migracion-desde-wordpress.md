# Migración desde el WordPress actual

`candamilabogados.com` **ya está en producción** con un WordPress. Este
proyecto no es un lanzamiento: es un reemplazo, y eso impone un orden de
trabajo distinto.

Inventario tomado del `wp-sitemap.xml` del sitio en vivo.

## Qué hay publicado hoy

**152 URLs indexables.** De ellas, unas 140 son **contenido de demostración de
la plantilla** que nunca se limpió:

- `/home-2/` a `/home-7/`, `/sample-page/`, `/test-shortcode-page/`
- Catálogo de componentes del tema: `/buttons/`, `/accordions-and-toggles/`,
  `/animated-counters/`, `/separators/`, `/social-icons/`, `/parallax-sections/`…
- Una tienda completa sin usar: `/shop/`, `/cart/`, `/checkout/`, `/my-account/`
- 24 `/portfolio-item/…` en inglés: `child-welfare`, `copyrights`, `immigration`…
- 13 entradas de blog de 2015 en inglés sobre derecho estadounidense
- `/2022/04/06/hello-world/`

Esto no es neutro: es contenido pobre, ajeno y en otro idioma colgando del
dominio de un bufete colombiano. La migración es la ocasión de quitarlo.

## El contenido real

Diez páginas en español, que son las únicas que hay que rescatar:

| URL actual | Qué es | Destino propuesto |
|---|---|---|
| `/` | Portada | `/` |
| `/quienes-somos/` | Presentación del bufete | `/quienes-somos/` |
| `/contacto/` | Contacto | `/contacto/` |
| `/avaluos/` | **Peritaje y avalúos** | `/areas/avaluos/` |
| `/demandas/` | Demandas | `/areas/demandas/` |
| `/documentos/` | Documentos | por decidir |
| `/otros/` | Otros servicios | por decidir |
| `/planes/` | Planes y tarifas | `/planes/` |
| `/blog-candamil/` | Blog | `/blog/` |
| `/recibo/` | Recibo | por decidir |
| `/tarjeta/` | Tarjeta | por decidir |

`/avaluos/` confirma que el bloque **Perito avaluador** que construimos
corresponde a un servicio real, no inventado.

## Un enlace roto en el sitio actual

La portada enlaza a `/servicios/` y esa URL **devuelve 404**. Conviene
comprobar si hay más enlaces rotos antes de calcar la estructura.

## Plan de redirecciones

Cuando se haga el cambio, en `.htaccess`:

1. **Las diez páginas reales** → `301` a su nueva ruta.
2. **El contenido de demostración** → `410 Gone`, no `301`. Un 301 a la portada
   le dice a Google "esto se movió aquí" y arrastra señales de páginas basura;
   un 410 dice "esto ya no existe", que es la verdad y limpia el índice antes.
3. **Las entradas de 2015 en inglés** → `410`, salvo que alguna tenga enlaces
   entrantes que valga la pena conservar. Comprobar antes de decidir.
4. Enviar el `sitemap-index.xml` nuevo en Search Console el mismo día.

## Qué hace falta antes de poder desplegar

| | Estado |
|---|---|
| Teléfono y WhatsApp | **Inventados** (`+576041234567`, `573000000000`) |
| Correo y dirección | **Supuestos por mí**, hay que confirmarlos |
| Textos de las páginas | De ejemplo; los reales están en el WordPress |
| Fotografías | **22 marcadores, 0 fotos reales** |
| Base de datos de producción | Sin crear en cPanel |

## Contenido ya rescatado

**Hecho el 22-10-2026.** Las once páginas en español y 48 imágenes están en
`docs/contenido-wordpress/`. Ya no se pierde nada si se borra el WordPress.

Ver el `README.md` de esa carpeta: el rescate destapó que **el sitio construido
no refleja el negocio real** (catálogo de 15 servicios con precio y tres planes
de suscripción, no áreas de práctica genéricas).

## Orden recomendado

Se trabaja **en local** hasta que el proyecto esté maduro; el despliegue viene
después. Con eso en mente:

1. ~~Rescatar el contenido~~ — **hecho**.
2. **Ajustar el sitio al negocio real**: catálogo de servicios con precio y
   planes de suscripción. Es lo que más cambia y conviene decidirlo antes de
   construir el compositor, porque define qué bloques hacen falta.
3. **Procesar las imágenes rescatadas**: convertir los 15 iconos a WebP y
   colocar el retrato del abogado en el hero.
4. **Datos de contacto reales** (hoy el teléfono y el WhatsApp son inventados).
5. **Fase 1 de la spec 002**: acceso y biblioteca de imágenes. No necesita
   servidor; se construye y se prueba en local.
6. Fases 2 y 3 del compositor.
7. Despliegue a pruebas, cambio de producción con redirecciones.

El motivo del orden: construir un compositor de bloques antes de saber qué
bloques necesita el negocio real es empezar por el tejado.
