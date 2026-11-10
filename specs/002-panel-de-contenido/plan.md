# Plan Técnico — 002 Compositor de bloques

## La pieza central: el registro de bloques

Un único archivo describe cada bloque: cómo se llama, qué campos acepta, qué
variantes ofrece y qué componente lo pinta.

```js
// frontend/src/bloques/registro.js
export const BLOQUES = {
  cabecera: {
    nombre: 'Cabecera',
    descripcion: 'Titular grande con texto y foto',
    tono: 'oscuro',
    componente: 'Cabecera.astro',
    campos: {
      titulo:    { tipo: 'texto',   max: 90, requerido: true },
      destacado: { tipo: 'texto',   max: 40,
                   ayuda: 'Parte del titular que va en cursiva subrayada' },
      subtitulo: { tipo: 'parrafo', max: 240 },
      imagen:    { tipo: 'imagen',  ancho: 900, alto: 1100 },
      textoCTA:  { tipo: 'texto',   max: 30 },
      enlaceCTA: { tipo: 'enlace' },
    },
    variantes: {
      alineacion: { opciones: ['izquierda', 'centrada'], defecto: 'izquierda' },
    },
  },
  // …el resto del catálogo
};
```

**El mismo archivo alimenta las dos mitades del sistema:** el editor genera sus
formularios leyéndolo, y el renderizador decide qué componente invocar. Añadir
un bloque nuevo es escribir su componente y una entrada aquí; el editor lo
muestra solo, sin tocar su código.

## Por qué las variantes son seguras aquí

Las variantes de tono funcionan porque **el sistema de diseño ya tiene cada
utilidad en pareja**, construida y verificada contra WCAG:

| Claro | Oscuro | Contraste verificado |
|---|---|---|
| `titular` | `titular-claro` | 12.3:1 / 15.6:1 |
| `etiqueta-seccion` | `etiqueta-seccion-clara` | 6.8:1 / 5.2:1 |
| `destacado` | `destacado-claro` | — |
| `btn-primario` | `btn-primario-oscuro` | 6.8:1 (+ filete de borde) |

Un bloque con variante de tono cambia de pareja de utilidades, no de colores
sueltos. **Regla innegociable: ninguna variante se ofrece en el editor sin
haber medido antes sus pares de color.** Si una combinación no llega a 4.5:1,
no entra en el catálogo.

## Modelo de datos

```sql
usuarios    (id, email UNIQUE, nombre, hash_clave, rol, activo, creado_en, ultimo_acceso)
sesiones    (id, usuario_id, hash_token, expira_en, ip, agente)
medios      (clave PK, archivo, ancho, alto, bytes, alt, actualizado_en, usuario_id)

paginas     (id, slug UNIQUE, titulo, meta_descripcion, es_landing_page,
             revision_publicada INTEGER NULL,   -- NULL = nunca publicada
             creada_en, actualizada_en)

revisiones  (id, pagina_id, creada_en, usuario_id, nota)
bloques     (id, revision_id, tipo, orden, variantes JSONB, datos JSONB)

plantillas  (id, nombre, descripcion, bloques JSONB)
auditoria   (id, usuario_id, accion, entidad, entidad_id, antes JSONB, despues JSONB, creado_en)
```

**Por qué revisiones y no editar en sitio:** resuelve de una vez tres cosas que
de otro modo serían tres mecanismos distintos —el borrador, la vista previa y
el poder deshacer—. Editar trabaja siempre sobre la revisión abierta; publicar
apunta `revision_publicada` a ella; la vista previa pinta cualquier revisión
por su identificador.

`datos` y `variantes` van en JSONB porque cada tipo de bloque tiene campos
distintos y el registro ya define su forma. Se validan contra el registro al
guardar, no contra el esquema de la base.

## Cómo se pinta una página

La ruta dinámica deja de saber nada del contenido: lee los bloques de la
revisión publicada, busca cada componente en el registro y lo invoca con sus
datos y sus variantes.

La portada deja de ser un caso especial: pasa a ser una página más, compuesta
de bloques, con exactamente el mismo aspecto que tiene hoy.

## Vista previa

`GET /_vista-previa/:revision` con un token de un solo uso pinta esa revisión
con **el mismo renderizador** que la página real, no con una aproximación.

El token caduca y la respuesta lleva `noindex`, para que un borrador no acabe
indexado en Google.

## Imágenes

El HTML dice siempre `/img/<clave>.webp`. El panel sobrescribe **ese archivo** y
Apache sirve los bytes nuevos en la siguiente petición: sin recompilar, sin
invalidar caché, sin pasar por Node.

