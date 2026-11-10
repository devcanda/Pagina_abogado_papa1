# Poner el proyecto en marcha en otra máquina

Para clonar el repositorio en un equipo nuevo y dejarlo funcionando. Son unos
quince minutos la primera vez.

Si algo falla, antes de investigar mire **[Cuando algo no arranca](#cuando-algo-no-arranca)**:
casi todos los tropiezos conocidos están ahí con su causa.

---

## 0. Lo que hace falta tener instalado

| Programa | Versión | Para qué |
|---|---|---|
| **Node.js** | **20.12 o superior** (el proyecto se prueba con **22.16.0**) | API, compilación del sitio y herramientas |
| **Docker Desktop** | cualquiera reciente | PostgreSQL de desarrollo, en un contenedor desechable |
| **Git** | cualquiera | — |
| **Google Chrome** | cualquiera | **solo** para las pruebas automáticas y las capturas |

La versión de Node está en `.nvmrc`. Con `nvm` instalado, `nvm use` en la raíz
la deja puesta. El mínimo es 20.12 y no 20.0 porque los guiones de base de
datos usan `--env-file-if-exists`, que no existe antes.

PostgreSQL **no** hace falta instalarlo: lo pone Docker. Si prefiere usar uno
que ya tenga, vea la nota al final del paso 2.

---

## 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio> candamil
cd candamil

cd backend  && npm ci && cd ..
cd frontend && npm ci && cd ..
```

**`npm ci`, no `npm install`.** `ci` instala exactamente las versiones del
`package-lock.json`, que es lo que hace que el sitio se compile igual en los
dos equipos. `install` puede subir versiones menores y meter diferencias que
luego cuesta encontrar.

---

## 2. Base de datos

```bash
docker compose up -d
```

Levanta PostgreSQL 17 en el puerto **5434** y, **la primera vez**, carga
`backend/db/schema.sql` y `backend/db/seed.sql`.

Después hay que aplicar las migraciones:

```bash
cd backend
cp .env.example .env        # ya trae la DATABASE_URL del contenedor
npm run db:migrar
```

### Por qué este paso no se puede saltar

`schema.sql` solo crea tres tablas: `paginas`, `leads` y `chat_logs`. **Todo lo
demás** —los bloques de la portada, el catálogo de imágenes, los usuarios del
panel, las sesiones y el registro de publicaciones— vive en las migraciones
numeradas de `backend/db/`.

Sin ellas la base arranca sin panel y sin portada, y `astro build` falla al
pedir unos bloques que no existen. **El orden importa:** esquema → semilla →
migraciones. El contenedor hace los dos primeros solo; el tercero es este
comando.

Para ver qué hay aplicado sin tocar nada:

```bash
npm run db:estado
```

El corredor lleva un registro en la tabla `migraciones_aplicadas` y **nunca
repite una migración**. No es una precaución teórica: `003` inserta los bloques
de la portada y `009` copia colores dentro de cada lámina, así que reejecutarlas
duplicaría contenido o pisaría valores que alguien ya editó desde el panel.

Si apunta el corredor a una base que **ya tenía** las tablas pero no el registro
—la del equipo donde nació el proyecto—, las marca como aplicadas sin
ejecutarlas y lo dice por pantalla. Es lo único seguro que puede hacer ahí.

> **¿PostgreSQL propio en vez de Docker?** Cree la base y el usuario a mano,
> ponga su `DATABASE_URL` en `backend/.env` y lance en orden:
> `psql "$DATABASE_URL" -f db/schema.sql`, luego `-f db/seed.sql`, y después
> `npm run db:migrar`.

---

## 3. Un usuario para el panel

La base recién creada **no tiene ninguno**, y no hay pantalla de registro: las
altas se hacen por consola a propósito, porque un «crear cuenta» abierto a
internet es la forma más rápida de que cualquiera entre al panel.

```bash
cd backend
npm run usuario:crear -- correo@ejemplo.com "Nombre Apellido" admin
```

Imprime una contraseña fuerte **una sola vez**: cópiela. No se guarda en claro
en ningún sitio, así que una contraseña perdida no se recupera, se reemplaza:

```bash
npm run usuario:clave -- correo@ejemplo.com
```

Cambiar la clave **cierra todas las sesiones** de ese usuario, que es justo lo
que se quiere si se cambia porque alguien pudo verla.

---

## 4. Arrancar

Dos terminales, en este orden.

```bash
# Terminal 1 — API y panel
cd backend
npm run dev                 # http://localhost:3000
```

```bash
# Terminal 2 — sitio
cd frontend
cp .env.example .env
npm run dev                 # http://localhost:4321
```

**La API tiene que estar levantada antes que el frontend.** Astro consulta el
contenido durante la compilación, no desde el navegador: si la API no responde,
la página sale sin contenido.

Comprobación rápida:

```bash
curl http://localhost:3000/api/health          # {"status":"ok","db":"ok"}
```

| Dirección | Qué es |
|---|---|
| `http://localhost:4321` | el sitio, con recarga en caliente (`npm run dev`) |
| `http://localhost:4340` | el sitio **ya compilado** (`npm run preview`) |
| `http://localhost:3000/panel` | el panel de contenido |
| `http://localhost:3000/api/health` | estado de la API y de la base |

### Los dos puertos del frontend no son intercambiables

El **4321** es para editar. El **4340** sirve lo que hay en `dist/`, es decir
el sitio tal y como lo verá el visitante, y es el que usan **las herramientas
de captura, el previsualizador de fondos y las siete suites de pruebas**.

Contra el servidor de desarrollo esas comprobaciones fallan sin que haya nada
roto: Vite inyecta los estilos por JavaScript y, cuando se mide la página,
todavía no están aplicados; las láminas salen apiladas y las medidas no tienen
sentido. Si ve diez fallos de maquetación de golpe, lo primero que hay que
mirar es qué hay sirviendo el 4340.

```bash
cd frontend
npm run build && npm run preview     # esto es lo que esperan las pruebas
```

---

## 5. Comprobar que todo está bien (opcional pero recomendado)

Hay siete suites que recorren el panel con un navegador de verdad. Necesitan
tres cosas a la vez: la **API** en el 3000, el **sitio compilado** en el 4340
(`npm run build && npm run preview`, no `npm run dev`) y **un Chrome con el
puerto de depuración abierto**:

```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222

# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222
```

Y entonces:

```bash
cd backend
CORREO=correo@ejemplo.com CLAVE=la-que-anotó npm run probar
```

Las suites **escriben sobre el contenido real** y lo devuelven al terminar. Por
eso cada una guarda una copia al empezar y la repone en un `finally`: si se
interrumpe una a mitad, vuelva a lanzarla antes de seguir trabajando. Las reglas
completas están en `AGENTS.md`, en «Las pruebas no tocan contenido real».

---

## Cuando algo no arranca

**`ECONNREFUSED` contra el 5434.** El contenedor no está levantado o Docker
Desktop no ha arrancado todavía. `docker compose up -d` y vuelva a probar.

**En Windows, Docker no consigue reservar el 5434.** Hyper-V se apropia de
rangos de puertos al reiniciar y a veces le toca a ese. Se ve con
`netsh interface ipv4 show excludedportrange protocol=tcp`. Se libera con
`net stop winnat` y `net start winnat` desde una consola de administrador.

**El panel dice que la contraseña es incorrecta y está seguro de que no.** Hay
un limitador de ocho intentos cada quince minutos, y vive en memoria: reiniciar
la API lo vacía. Ocurre con facilidad cuando se lanzan las pruebas varias veces
seguidas.

**Las últimas suites fallan con «Unexpected token 'F', "Found. Red"…».** Es el
mismo limitador: cada suite inicia sesión y `npm run probar` lanza siete
seguidas. Reinicie la API y relance las que falten.

**Diez fallos de maquetación de golpe en `fondos`.** El 4340 está sirviendo el
servidor de desarrollo en vez del sitio compilado. Vea
[la nota sobre los dos puertos](#los-dos-puertos-del-frontend-no-son-intercambiables).

**La portada sale vacía o el build falla pidiendo bloques.** Faltan las
migraciones del paso 2. `npm run db:estado` lo confirma en un segundo.

**«Publicar cambios» nunca termina, en Windows.** El taller de publicación no
puede estar dentro del proyecto de Astro: el vigilante de Vite mantiene abiertos
los archivos y el renombrado final falla. `CARPETA_PUBLICACION` tiene que
apuntar fuera y al mismo volumen que `dist/`.

**Cambié contenido y el sitio no lo refleja.** El sitio es estático. Las
imágenes sí se ven al recargar, porque lo que cambia es el archivo; los textos
necesitan recompilar, con el botón «Publicar cambios» del panel o `npm run build`.

---

## Trabajar en dos equipos

El proyecto no guarda nada fuera del repositorio salvo tres cosas, y conviene
saber cuáles:

| Qué | Viaja por Git | Cómo se replica |
|---|---|---|
| Código, estilos, componentes | Sí | — |
| **Imágenes del sitio** (`frontend/public/img/`) | **Sí** | — |
| Fotos de origen (`docs/imagenes-origen/`) | Sí | — |
| `backend/.env` y `frontend/.env` | **No** | `cp .env.example .env` en cada equipo |
| **Contenido de la base** (textos, qué foto usa cada lámina, colores) | **No** | Ver abajo |
| `node_modules/`, `dist/`, `.publicacion/` | No | `npm ci` / se regeneran |

Las credenciales no viajan por Git a propósito. El contenido tampoco: vive en
PostgreSQL, y cada equipo levanta el suyo.

**Si quiere el mismo contenido en los dos equipos**, lléveselo con un volcado:

```bash
# En el equipo que tiene el contenido bueno
docker exec candamil-db-dev pg_dump -U candamil_app -d candamil_db \
  --data-only --inserts > contenido.sql

# En el otro, con la base ya creada y migrada
docker exec -i candamil-db-dev psql -U candamil_app -d candamil_db < contenido.sql
```

El volcado **no** debe versionarse: lleva los hashes de las contraseñas del
panel y las sesiones abiertas.

Lo que sí conviene es **confirmar y subir siempre antes de cambiar de equipo**,
incluidas las imágenes que haya sustituido desde el panel: se escriben en
`frontend/public/img/`, que sí va en Git, y es fácil dejarlas atrás.

---

## Y de aquí al hosting

El destino final es cPanel. Todo eso está en **[../deploy/README.md](../deploy/README.md)**:
qué sube a `public_html`, qué va fuera, cómo se monta la API con Passenger y qué
comprobar después.
