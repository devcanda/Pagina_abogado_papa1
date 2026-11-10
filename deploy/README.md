# Despliegue en cPanel 110

El frontend y el backend se despliegan por separado. El frontend es un conjunto
de archivos planos; el backend es una aplicación Node gestionada por Phusion
Passenger.

```
/home/cpuser/
├── public_html/            ← contenido de frontend/dist/ + deploy/.htaccess
└── candamil-api/           ← contenido de backend/  (FUERA de public_html)
    ├── server.js
    ├── src/
    ├── package.json
    └── .env                ← nunca se versiona ni se sube a public_html
```

El backend vive fuera de `public_html` a propósito: si estuviera dentro,
cualquiera podría descargar el `.env` con las credenciales de PostgreSQL y la
clave de OpenAI.

---

## 1. Base de datos (cPanel → PostgreSQL Databases)

1. Crea la base: `candamil_db` → queda como `cpuser_candamil_db`.
2. Crea el usuario: `candamil_app` → queda como `cpuser_candamil_app`.
3. Asigna el usuario a la base con todos los privilegios.
4. Carga el esquema, la semilla y las migraciones **en este orden**, desde la
   terminal SSH:

```bash
cd ~/candamil-api
export DATABASE_URL="postgresql://cpuser_candamil_app:CLAVE@localhost:5432/cpuser_candamil_db"

psql "$DATABASE_URL" -f db/schema.sql     # paginas, leads, chat_logs
psql "$DATABASE_URL" -f db/seed.sql       # contenido inicial de las páginas
npm run db:migrar                          # TODO lo demás
```

**El tercer paso no se puede saltar.** `schema.sql` solo crea tres tablas. Los
bloques de la portada, el catálogo de imágenes, los usuarios del panel, las
sesiones y el registro de publicaciones viven en las migraciones numeradas de
`db/`. Sin ellas la API arranca pero el sitio no se puede compilar: pide unos
bloques que no existen.

`npm run db:migrar` toma las variables del `.env` si lo hay y, si no, de las
que ya estén exportadas: en cPanel sirven las que pone Passenger, así que no
hace falta crear un `.env` solo para esto.

El corredor lleva registro en `migraciones_aplicadas` y nunca repite una
migración, así que es seguro volver a lanzarlo después de cada despliegue —de
hecho **es lo que hay que hacer** cuando una versión nueva traiga migraciones
nuevas. `npm run db:estado` dice qué hay aplicado sin tocar nada.

> Los prefijos `cpuser_` los añade cPanel automáticamente. Usa los nombres
> completos tal como los muestra el panel en la `DATABASE_URL`.

## 2. API Node (cPanel → Setup Node.js App)

| Campo                     | Valor                                   |
| ------------------------- | --------------------------------------- |
| Node.js version           | 20.12 o superior (probado con 22.16)    |
| Application mode          | Production                               |
| Application root          | `candamil-api`                          |
| Application URL           | `api.candamilabogados.com`              |
| Application startup file  | `server.js`                             |

Después:

1. Pulsa **Run NPM Install**.
2. Añade las variables de entorno (sección *Environment variables*), tomando
   `backend/.env.example` como referencia. Como mínimo: `NODE_ENV=production`,
   `DATABASE_URL`, `CORS_ORIGINS`, `OPENAI_API_KEY`, `API_BASE_PATH=/api`.
3. **Restart**.
4. Comprueba: `curl https://api.candamilabogados.com/api/health` → `{"status":"ok","db":"ok"}`.
5. Crea el usuario del panel. La base nueva **no trae ninguno** y no hay
   pantalla de registro:

   ```bash
   cd ~/candamil-api
   npm run usuario:crear -- publicidad@candamilabogados.com "Equipo de publicidad" admin
   ```

   Imprime una contraseña fuerte una sola vez. **Nunca reutilizar la de
   desarrollo:** con `NODE_ENV=production` el script rechaza las de
   diccionario, pero eso no cubre una que ya circuló por otro equipo.

### Sobre `API_BASE_PATH`

Passenger monta la app en la *Application URL*. Hay dos montajes posibles y la
variable existe para no equivocarse:

- **Subdominio dedicado** (`api.candamilabogados.com`, el recomendado):
  deja `API_BASE_PATH=/api`. Las rutas quedan en
  `https://api.candamilabogados.com/api/paginas`.
- **Sub-URI del dominio principal** (`candamilabogados.com/api`): Passenger ya
  aporta el `/api`, así que pon `API_BASE_PATH=` (vacío). Si no, las rutas
  quedarían en `/api/api/paginas`.

El subdominio es preferible: evita que un `.htaccess` del sitio estático
intercepte rutas de la API, y mantiene separados los logs de ambas aplicaciones.

## 3. Frontend estático

El build necesita que la API esté respondiendo, porque consulta el contenido
durante la compilación.

```bash
cd frontend
npm ci                      # ci, no install: respeta el package-lock
echo "PUBLIC_API_URL=https://api.candamilabogados.com/api" > .env
echo "PUBLIC_WHATSAPP=573000000000" >> .env
echo "PUBLIC_TELEFONO=+576041234567" >> .env
echo "PUBLIC_SITE_URL=https://candamilabogados.com" >> .env

npm run build
```