- Redimensionado y conversión a WebP **en el navegador** (`canvas.toBlob`),
  antes de subir. Evita instalar `sharp` en cPanel —compilación nativa, la
  fuente de la mitad de los problemas en hosting compartido— y hace que al
  servidor llegue ya un archivo pequeño.
- El servidor valida igualmente: bytes de cabecera, tamaño y dimensiones.
- Escritura atómica (temporal + renombrado): nadie ve un archivo a medias.
- `Cache-Control: public, max-age=300, must-revalidate` en la carpeta.

Un bloque que pide imagen crea su clave al vuelo: `pagina-12-bloque-3`.

## Arquitectura de despliegue

Una sola aplicación Node bajo Passenger que atiende cuatro cosas:

| Ruta | Qué responde |
|---|---|
| `/` | Astro en modo SSR, montado como middleware del Express actual |
| `/api/*` | La API REST que ya existe |
| `/panel/*` | El editor, con sesión por cookie |
| `/_vista-previa/*` | Borradores |

Apache sirve `/img/`, `/fonts/` y `/_astro/` directamente, sin pasar por Node.

Astro va **dentro** del Express existente y no como segunda aplicación: cPanel
limita cuántas aplicaciones Node permite por cuenta, y así comparten proceso,
pool de PostgreSQL y configuración.

## El editor

HTML servido por el propio Node, con JavaScript mínimo y **sin paso de
compilación**. Pantallas:

1. **Entrar**
2. **Páginas** — listado con estado: publicada, con borrador, sin publicar
3. **Componer** — columna de bloques con arrastrar para reordenar, añadir desde
   el catálogo, eliminar, y el formulario del bloque seleccionado
4. **Imágenes** — biblioteca de las claves en uso
5. **Usuarios** y **Actividad** — solo `admin`

El aviso de ritmo vive aquí: si dos bloques consecutivos declaran el mismo
tono, aparece una nota junto al segundo. Informa, no bloquea.

## Seguridad

Un panel que acepta archivos y escribe en `public_html` es un objetivo goloso.
No negociables:

1. Hash de clave con **`scrypt` de `node:crypto`** —sin dependencias nativas—.
2. Sesión en cookie `httpOnly`, `Secure`, `SameSite=Lax`, con el token hasheado
   en base de datos para poder revocarla.
3. Límite de intentos de acceso por IP y por cuenta.
4. Token anti-CSRF en todo formulario.
5. Lista blanca de tipos de archivo verificada por **bytes de cabecera**, nunca
   por la extensión del nombre.
6. El nombre del archivo **lo decide el servidor**; el del cliente se descarta.
7. La carpeta de imágenes sirve solo imágenes: `.htaccess` sin PHP ni CGI.
8. El contenido de los bloques se escapa al pintar. El bloque de texto libre
   acepta HTML y por eso se **sanea contra una lista blanca de etiquetas**.
9. Solo por HTTPS.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Node no puede escribir en `public_html` | **Se comprueba en la fase 0, antes de construir nada** |
| Caída de Node = sitio caído | Caché HTTP de 60 s y vigilancia de `/api/health` |
| TTFB peor que con archivos planos | Caché en memoria de la revisión publicada, invalidada al publicar |
| Páginas sosas por mal uso del catálogo | Plantillas, aviso de ritmo y textos de ayuda en cada campo |
| El catálogo crece sin control | Un bloque nuevo exige componente, entrada en el registro y verificación de contraste |

## Entrega por fases

- **Fase 0 — Comprobación (medio día).** Validar en el cPanel real: permisos de
  escritura, memoria disponible y Astro SSR bajo Passenger. Si algo falla aquí,
  el plan cambia; construir antes sería especular.
- **Fase 1 — Acceso e imágenes.** Autenticación y biblioteca de imágenes.
  **El sitio sigue siendo estático.** Resuelve ya el encargo mensual del
  diseñador sin asumir todavía el riesgo del cambio de arquitectura.
- **Fase 2 — Bloques en base de datos.** Extraer el contenido de los diez
  componentes a props, escribir el registro, migrar la portada y pasar a SSR.
  **Sin cambio visible:** la portada queda igual, pero servida desde la base.
- **Fase 3 — El compositor.** Añadir, reordenar, eliminar, variantes, borrador,
  vista previa y publicar.
- **Fase 4 — Plantillas e historial.** Plantillas, página en blanco, revertir a
  una revisión anterior, gestión de usuarios.

La fase 2 es la que da miedo y por eso va aislada: **no cambia nada que el
visitante vea**, solo de dónde sale el contenido. Si algo se tuerce, se detecta
comparando la página con la de hoy.
