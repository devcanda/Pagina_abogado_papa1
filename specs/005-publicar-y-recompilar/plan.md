# Plan Técnico — Publicar recompila el sitio

## Archivos a Crear

| Archivo | Para qué |
|---|---|
| `backend/db/008-publicaciones.sql` | Tabla `publicaciones`: una fila por compilación. |
| `backend/src/services/compilacion.service.js` | Lanza `astro build`, serializa y recoge el resultado. |
| `backend/src/repositories/publicaciones.repo.js` | Acceso a la tabla. |

## Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `backend/src/admin/rutas.js` | `POST /panel/publicar` y `GET /panel/publicar/estado`. |
| `backend/src/admin/vistaBloques.js` | Botón de publicar y su estado. |
| `backend/src/config/env.js` | Ruta del frontend y orden de compilación. |
| `backend/.env.example` | Las variables nuevas. |
| `deploy/README.md` | Cómo queda esto en cPanel. |

## Estrategia de Implementación

### 1. Una fila por compilación

```sql
CREATE TABLE publicaciones (
  id          SERIAL PRIMARY KEY,
  estado      TEXT NOT NULL,          -- 'en-marcha' | 'hecha' | 'fallida' | 'interrumpida'
  usuario_id  INTEGER REFERENCES usuarios (id) ON DELETE SET NULL,
  iniciada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acabada_en  TIMESTAMPTZ,
  salida      TEXT                    -- últimas líneas del log, para enseñar el fallo
);
```

El estado vive en la base y no en memoria **a propósito**: si el proceso se
reinicia a mitad, al arrancar se ve que quedó una «en marcha» de hace rato y se
marca como interrumpida. Un estado en memoria se habría perdido y el panel
diría «publicando» para siempre.

### 2. Una sola compilación a la vez

Antes de lanzar, se comprueba si hay alguna `en-marcha`. El candado es la propia
fila, no una variable: funciona aunque algún día haya dos procesos de Node.

Se usa `INSERT ... WHERE NOT EXISTS (...)` en una sola sentencia para que la
comprobación y la inserción sean atómicas. Comprobar y luego insertar en dos
pasos deja una rendija por la que dos pulsaciones casi simultáneas cuelan dos
compilaciones.

### 3. El sitio anterior no se toca hasta que la nueva está entera

`astro build` escribe en `dist/`. Si se compilara encima del directorio que
Apache sirve, un fallo a mitad dejaría el sitio roto. Se compila a un directorio
temporal y **se cambia de sitio al final**, que es una operación atómica del
sistema de archivos:

```
dist.nuevo/  ← compila aquí
dist/        ← se renombra a dist.viejo
dist.nuevo/  → dist/
dist.viejo/  ← se borra
```

Si la compilación falla, `dist/` ni se ha tocado.

### 4. Nada de `shell: true`

Se usa `spawn` con la orden y sus argumentos por separado. Con `shell: true`,
cualquier cosa que acabe en la línea de órdenes se interpreta, y aquí entra
contenido que viene del panel. No hay motivo para abrir esa puerta.

Tope de 5 minutos: pasado eso se mata el proceso y se marca fallida. Una
compilación colgada bloquearía todas las siguientes por el candado.

### 5. El panel pregunta, no adivina

El botón lanza la publicación y la página consulta `GET /panel/publicar/estado`
cada dos segundos hasta que deja de estar en marcha. Sin WebSockets: para algo
que pasa unas veces al día, sobra.

## Impacto en Base de Datos / Estado

Una tabla nueva. Nada existente se mueve.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| En cPanel el proceso de Passenger no puede compilar (memoria, o no hay `node_modules` del frontend). | Se documenta en `deploy/README.md` y se deja la orden configurable por entorno. Si no se puede, la alternativa es un cron que mire la bandera; el diseño ya lo admite porque el estado está en la base. |
| Publicar tarda y parece colgado. | El panel enseña el estado y el tiempo transcurrido. |
| Dos compilaciones a la vez corrompen `dist/`. | Candado atómico en la base y compilación en directorio aparte. |
| El log de la compilación crece sin control. | Se guardan solo las últimas líneas, que es lo que sirve para diagnosticar. |
