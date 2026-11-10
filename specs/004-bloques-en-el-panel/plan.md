# Plan Técnico — El panel se organiza por bloques

## Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `backend/src/repositories/bloques.repo.js` | Filtrar por `visible`; listar bloques con sus imágenes; cambiar visibilidad. |
| `backend/src/admin/rutas.js` | `GET /panel/bloques` y `POST /panel/bloques/:id/visibilidad`. |
| `backend/src/admin/vistas.js` | Entrada «Bloques» en la navegación. |
| `backend/src/admin/vistaImagenes.js` | Pasa a pintar por bloques; se renombra a `vistaBloques.js`. |

## Archivos a Crear

| Archivo | Para qué |
|---|---|
| `backend/db/007-bloques-visibles.sql` | Columnas `visible` y `rotulo`, y los rótulos iniciales. |

## Estrategia de Implementación

### 1. Base de datos

```sql
ALTER TABLE bloques ADD COLUMN visible BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE bloques ADD COLUMN rotulo  TEXT;
```

`DEFAULT TRUE` para que nada desaparezca al migrar. `rotulo` admite nulo: si
falta, el panel cae en el tipo del bloque.

### 2. El agrupado

No hace falta leer el registro de bloques desde el backend. Basta con recorrer
el JSON de cada bloque buscando cadenas que coincidan con una clave de la tabla
`medios`. Las claves son `^[a-z0-9][a-z0-9-]{0,48}$` y los bloques guardan la
clave, no la ruta, así que la coincidencia es exacta y sin ambigüedad.

Se recorre en recursión porque hay campos de grupo —las láminas del slider, las
tarjetas de servicios— donde las imágenes están anidadas.

Esto evita importar `frontend/src/bloques/registro.js` desde el backend, que
cruzaría los dos paquetes y arrastraría `iconos.js` detrás.

### 3. El interruptor

`POST /panel/bloques/:id/visibilidad` con el token CSRF, igual que la subida de
imágenes. Responde JSON; la página lo pide con `fetch` y actualiza la ficha sin
recargar.

Se exige **rol de administrador**: cambiar una imagen es reversible de un
vistazo, pero apagar un bloque hace desaparecer una sección entera de la página
y quien pasa por allí no tiene por qué notar que falta.

### 4. El filtro en la API

`bloquesPublicados` añade `AND b.visible = TRUE`. Es el único punto por donde
el frontend lee bloques, así que basta con tocarlo ahí.

## Impacto en Base de Datos / Estado

Dos columnas nuevas en `bloques`. Ningún dato se mueve ni se borra.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| **El sitio público es estático**: apagar un bloque no se ve hasta recompilar. | Se dice en la propia pantalla, con todas las letras. No se simula una inmediatez que no existe. |
| Apagar el bloque equivocado y no darse cuenta. | La ficha apagada se queda a la vista, atenuada y con el rótulo «oculto». No desaparece del panel. |
| La detección de imágenes por coincidencia de cadena marca de más. | Solo se comparan contra claves que existen en `medios`. Un texto libre tendría que ser exactamente igual a una clave existente. |
| Quedarse sin bloques visibles. | Se permite: es una decisión del editor, no un error. La página se sirve vacía. |
