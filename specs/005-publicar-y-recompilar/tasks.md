# Tareas de Implementación — Publicar recompila el sitio

## Dato
- [x] T1: Tabla `publicaciones` (migración 008).
- [x] T2: Repositorio: lanzar con candado atómico, cerrar, consultar la última.
- [x] T3: Al arrancar, marcar como interrumpida toda «en marcha» antigua.

## Servicio
- [x] T4: `compilacion.service.js`: `spawn` sin shell, tope de 5 minutos.
- [x] T5: Compilar en directorio aparte y cambiarlo de sitio al final.
- [x] T6: Guardar las últimas líneas del log.

## Panel
- [x] T7: `POST /panel/publicar` (admin + CSRF) y `GET /panel/publicar/estado`.
- [x] T8: Botón de publicar con estado y tiempo transcurrido.
- [x] T9: Registrar en la auditoría quién publicó.

## Validación
- [x] T10: Publicar refleja un cambio en el HTML servido.
- [x] T11: Una compilación fallida deja el sitio anterior en pie.
- [x] T12: Dos pulsaciones seguidas producen una sola compilación.
- [x] T13: Sin sesión y sin rol `admin`, se rechaza.
- [x] T14: Documentar en `deploy/README.md`, `AGENTS.md` y `MEMORY.md`.

## Resultado

13/13 en `backend/.pruebas/publicar.test.mjs`. Las otras dos suites siguen
verdes: bloques 20/20, panel 13/13.

| Comprobación | Resultado |
|---|---|
| Publicar responde en el acto | HTTP 202 |
| Una segunda pulsación no lanza otra | HTTP 409 |
| La compilación termina bien | `hecha` |
| El cambio llega al HTML servido | verificado leyendo `dist/index.html` |
| No quedan directorios a medias | ok |
| Una compilación fallida deja el sitio intacto | 57221 bytes antes y después |
| Sin sesión / sin CSRF | 401 / 403 |

## Dos fallos encontrados al probar, los dos solo visibles en Windows

### El vigilante de Vite bloqueaba el renombrado

Se compilaba en `frontend/dist.nuevo`, dentro del proyecto. `dist/` está
excluido del vigilante de archivos de Vite, pero `dist.nuevo` no: el servidor
de desarrollo lo descubría al aparecer y abría manejadores sobre lo que se iba
escribiendo. El renombrado final daba `EPERM` y hasta el borrado de los restos
daba `EBUSY` sobre `hero-abogado.webp`.

**Con `astro dev` levantado, publicar no funcionaba nunca.** Corregido sacando
el taller fuera del proyecto. No es un apaño: un directorio de preparación no
tiene nada que hacer dentro de un proyecto vigilado.

### Los renombrados necesitan reintentos

Aun fuera del proyecto, renombrar un directorio recién escrito da `EPERM` o
`EBUSY` mientras el sistema suelta los manejadores —y el antivirus mira lo
recién creado—. Añadidos reintentos con espera creciente. En Linux el primer
intento acierta siempre y no cuesta nada.

Ninguno de los dos se habría visto sin ejecutar la publicación de verdad: la
compilación terminaba con éxito y el log no decía nada raro.
