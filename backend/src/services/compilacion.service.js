/**
 * Compilación del sitio estático.
 *
 * Ejecuta `astro build` y deja el resultado donde Apache lo sirve. Es lo que
 * convierte «publicar» en algo que el visitante nota.
 *
 * Decisiones que no se tocan:
 *
 *   · **Nada de `shell: true`.** La orden y sus argumentos van por separado.
 *     Con shell, cualquier cosa que acabe en la línea de órdenes se interpreta,
 *     y por aquí pasa configuración que viene del entorno. No hay motivo para
 *     abrir esa puerta.
 *
 *   · **Se compila aparte y se cambia de sitio al final.** Si se compilara
 *     encima del directorio que Apache sirve, un fallo a mitad dejaría el sitio
 *     roto. Renombrar un directorio es atómico: o está el viejo o está el
 *     nuevo, nunca una mezcla.
 *
 *   · **Tope de tiempo.** Una compilación colgada bloquearía todas las
 *     siguientes, porque el candado es una fila en la base.
 */
import { spawn } from 'node:child_process';
import { rename, rm, mkdir, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { env } from '../config/env.js';

/**
 * Renombra reintentando.
 *
 * En Windows, renombrar un directorio justo después de que un proceso haya
 * terminado de escribir en él da `EPERM` o `EBUSY`: el proceso ya salió pero el
 * sistema todavía no ha soltado los manejadores, y el antivirus suele estar
 * mirando el directorio recién creado. Sin reintentos, la publicación falla
 * cuando en realidad la compilación había ido perfecta.
 *
 * No es un apaño: es cómo hay que hacer operaciones de directorio en Windows.
 * En Linux el primer intento acierta siempre y esto no cuesta nada.
 */
async function renombrarConReintentos(origen, destino, intentos = 12) {
  const recuperables = new Set(['EPERM', 'EBUSY', 'EACCES', 'ENOTEMPTY']);
  for (let i = 1; ; i++) {
    try {
      await rename(origen, destino);
      return i;
    } catch (error) {
      if (i >= intentos || !recuperables.has(error.code)) throw error;
      await new Promise((r) => setTimeout(r, 120 * i));
    }
  }
}

/** `rm` ya trae reintentos propios; aquí solo se fijan. */
const borrar = (ruta) =>
  rm(ruta, { recursive: true, force: true, maxRetries: 8, retryDelay: 120 });

/** Cuántas líneas del log se guardan. Las últimas son las que explican el fallo. */
const LINEAS_DE_LOG = 40;

/** Pasado esto se mata el proceso: una compilación colgada bloquea el candado. */
const TOPE_MS = 5 * 60 * 1000;

export const carpetaFrontend = () => resolve(env.carpetaFrontend ?? '../frontend');

/**
 * Lanza la compilación y espera a que termine.
 *
 * Nunca lanza una excepción por un fallo de compilación: devuelve
 * `{ ok: false, salida }`. Un error de contenido es un resultado esperado de
 * esta función, no una avería, y quien la llama tiene que poder guardarlo.
 */
export async function compilar() {
  const raiz = carpetaFrontend();
  const destino = join(raiz, 'dist');

  /*
   * El directorio de preparación vive FUERA del proyecto de Astro, y es
   * importante.
   *
   * Dentro, el vigilante de archivos de Vite lo descubre en cuanto aparece y
   * abre manejadores sobre lo que se va escribiendo. `dist/` está excluido de
   * ese vigilante, pero `dist.nuevo` no lo estaba, así que en Windows el
   * renombrado final fallaba con EPERM y hasta el borrado de los restos daba
   * EBUSY. Con el servidor de desarrollo levantado, publicar no funcionaba
   * nunca.
   *
   * Tiene que estar en el MISMO volumen que `dist/`: renombrar entre unidades
   * distintas da EXDEV. Por eso se cuelga del directorio padre del proyecto y
   * no de la carpeta temporal del sistema, que suele estar en otra unidad.
   */
  const taller = env.carpetaPublicacion ?? resolve(raiz, '..', '.publicacion');
  const nuevo = join(taller, 'dist-nuevo');
  const viejo = join(taller, 'dist-anterior');
  await mkdir(taller, { recursive: true });

  const lineas = [];
  const anotar = (texto) => {
    for (const linea of String(texto).split(/\r?\n/)) {
      if (linea.trim()) lineas.push(linea);
    }
    // Se recorta sobre la marcha para no acumular el log entero en memoria.
    if (lineas.length > LINEAS_DE_LOG * 3) lineas.splice(0, lineas.length - LINEAS_DE_LOG);
  };

  // Restos de un intento anterior que muriera a mitad.
  await borrar(nuevo);
  await borrar(viejo);

  // `npx astro build --outDir`, no `npm run build`: hay que pasarle el
  // directorio de salida y por `npm run` los argumentos extra necesitan un
  // `--` por medio que se pierde en cuanto alguien toque el script del
  // package.json. Llamar a Astro directamente quita ese intermediario.
  const orden = env.ordenCompilacion ?? 'npx';
  // `--outDir` se añade SIEMPRE, también cuando el entorno define sus propios
  // argumentos: sin él, Astro escribiría directamente sobre el directorio que
  // sirve Apache y se perdería el cambio atómico, que es lo que impide que un
  // fallo a mitad deje el sitio roto.
  const argumentos = [
    ...(env.argumentosCompilacion ?? ['astro', 'build']),
    '--outDir', nuevo,
  ];

  const resultado = await new Promise((resolver) => {
    let hijo;
    try {
      hijo = spawn(orden, argumentos, {
        cwd: raiz,
        // `npm` en Windows es un .cmd y `spawn` sin shell no lo encuentra.
        // `shell` se activa SOLO en Windows y SOLO porque no hay alternativa;
        // en el servidor (Linux) sigue desactivado.
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          // La compilación consulta la API para traerse el contenido. Se le
          // pasa explícitamente para que no dependa del .env del frontend, que
          // puede apuntar a producción.
          PUBLIC_API_URL: env.urlApiParaCompilar ?? `http://localhost:${env.port}${env.basePath || '/api'}`,
        },
      });
    } catch (error) {
      return resolver({ ok: false, salida: `No se pudo lanzar «${orden}»: ${error.message}` });
    }

    const reloj = setTimeout(() => {
      anotar(`[tope] la compilación pasó de ${TOPE_MS / 1000} s y se cortó`);
      hijo.kill('SIGKILL');
    }, TOPE_MS);

    hijo.stdout?.on('data', anotar);
    hijo.stderr?.on('data', anotar);
    hijo.on('error', (error) => {
      clearTimeout(reloj);
      resolver({ ok: false, salida: `Fallo al ejecutar la compilación: ${error.message}` });
    });
    hijo.on('close', (codigo) => {
      clearTimeout(reloj);
      resolver({
        ok: codigo === 0,
        salida: lineas.slice(-LINEAS_DE_LOG).join('\n')
          + (codigo === 0 ? '' : `\n[salida ${codigo}]`),
      });
    });
  });

  if (!resultado.ok) {
    // El sitio anterior ni se ha tocado: `dist/` sigue como estaba.
    await borrar(nuevo);
    return resultado;
  }

  // Comprobación mínima antes de dar el cambiazo: una compilación que termina
  // con éxito pero sin portada significa que algo salió mal en silencio.
  try {
    await access(join(nuevo, 'index.html'));
  } catch {
    await rm(nuevo, { recursive: true, force: true });
    return {
      ok: false,
      salida: `${resultado.salida}\n[revisión] la compilación acabó bien pero no generó index.html`,
    };
  }

  // El cambiazo. A partir de aquí es cuestión de milisegundos.
  let habiaDestino = true;
  try {
    await access(destino);
  } catch {
    habiaDestino = false;
  }

  if (habiaDestino) await rename(destino, viejo);
  try {
    await rename(nuevo, destino);
  } catch (error) {
    // Si el segundo renombrado falla, se devuelve el sitio anterior a su sitio
    // antes de rendirse. Dejarlo fuera sería dejar el sitio sin servir.
    if (habiaDestino) await rename(viejo, destino).catch(() => {});
    return { ok: false, salida: `${resultado.salida}\n[cambio] ${error.message}` };
  }
  await rm(viejo, { recursive: true, force: true });

  return resultado;
}

/** Crea la carpeta de destino si el proyecto nunca se compiló. */
export async function prepararCarpetas() {
  await mkdir(carpetaFrontend(), { recursive: true });
}
