# Cómo cambiar imágenes y textos

Guía práctica de operación del sitio. Todas las rutas son relativas a la raíz
del proyecto.

---

## Antes que nada: hay que recompilar

El sitio es **estático**. El contenido se resuelve cuando se compila, no cuando
alguien visita la página. Eso es lo que lo hace rápido, y la contrapartida es
que **ningún cambio se ve hasta recompilar**, ni siquiera los que se hacen en la
base de datos.

```bash
cd frontend
npm run build          # genera dist/ con el sitio ya resuelto
```

Para trabajar viendo los cambios al instante:

```bash
cd backend  && npm run dev     # API en el puerto 3000
cd frontend && npm run dev     # web en el puerto 4321
```

En desarrollo se ve todo al instante: el **texto en código** al guardar el
archivo, y el de la **base de datos** al recargar el navegador. No hace falta
reiniciar nada. (Comprobado: `UPDATE` en PostgreSQL + F5 y el cambio aparece.)

Donde sí hay que recompilar es para **publicar**. El sitio que se sube a cPanel
son archivos planos: mientras no se vuelva a compilar, el visitante sigue viendo
la versión anterior aunque la base de datos ya tenga el texto nuevo.

---

## Imágenes

Todas viven en `frontend/public/img/`. Lo que pongas ahí se publica tal cual.

### Formato y peso

Usa **`.webp`**, no `.jpg` ni `.png`, para las fotografías: pesa la mitad con la
misma calidad. Respeta las medidas de la tabla: si subes una foto de 4000px la
página irá lenta aunque se vea bien.

Todos los archivos `.svg` que hay ahora son **marcadores de posición**: fondo
azul con una etiqueta que dice qué va en su lugar y a qué tamaño.

### Dónde se cambia la ruta de cada imagen

| Imagen | Tamaño | Dónde se indica la ruta |
|---|---|---|
| Foto del hero (portada) | 900×1100 | `frontend/src/components/inicio/Hero.astro`, línea 12 |
| Foto del despacho | 700×900 | `frontend/src/components/inicio/SobreBufete.astro`, línea 13 |
| Ilustración del perito | 900×680 | `frontend/src/components/inicio/PeritoAvaluador.astro`, línea 24 |
| Las 6 áreas de práctica | 600×800 | `frontend/src/data/inicio.js`, campo `imagen` de cada área |
| Los casos | 600×380 | `frontend/src/data/inicio.js`, campo `imagen` de cada caso |
| Cabecera de las demás páginas | 1600×700 | **Base de datos**, columna `paginas.imagen_hero` |

### Ejemplo: cambiar la foto del hero

1. Guarda tu foto como `frontend/public/img/hero-abogado.webp`.
2. Abre `frontend/src/components/inicio/Hero.astro` y cambia la línea 12:

```diff
-  imagen = '/img/hero-abogado.svg',
+  imagen = '/img/hero-abogado.webp',
```

3. `npm run build`.

> Hay que tocar la línea porque cambia la extensión. Si guardas el archivo con
> **exactamente el mismo nombre y extensión** que el marcador, no hace falta
> tocar nada; pero eso solo sirve si tu imagen también es `.svg`.

### Imágenes que NO debes tocar

`logo-horizontal-*.png`, `og-imagen.png` e `icono-512.png` se generan a partir
de los archivos de marca en `frontend/marca/`. Si cambias el logotipo, hay que
regenerarlas (ver `AGENTS.md`), no editarlas a mano.

`certificado.svg` ya no se usa en ninguna parte; se puede borrar.

---

## Textos

Están en cuatro sitios distintos según de qué texto se trate.

### 1. Base de datos — títulos, descripciones SEO y páginas internas

Es lo único que se puede cambiar **sin tocar código**.

```bash
docker exec -it candamil-db-dev psql -U candamil_app -d candamil_db
```

```sql
-- Título y descripción de Google para la portada
UPDATE paginas
   SET titulo = 'Candamil Asociados | Abogados en Tuluá',
       meta_descripcion = 'Más de 20 años en derecho laboral, civil y de familia.'
 WHERE slug = 'inicio';

-- Contenido completo de una página interna (admite HTML)
UPDATE paginas
   SET contenido = '<p>Primer párrafo.</p><h2>Un subtítulo</h2><p>Más texto.</p>'
 WHERE slug = 'quienes-somos';

-- Crear una landing nueva, sin menú ni pie
INSERT INTO paginas (slug, titulo, contenido, es_landing_page, meta_descripcion)
VALUES ('accidente-laboral', '¿Sufrió un accidente de trabajo?',
        '<p>Texto de la campaña.</p>', TRUE, 'Descripción para Google.');
```

**La portada es la excepción:** solo toma de la base de datos su título y su
descripción SEO. Todo lo que se ve en ella está en el código.

### 2. `frontend/src/data/inicio.js` — áreas de práctica y casos

Un archivo, dos listas. Es lo más cómodo de editar.

```js
export const areas = [ { nombre, imagen, href, icono }, … ];
export const casos = [ { area, titulo, resumen, desenlace, imagen }, … ];
```

Añadir un caso es copiar un bloque y cambiar los textos. La portada muestra los
tres primeros.

También quedan ahí `equipo` y `testimonio`, de dos bloques que retiramos de la
portada; no estorban.

### 3. Los componentes de la portada — el resto del texto

Cada bloque de la portada es un archivo en `frontend/src/components/inicio/`:

| Bloque en pantalla | Archivo |
|---|---|
| Hero | `Hero.astro` |
| "Defendemos su caso…" | `SobreBufete.astro` |
| Franja "Comprometidos con su caso en…" | `FranjaCompromiso.astro` |
| "Cada caso exige un abogado distinto." | `AreasPractica.astro` |
| Cifras y preguntas frecuentes | `CifrasYPreguntas.astro` |
| Perito avaluador | `PeritoAvaluador.astro` |
| Casos resueltos | `CasosRecientes.astro` |
| "¿Evaluamos su caso sin costo?" | `FranjaCierre.astro` |

Dentro de cada archivo, el texto está entre comillas. El titular lleva una
palabra en cursiva subrayada; es la que va dentro de `<span class="destacado">`:

```astro
<h2 class="titular">
  Defendemos su caso <span class="destacado">como si fuera nuestro.</span>
</h2>
```

**Una sola palabra o frase destacada por titular.** Si se subraya media frase,
deja de destacar nada.

### 4. Datos de contacto

| Dato | Dónde |
|---|---|
| Teléfono y WhatsApp | `frontend/.env` (`PUBLIC_TELEFONO`, `PUBLIC_WHATSAPP`) |
| Correo y dirección | `frontend/src/components/BarraContacto.astro` |
| Menú de navegación | `frontend/src/layouts/partials/Navbar.astro` |
| Columnas del pie | `frontend/src/layouts/partials/Footer.astro` |

El teléfono del `.env` se usa en la barra superior, la cabecera, el botón fijo
del móvil, el pie y la franja de cierre: se cambia **una vez** y se actualiza en
todos.

---

## Publicar los cambios

```bash
cd frontend
npm run build
```

Sube el **contenido** de `frontend/dist/` a `public_html/` en cPanel. El
procedimiento completo está en `deploy/README.md`.

Si solo cambiaste texto de la base de datos en producción, basta con volver a
compilar y subir: la API no hay que tocarla.