Sube **el contenido** de `frontend/dist/` a `public_html/` (no la carpeta
`dist` en sí) y copia también `deploy/.htaccess`, que fuerza HTTPS y el host
canónico, bloquea la descarga de `.env` y fija la caché.

**Ojo con la caché del HTML.** El `.htaccess` lo deja en `max-age=0`, y es a
propósito: publicar desde el panel recompila el sitio, y si el navegador se
guarda el HTML, quien edita no ve su cambio y da por hecho que el botón no
funcionó. Lo de `/_astro/` sí se cachea un año porque lleva hash en el nombre.

Las imágenes del sitio viajan dentro del build: están en
`frontend/public/img/`, que Astro copia a `dist/` tal cual. No hay que subirlas
aparte.

## 4. Republicar contenido

El sitio es estático: editar una fila de `paginas` en PostgreSQL **no** cambia
la web hasta que se vuelve a compilar. Es la contrapartida de servir HTML plano
y es lo que mantiene el LCP bajo.

Para publicar cambios de contenido basta con repetir el paso 3. Si el bufete
necesita autonomía total, el siguiente paso sería un cron nocturno que ejecute
el build, o pasar la ruta `[...slug]` a SSR bajo demanda.

---

## Antes de publicar: lo que falta

Pendientes conocidos, anotados para que no se descubran el día del despliegue:

- [ ] **La clave del panel en desarrollo es `admin123`.** En el servidor se
      genera una nueva con `npm run usuario:crear`; la de desarrollo no se
      reutiliza. Con `NODE_ENV=production` el script rechaza las de
      diccionario, pero no sabe cuáles han circulado ya.
- [ ] **`/contacto/` y `/areas/` todavía no existen** y devuelven 404. Son el
      destino de los botones de las tres láminas de la cabecera y del menú.
      Publicar así deja los tres llamados a la acción rotos.
- [ ] **La línea base visual de `docs/linea-base/` está desactualizada.** Hay
      que regenerarla cuando el diseño esté aprobado y anotar qué cambió en
      `docs/punto-de-control-visual.md`.

## Verificación posterior al despliegue

- [ ] `https://api.candamilabogados.com/api/health` responde `db: "ok"`.
- [ ] El `.env` **no** es accesible desde el navegador.
- [ ] Una página corporativa muestra Navbar y Footer.
- [ ] Una landing (`es_landing_page = TRUE`) no muestra ninguno de los dos.
- [ ] En móvil se ve el Sticky CTA y no tapa el final del contenido.
- [ ] `https://candamilabogados.com` redirige desde `http://` y desde `www.`.

## Publicar desde el panel (recompilación)

El sitio es estático: el contenido se consulta durante `astro build`. Para que
publicidad vea sus cambios sin entrar al servidor, el botón «Publicar cambios»
del panel lanza esa compilación. Ver `specs/005-publicar-y-recompilar/`.

### Lo que hace

1. Coge un candado (una fila `en-marcha` en la tabla `publicaciones`).
2. Ejecuta `npx astro build --outDir <taller>/dist-nuevo`.
3. Si va bien, cambia `dist/` por lo recién compilado con dos renombrados.
4. Cierra la fila como `hecha` o `fallida`, guardando las últimas líneas del log.

**Una compilación fallida no toca el sitio.** `dist/` solo se cambia cuando la
nueva está entera y tiene su `index.html`.

### Variables

```
CARPETA_FRONTEND=/home/USUARIO/candamil/frontend
CARPETA_PUBLICACION=/home/USUARIO/candamil/.publicacion
```

`CARPETA_PUBLICACION` tiene que cumplir dos cosas:

- **Fuera del proyecto de Astro.** Dentro, el vigilante de archivos de Vite
  abre manejadores sobre lo que se va escribiendo y el renombrado final falla.
  Con el servidor de desarrollo levantado no funcionaba nunca.
- **En el mismo volumen que `dist/`.** Renombrar entre unidades distintas da
  `EXDEV`. Por eso no vale `/tmp`.

### Si Passenger no puede compilar

El proceso de Passenger puede tener poca memoria o no encontrar las
dependencias del frontend. Compruébelo por SSH antes de confiar en el botón:

```bash
cd ~/candamil/frontend && npx astro build --outDir /tmp/prueba-build
```

Si no sale, hay dos salidas:

- Apuntar `ORDEN_COMPILACION` a una ruta absoluta de node/npm del servidor.
- Dejar que un **cron** haga la compilación. El diseño ya lo admite porque el
  estado vive en la base y no en memoria: basta con un script que mire si hay
  una fila `en-marcha` y la atienda. El panel seguiría funcionando igual, solo
  que la publicación tardaría lo que tarde el cron en pasar.

### Comprobaciones tras desplegar

- [ ] «Publicar cambios» termina en `hecha` y el cambio se ve en el sitio.
- [ ] Una publicación fallida deja el sitio anterior sirviendo.
- [ ] Dos pulsaciones seguidas dan una sola compilación (la segunda, 409).
- [ ] Reiniciar la app a mitad de una compilación no deja el panel diciendo
      «publicando» para siempre.
- [ ] `.publicacion/` **no** es accesible desde el navegador.
