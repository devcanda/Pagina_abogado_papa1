# Plan Técnico (Plan) — 001 Fundación de la Arquitectura

## Archivos a Crear

### Backend (`backend/`)
- `server.js` — entrypoint; `app.listen` + sonda de PostgreSQL + apagado ordenado.
- `src/app.js` — fábrica de la app Express (helmet, CORS, JSON, router, errores).
- `src/config/env.js` — lectura y validación de variables de entorno.
- `src/config/db.js` — pool de `pg`, helper `query()` y `verificarConexion()`.
- `src/routes/` — `index.js`, `paginas.routes.js`, `leads.routes.js`, `chat.routes.js`.
- `src/controllers/` — un controlador por recurso; validación con Zod.
- `src/repositories/` — único lugar donde se escribe SQL.
- `src/services/triage.service.js` — cliente de OpenAI con salida estructurada.
- `src/middlewares/` — `errorHandler.js`, `validate.js`.
- `db/schema.sql`, `db/seed.sql`.

### Frontend (`frontend/`)
- `src/layouts/Layout.astro` — **pieza central**: elige envoltorio según el dato.
- `src/layouts/partials/Navbar.astro`, `Footer.astro` — solo modo corporativo.
- `src/components/BaseHead.astro`, `StickyCTA.astro`, `Acordeon.astro`.
- `src/lib/api.js` — cliente `fetch` de la API, ejecutado en build.
- `src/pages/[...slug].astro` — una ruta estática por fila publicada.
- `src/styles/global.css` — tokens de marca y utilidades.

### Despliegue (`deploy/`)
- `README.md` — procedimiento cPanel paso a paso.
- `.htaccess` — HTTPS, dominio canónico, caché y compresión.

## Estrategia de Implementación

1. **Esquema primero.** Las tablas definen el contrato; todo lo demás se adapta.
2. **Backend por capas.** `routes → controllers → repositories`. Un controlador
   nunca escribe SQL; un repositorio nunca conoce `req`/`res`. Esto permite
   cambiar de PostgreSQL o de framework tocando una sola capa.
3. **Decisión de layout como dato.** `Layout.astro` resuelve cada propiedad en
   el orden *prop explícita → campo de la base de datos → valor por defecto*.
   Se usa `??` y no `||` para que un `false` explícito se respete.
4. **SSG.** `getStaticPaths()` pide el índice de páginas y luego el contenido de
   cada una. El HTML sale del build ya resuelto.
5. **Verificación.** Comparar el HTML compilado de una página corporativa y una
   landing: la diferencia debe ser observable, no supuesta.

## Impacto en Base de Datos / Estado

Se crean las tres tablas del encargo. Se añaden campos de apoyo, justificados:

| Tabla       | Campo añadido          | Motivo                                              |
| ----------- | ---------------------- | --------------------------------------------------- |
| `paginas`   | `slug` (UNIQUE)        | El endpoint es `/api/paginas/:slug`; es imprescindible. |
| `paginas`   | `meta_descripcion`     | SEO: sin él cada página necesitaría código a medida.  |
| `paginas`   | `publicado`            | Permite redactar sin publicar.                        |
| `paginas`   | `creado_en`, `actualizado_en` | Auditoría y futura cabecera `Last-Modified`.   |
| `leads`     | `email`, `origen`, `estado` | Atribución de campaña y gestión del embudo.      |
| `leads`     | `consentimiento_datos` | Obligatorio por Ley 1581 de 2012.                     |
| `chat_logs` | `session_id` (UUID)    | Agrupa los turnos de una conversación sin lead aún.   |

Ninguno rompe el esquema propuesto: todos tienen valor por defecto o son nulos.
