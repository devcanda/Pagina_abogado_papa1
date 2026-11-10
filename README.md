# candamilabogados.com

Sitio web y sistema de captación de leads del bufete Candamil Abogados.

```
pagina_papa1/
├── frontend/          Astro 5 + Tailwind 4 → se compila a archivos planos
├── backend/           Express + PostgreSQL + OpenAI → API REST
├── deploy/            .htaccess y guía de despliegue en cPanel
├── specs/             Flujo SDD: spec.md → plan.md → tasks.md por funcionalidad
├── docs/              Constitución arquitectónica
├── AGENTS.md          Reglas y stack para agentes de IA
└── MEMORY.md          Bitácora viva del proyecto
```

## Puesta en marcha local

Necesitas Node.js 20+ (recomendado 22.19+) y PostgreSQL 15+.

### 1. Base de datos

**Opción recomendada — contenedor desechable:**

```bash
docker compose up -d        # PostgreSQL 17 en el puerto 5434
                            # carga schema.sql y seed.sql automáticamente
```

La `DATABASE_URL` correspondiente es:
`postgresql://candamil_app:dev_local_2026@localhost:5434/candamil_db`

**Opción alternativa — PostgreSQL ya instalado:**

```bash
createdb candamil_db
psql candamil_db -f backend/db/schema.sql
psql candamil_db -f backend/db/seed.sql     # datos de ejemplo
```

### 2. API

```bash
cd backend
cp .env.example .env        # ajusta DATABASE_URL y OPENAI_API_KEY
npm install
npm run dev                 # http://localhost:3000
```

Comprobación rápida:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/paginas/demanda-laboral
```

### 3. Frontend

Con la API ya corriendo, en otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:4321
```

> El frontend consulta la API **durante el build**, no desde el navegador.
> Si cambias contenido en PostgreSQL, hay que recompilar para verlo.

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
