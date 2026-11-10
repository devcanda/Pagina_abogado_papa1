# candamilabogados.com

Sitio web y sistema de captación de leads del bufete Candamil Abogados.

```
pagina_papa1/
├── frontend/          Astro 5 + Tailwind 4 → se compila a archivos planos
├── backend/           Express + PostgreSQL + OpenAI → API REST
├── deploy/            .htaccess y guía de despliegue en cPanel
├── herramientas/      composición de fondos, capturas y control visual
├── specs/             Flujo SDD: spec.md → plan.md → tasks.md por funcionalidad
├── docs/              Constitución arquitectónica
├── AGENTS.md          Reglas y stack para agentes de IA
└── MEMORY.md          Bitácora viva del proyecto
```

## Puesta en marcha local

> **¿Primera vez en este equipo?** La guía completa, con los tropiezos
> conocidos y sus causas, está en **[docs/puesta-en-marcha.md](docs/puesta-en-marcha.md)**.
> Lo que sigue es el resumen.

Hace falta **Node.js 20+** (el proyecto se prueba con 22.16.0, ver `.nvmrc`) y
**Docker Desktop**. PostgreSQL no hace falta instalarlo: lo pone el contenedor.

```bash
cd backend  && npm ci && cd ..
cd frontend && npm ci && cd ..
```

### 1. Base de datos

```bash
docker compose up -d        # PostgreSQL 17 en el puerto 5434
                            # carga schema.sql y seed.sql la PRIMERA vez

cd backend
cp .env.example .env        # ya trae la DATABASE_URL del contenedor
npm run db:migrar           # aplica las migraciones de db/
```

**El `db:migrar` no es opcional.** `schema.sql` solo crea `paginas`, `leads` y
`chat_logs`; los bloques de la portada, el catálogo de imágenes, los usuarios
del panel y el registro de publicaciones viven en las migraciones numeradas.
Sin ellas no hay portada que compilar. `npm run db:estado` dice qué hay puesto.

La `DATABASE_URL` del contenedor es
`postgresql://candamil_app:dev_local_2026@localhost:5434/candamil_db`.

### 2. Un usuario para el panel

La base recién creada no trae ninguno y no hay pantalla de registro:

```bash
cd backend
npm run usuario:crear -- correo@ejemplo.com "Nombre Apellido" admin
```

Imprime la contraseña **una sola vez**.

### 3. API

```bash
cd backend
npm run dev                 # http://localhost:3000
```

Comprobación rápida:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/paginas/demanda-laboral
```

### 4. Frontend

Con la API ya corriendo, en otra terminal:

```bash
cd frontend
cp .env.example .env
npm run dev                 # http://localhost:4321
```

Para ver el sitio **tal y como se publica** —y para que funcionen las
herramientas y las pruebas, que apuntan ahí— hace falta el compilado:

```bash
npm run build && npm run preview     # http://localhost:4340
```

> El frontend consulta la API **durante el build**, no desde el navegador.
> Si cambias contenido en PostgreSQL, hay que recompilar para verlo.
> Por eso la API tiene que estar levantada **antes** que el frontend.

## Cambiar imágenes y textos

Ver **[docs/guia-de-edicion.md](docs/guia-de-edicion.md)**: dónde vive cada
texto, qué tamaño debe tener cada imagen y cómo publicar los cambios.

## Endpoints

| Método | Ruta                 | Descripción                                  |
| ------ | -------------------- | -------------------------------------------- |
| `GET`  | `/api/health`        | Estado del proceso y de la base de datos.    |
| `GET`  | `/api/paginas`       | Índice de páginas publicadas.                |
| `GET`  | `/api/paginas/:slug` | Contenido completo de una página.            |
| `POST` | `/api/leads`         | Alta de un lead desde formulario.            |
| `POST` | `/api/chat/triage`   | Un turno de conversación con el bot.         |

## Los dos layouts

`frontend/src/layouts/Layout.astro` elige el envoltorio leyendo el campo
`es_landing_page` de la tabla `paginas`:

| `es_landing_page` | Navbar | Footer         | Sticky CTA | Indexable |
| ----------------- | ------ | -------------- | ---------- | --------- |
| `FALSE`           | Sí     | Completo       | Móvil      | Sí        |
| `TRUE`            | No     | Mínimo (legal) | Siempre    | `noindex` |

Para forzarlo sin pasar por la base de datos:

```astro
<Layout titulo="Gracias por escribirnos" esLanding noIndex>
  …
</Layout>
```

## Despliegue

Ver [deploy/README.md](deploy/README.md).
