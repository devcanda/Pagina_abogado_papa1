# Tareas de Implementación (Tasks) — 001 Fundación de la Arquitectura

## Completadas
- [x] T1: Esquema PostgreSQL (`paginas`, `leads`, `chat_logs`) + seed de prueba.
- [x] T2: Estructura de carpetas `frontend/` + `backend/` + `deploy/`.
- [x] T3: Conexión a PostgreSQL con pool y sonda de arranque.
- [x] T4: `server.js` y fábrica de la app Express con helmet, CORS y errores.
- [x] T5: Endpoint `GET /api/paginas/:slug` y `GET /api/paginas`.
- [x] T6: Endpoints `POST /api/leads` y `POST /api/chat/triage` con Zod y rate limit.
- [x] T7: Servicio de OpenAI con salida estructurada y modo degradado sin API key.
- [x] T8: `Layout.astro` con decisión dinámica Corporativo / Landing.
- [x] T9: Navbar, Footer, Sticky CTA y Acordeón.
- [x] T10: Ruta `[...slug].astro` consumiendo la API en build.
- [x] T11: `.htaccess` y guía de despliegue en cPanel.
- [x] T12: Verificación del build — 4 páginas, 21KB CSS, 0KB JS.
- [x] T13: Verificación de los dos layouts sobre el HTML compilado.

- [x] T14: Prueba de extremo a extremo contra PostgreSQL real (contenedor Docker
      en el puerto 5434). Verificado: `health` con `db: ok`, `GET /api/paginas`,
      `GET /api/paginas/:slug`, 404 de slug inexistente, `POST /api/leads`
      (201 + fila en base), rechazo sin consentimiento, rechazo de teléfono
      inválido, y `POST /api/chat/triage` registrando el turno en `chat_logs`.
- [x] T15: Corrección detectada en la prueba — el error de OpenAI llegaba íntegro
      al navegador, incluyendo el prefijo de la API key. Ahora se registra en el
      servidor y el visitante recibe la respuesta degradada.
- [x] T16: `docker-compose.yml` para levantar la base de desarrollo con el
      esquema y el seed ya cargados.

## Notas de entorno
- La instancia PostgreSQL 15 del puerto 5432 de esta máquina pertenece a
  **Veeam Backup** (`pg_hba.conf` con `sspi map=veeam`). No usarla para
  desarrollo ni modificar su configuración.
- La instancia PostgreSQL 17 del puerto 5433 usa `md5` y sería compatible,
  pero se optó por un contenedor desechable para no depender de ella.

## Siguientes specs
- [ ] 002: Formulario de captación de leads en el frontend.
- [ ] 003: Widget de chat del Bot de Triage.
- [ ] 004: Sitemap, datos estructurados por área y blog jurídico.
