/**
 * Pruebas del fondo a sangre del bloque «Perito avaluador».
 *
 * Lo que hay que vigilar aquí es una sustitución: al poner fondo, la figura
 * enmarcada SE RETIRA y el texto tiene que quedarse donde estaba. Si el texto
 * se corriera a la primera columna, se pondría justo encima de la mitad de la
 * foto que el encuadre deja libre, y nadie lo vería hasta mirar la página.
 *
 * ── Por qué NO se comprueba que la foto cargue ────────────────────────────
 * El fondo va en `loading="lazy"`, y en este equipo Chrome no dispara la carga
 * diferida: con la ventana en segundo plano no actualiza intersecciones.
 * Medido — de las 13 imágenes diferidas de la portada, incluidas las que
 * llevan semanas publicadas, cargan CERO. Una comprobación que dependa de eso
 * no mide el sitio, mide si alguien tenía el navegador delante.
 *
 * Se comprueba la ESTRUCTURA y la GEOMETRÍA, que es lo que este bloque aporta:
 * que la capa exista y cubra la sección exacta, que la figura desaparezca, que
 * el texto siga pasada la mitad y que el velo sea plano o degradado según el
 * ancho.
 */
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const SITIO = process.env.SITIO ?? 'http://localhost:4340';
const CORREO = process.env.CORREO;
const CLAVE = process.env.CLAVE;
if (!CORREO || !CLAVE) {
  console.error('Faltan CORREO y CLAVE en el entorno.');
  process.exit(2);
}

const RAIZ = new URL('../../', import.meta.url).pathname.replace(/^\//, '');
/*
 * La ruta del archivo se LEE de la base, no se escribe aqui.
 *
 * Ponia `fondo-perito.png`, que era cierto mientras el hueco estuvo con su
 * relleno de 1x1. En cuanto se subio la foto de verdad el archivo paso a
 * `.webp` —el panel decide la extension— y la suite reventaba con ENOENT antes
 * de comprobar nada. Es la misma regla de siempre: una prueba no nombra
 * contenido.
 */
const rutaHueco = () => `${RAIZ}frontend/public${sql("SELECT archivo FROM medios WHERE clave='fondo-perito'")}`;
const CARPETA_TMP = process.env.TMPDIR ?? tmpdir();
const RESPALDO = `${CARPETA_TMP}/respaldo-fondo-perito.bin`;

const sql = (q) => execFileSync('docker', ['exec', '-i', 'candamil-db-dev', 'psql',
  '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A', '-c', q], { encoding: 'utf8' }).trim();

const res = [];
const comprobar = (n, c, d = '') => { res.push(Boolean(c)); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(54)} ${d}`); };

let cookies = '';
const guardarCookies = (r) => {
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const [par] = c.split(';'); const [n] = par.split('=');
    cookies = [...cookies.split('; ').filter((x) => x && !x.startsWith(`${n}=`)), par].join('; ');
  }
};
const pedir = async (ruta, o = {}) => {
  const r = await fetch(BASE + ruta, { redirect: 'manual', ...o, headers: { cookie: cookies, ...(o.headers ?? {}) } });
  guardarCookies(r); return r;
};

const csrfEntrada = (await (await pedir('/panel/entrar')).text()).match(/name="_csrf" value="([a-f0-9]+)"/)?.[1];
await pedir('/panel/entrar', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrfEntrada, email: CORREO, clave: CLAVE }),
});

const ID = Number(sql("SELECT id FROM bloques WHERE tipo='servicioDestacado'"));
if (!ID) { console.error('No existe el bloque del perito.'); process.exit(2); }

/*
 * Copia al empezar, devolución en el `finally`. Y el HUECO DE IMAGEN también
 * es contenido: `fondos.test.mjs` aprendió por las malas que devolver solo los
 * textos deja la portada publicada sin su foto.
 *
 * Las variables que usa el `finally` se declaran FUERA del `try`.
 */
const COPIA = sql(`SELECT datos::text FROM bloques WHERE id=${ID}`);
const tokenCsrf = (await (await pedir('/panel/bloques')).text()).match(/const CSRF = "([a-f0-9]+)"/)?.[1];

const guardarBloque = async (datos) => (await pedir(`/panel/bloques/${ID}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': tokenCsrf },
  body: JSON.stringify({ datos, variantes: {} }),
})).status;

/*
 * Publicar y esperar DE VERDAD a que termine.
 *
 * Aqui habia un solo bucle que salia en cuanto el estado no era `en-marcha`,
 * y la ruta responde 202 EN CUANTO COGE EL CANDADO, antes de que la
 * compilacion arranque: la primera lectura llegaba demasiado pronto, salia del
 * bucle y se media el sitio ANTERIOR. Se noto porque `lg:col-start-2` y el
 * degradado del velo solo existen en la hoja de estilos nueva, asi que la
 * prueba denunciaba un texto a la izquierda y un velo plano que en la pagina
 * estaban bien.
 *
 * Primero se espera a VERLA arrancar y solo despues a que acabe.
 */
const estadoPublicacion = async () => {
  const e = await (await pedir('/panel/publicar/estado')).json();
  return (e.data ?? e).estado;
};
const publicar = async () => {
  const r = await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': tokenCsrf } });
  for (let i = 0; i < 50; i++) {
    if ((await estadoPublicacion()) === 'en-marcha') break;
    await new Promise((x) => setTimeout(x, 200));
  }
  for (let i = 0; i < 120; i++) {
    if ((await estadoPublicacion()) !== 'en-marcha') break;
    await new Promise((x) => setTimeout(x, 1000));
  }
  return r.status;
};

/** Mide la sección en la página real, a un ancho dado. */
const medir = async (anchos) => {
  const lista = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const ws = new WebSocket(lista.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map(); const ev = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); return; }
    if (m.method && ev.has(m.method)) { ev.get(m.method)(); ev.delete(m.method); } };
  const env = (a, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: a, params: p })); });
  const esperar = (n) => new Promise((r) => ev.set(n, r));
  const salida = {};
  try {
    await env('Page.enable');
    for (const ancho of anchos) {
      await env('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700 });
      const c = esperar('Page.loadEventFired');
      await env('Page.navigate', { url: `${SITIO}/?t=${Date.now()}` });
      await c;
      await new Promise((r) => setTimeout(r, 900));
      const { result } = await env('Runtime.evaluate', { returnByValue: true, expression: `
        (() => {
          const capa = document.querySelector('.servicio-fondo');
          const marco = document.querySelector('[class*="border-rojo"]');
          const s = (capa ?? marco)?.closest('section');
          if (!s) return JSON.stringify({ falta: true });
          const r = s.getBoundingClientRect();
          const t = s.querySelector('h2').closest('div').getBoundingClientRect();
          const velo = s.querySelector('.servicio-velo');
          const c = capa?.getBoundingClientRect();
          return JSON.stringify({
            hayCapa: Boolean(capa),
            hayFigura: Boolean(marco),
            capaCubre: c ? Math.round(c.left - r.left) === 0 && Math.round(c.right - r.right) === 0
              && Math.round(c.top - r.top) === 0 && Math.round(c.bottom - r.bottom) === 0 : null,
            textoDesde: Math.round((t.left - r.left) / r.width * 100),
            veloDegradado: velo ? getComputedStyle(velo).backgroundImage !== 'none' : null,
            desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          });
        })()` });
      salida[ancho] = JSON.parse(result.value);
      if (process.env.CRUDO) console.log(`    [${ancho}] ${result.value}`);
    }
    await env('Emulation.clearDeviceMetricsOverride');
  } finally { ws.close(); }
  return salida;
};



/**
 * Ancho real de una imagen publicada, leido de sus bytes.
 *
 * No se usa `sharp`: es una dependencia del frontend y esta suite vive en el
 * backend, que a proposito no la tiene. Leer la cabecera de un PNG o de un
 * WebP son veinte lineas, y un formato que no se reconozca DEVUELVE 0, que
 * hace fallar la comprobacion. Es lo correcto: si no se puede medir, no se
 * puede dar por buena.
 */
const anchoDeVerdad = async (src) => {
  const r = await fetch(new URL(src, SITIO));
  if (!r.ok) return 0;
  const b = Buffer.from(await r.arrayBuffer());
  // PNG: ancho en el IHDR, big-endian, a partir del byte 16.
  if (b.length > 24 && b.toString('latin1', 1, 4) === 'PNG') return b.readUInt32BE(16);
  if (b.length > 30 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') {
    const tipo = b.toString('latin1', 12, 16);
    // VP8X (el que trae alfa): ancho-1 en 24 bits little-endian.
    if (tipo === 'VP8X') return 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
    // VP8 simple: 14 bits utiles tras la marca de sincronismo.
    if (tipo === 'VP8 ') return b.readUInt16LE(26) & 0x3fff;
    // VP8L sin perdida: 14 bits a partir del quinto byte del flujo.
    if (tipo === 'VP8L') return 1 + (((b[22] | (b[23] << 8)) & 0x3fff));
  }
  return 0;
};

/**
 * Que ajuste declara el control de archivo de un campo del panel.
 *
 * Antes era una expresion regular con una ventana de 800 caracteres entre el
 * nombre del campo y `data-ajuste`. Se puso roja sola: el desplegable de
 * huecos crecio y la distancia paso a 1101. La prueba no denunciaba nada, solo
 * habia crecido el HTML. Se busca dentro del CAMPO, que es lo que de verdad se
 * quiere comprobar.
 */
const ajusteDelCampo = (html, nombre) => {
  const i = html.indexOf(`name="${nombre}"`);
  if (i < 0) return null;
  // Hasta donde empieza el campo siguiente, no un numero de caracteres.
  const fin = html.indexOf('class="campo', i);
  const trozo = html.slice(i, fin < 0 ? html.length : fin);
  return trozo.match(/data-ajuste="([a-z]+)"/)?.[1] ?? null;
};

/** Mide la franja de sellos en la pagina publicada. */
const medirSellos = async () => {
  const lista = await (await fetch('http://127.0.0.1:9222/json/list')).json();
  const ws = new WebSocket(lista.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pend = new Map(); const ev = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); return; }
    if (m.method && ev.has(m.method)) { ev.get(m.method)(); ev.delete(m.method); } };
  const env = (a, p = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: a, params: p })); });
  const esperar = (n) => new Promise((r) => ev.set(n, r));
  try {
    await env('Page.enable');
    await env('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    const c = esperar('Page.loadEventFired');
    await env('Page.navigate', { url: `${SITIO}/?f=${Date.now()}` });
    await c;
    await new Promise((r) => setTimeout(r, 900));
    const { result } = await env('Runtime.evaluate', { returnByValue: true, expression: `
      (() => {
        const capa = document.querySelector('.servicio-fondo');
        const marco = document.querySelector('[class*="border-rojo"]');
        const s = (capa ?? marco)?.closest('section');
        if (!s) return JSON.stringify({ casillas: 0 });
        /* La lista de SELLOS, no la primera lista de la seccion: la de los
           puntos del servicio va antes y es la que se media por error.
           Sin comillas invertidas aqui dentro: esto viaja en un literal de
           plantilla y una sola lo cierra. */
        const ul = s.querySelector('ul[data-certificaciones]');
        const lis = ul ? [...ul.querySelectorAll('li')] : [];
        /* El rotulo es el parrafo que va justo antes de la lista. Buscarlo por
           clase y posicion era mas fragil de lo que aporta. */
        const rotulo = ul && ul.previousElementSibling && ul.previousElementSibling.tagName === 'P'
          ? ul.previousElementSibling : null;
        const col = rotulo ? getComputedStyle(rotulo).color : null;
        return JSON.stringify({
          casillas: lis.length,
          sinLogo: lis.filter((li) => !li.querySelector('img')).length,
          conTexto: lis.filter((li) => li.textContent.trim().length > 0).length,
          imgSinAlt: lis.filter((li) => { const i = li.querySelector('img'); return i && !i.getAttribute('alt'); }).length,
          /* Si una casilla esta vacia NO se decide aqui, y la primera version
             se equivoco justo en esto.
             Miraba naturalWidth, que es 0 mientras el navegador no haya
             cargado la imagen. Los logotipos van en carga diferida y en este
             equipo Chrome no dispara la carga diferida, asi que en cuanto los
             huecos estrenaron logotipo de verdad la comprobacion denuncio
             cuatro casillas vacias que en la pagina se ven perfectamente.
             Es el mismo aviso que ya esta escrito en la cabecera de este
             archivo: una comprobacion que dependa de la carga diferida mide si
             alguien tenia el navegador delante, no el sitio.
             Lo que se devuelve es la DIRECCION de cada imagen; quien decide si
             detras hay un logotipo o un relleno de 1x1 es Node, descargandola. */
          sellos: lis.map((li) => {
            const i = li.querySelector('img');
            return { texto: li.textContent.trim(), src: i ? (i.currentSrc || i.src) : null };
          }),
          rotuloColor: col,
          // El rojo de marca tiene el canal rojo muy por encima de los otros.
          rotuloRojo: col ? (() => { const n = (col.match(/[0-9]+/g) || []).map(Number); return n.length >= 3 && n[0] > n[1] + 40 && n[0] > n[2] + 40; })() : false,
        });
      })()` });
    await env('Emulation.clearDeviceMetricsOverride');
    const datos = JSON.parse(result.value);
    datos.vacias = 0;
    for (const sello of datos.sellos) {
      if (sello.texto.length > 0) continue;          // el nombre ya la llena
      if (!sello.src) { datos.vacias++; continue; }  // ni texto ni imagen
      /* Un hueco con su relleno de 1x1 NO es un logotipo, pero el componente
         cree que si: hay imagen, asi que deja de pintar el nombre y la casilla
         sale en blanco. Ya paso. Por eso se mide la imagen de verdad. */
      if (await anchoDeVerdad(sello.src) < 4) datos.vacias++;
    }
    return datos;
  } finally { ws.close(); }
};

const ANCHOS = [1920, 1280, 1024, 768, 390];

await mkdir(CARPETA_TMP, { recursive: true });
const HUECO = rutaHueco();
const original = JSON.parse(COPIA);
await copyFile(HUECO, RESPALDO);

try {
  console.log('\n== Sin fondo, el bloque es el de siempre ==');
  /*
   * El estado SE FUERZA, no se da por supuesto.
   *
   * Aqui se media la portada tal cual estaba y se exigia que no tuviera capa
   * de fondo. Valio exactamente hasta el dia que el bloque estreno foto: la
   * prueba se puso roja denunciando el contenido nuevo en lugar de comprobar
   * el comportamiento. Lo que importa es la SUSTITUCION en los dos sentidos,
   * y para eso hay que poner cada estado a proposito.
   */
  comprobar('se puede quitar el fondo desde el panel', (await guardarBloque({
    ...original, imagenFondo: '', imagenFondoMovil: '', velo: 'ninguno',
  })) === 200);
  await publicar();
  const sinFondo = await medir([1280, 390]);
  comprobar('no se emite capa de fondo', sinFondo[1280].hayCapa === false);
  comprobar('y vuelve la figura enmarcada', sinFondo[1280].hayFigura === true);

  console.log('\n== Con fondo, la figura se retira y el texto no se mueve ==');
  /*
   * Se guarda por la RUTA DEL PANEL, no por SQL: así se comprueba de paso que
   * los campos nuevos sobreviven a `sanearDatos`, que es por donde se cuela la
   * mitad de los fallos de este proyecto.
   */
  const datos = { ...original, imagenFondo: 'fondo-perito', velo: 'medio' };
  comprobar('el panel acepta los campos nuevos', (await guardarBloque(datos)) === 200);
  comprobar('y los guarda', sql(`SELECT datos->>'imagenFondo' FROM bloques WHERE id=${ID}`) === 'fondo-perito',
    sql(`SELECT datos->>'imagenFondo' FROM bloques WHERE id=${ID}`));
  /*
   * La clave de la FIGURA se conserva aunque el panel deje de pintar el campo.
   * Es lo que permite volver al diseño anterior eligiendo «— sin imagen —».
   */
  comprobar('la clave de la figura NO se pierde',
    sql(`SELECT COALESCE(datos->>'imagen','') FROM bloques WHERE id=${ID}`) === (JSON.parse(COPIA).imagen ?? ''),
    sql(`SELECT COALESCE(datos->>'imagen','') FROM bloques WHERE id=${ID}`));

  comprobar('la publicación termina', (await publicar()) === 202);
  const conFondo = await medir(ANCHOS);

  for (const ancho of ANCHOS) {
    const m = conFondo[ancho];
    comprobar(`${ancho}px · la capa cubre la sección exacta`, m.capaCubre === true);
    comprobar(`${ancho}px · la figura no se pinta`, m.hayFigura === false);
    comprobar(`${ancho}px · sin desbordamiento horizontal`, m.desborde === false);
  }

  console.log('\n== El texto sigue a la derecha desde 1024px ==');
  for (const ancho of [1920, 1280, 1024]) {
    comprobar(`${ancho}px · el texto empieza pasada la mitad`,
      conFondo[ancho].textoDesde >= 50, `empieza al ${conFondo[ancho].textoDesde}%`);
  }

  console.log('\n== El velo cambia en lg, no en md ==');
  /*
   * Esta sección pasa a dos columnas en `lg` (1024px), no en `md` como la
   * cabecera. Con el corte en `md`, entre 768 y 1023px el texto ocupa todavía
   * el ancho entero y le tocaría un degradado que deja limpia la mitad
   * izquierda: medio titular sobre la foto.
   */
  comprobar('1024px · degradado', conFondo[1024].veloDegradado === true);
  comprobar('768px · plano', conFondo[768].veloDegradado === false);
  comprobar('390px · plano', conFondo[390].veloDegradado === false);

  console.log('\n== La franja de entidades certificadoras ==');
  /*
   * Cuantas hay se le pregunta a la BASE. Escribir «cinco» aqui obligaria a
   * tocar la prueba cada vez que el cliente anada o quite una entidad, que es
   * justo lo que convierte una suite en algo que nadie vuelve a mirar.
   */
  const cuantas = Number(sql(`SELECT COALESCE(jsonb_array_length(datos->'certificaciones'), 0)
    FROM bloques WHERE id=${ID}`));
  const franja = await medirSellos();
  comprobar('sale una casilla por entidad', cuantas > 0 && franja.casillas === cuantas,
    `${franja.casillas} casillas · ${cuantas} entidades`);
  /*
   * Sin logotipo se pinta el NOMBRE, no un hueco roto. Es lo que permite
   * valorar el espacio antes de que lleguen los archivos, y lo que evita que
   * el dia de manana una entidad sin logotipo deje un cuadro en blanco.
   */
  /*
   * NINGUNA casilla puede quedar vacia. O logotipo con texto alternativo, o el
   * nombre escrito.
   *
   * La comprobacion anterior era mas floja —comparaba cuantas tenian texto con
   * cuantas no tenian logotipo— y dejo pasar exactamente el fallo que venia a
   * cazar: al apuntar las cinco entidades a huecos que todavia guardaban su
   * relleno de 1x1, el componente creyo que habia logotipo, dejo de pintar el
   * nombre y la franja salio con cinco cuadros en blanco. La prueba dio verde.
   */
  comprobar('ninguna casilla queda vacia', franja.vacias === 0,
    `${franja.vacias} vacias · ${franja.sinLogo} sin logotipo · ${franja.conTexto} con texto`);
  comprobar('todo logotipo lleva texto alternativo', franja.imgSinAlt === 0,
    `${franja.imgSinAlt} sin alt`);
  /*
   * El rotulo NO puede ir en el rojo de marca: queda centrado sobre la foto,
   * donde el velo solo esta a medias, y ademas el boton rojo esta justo
   * encima. El rojo se reserva a la accion.
   */
  comprobar('el rotulo de la franja no va en rojo', franja.rotuloRojo === false,
    franja.rotuloColor ?? '');

  console.log('\n== El logotipo se CONTIENE, no se recorta ==');
  /*
   * El panel reduce con `cover`, que corta el lado largo. A una foto le sienta
   * bien; a un logotipo le corta letras, y son marcas ajenas. El campo pide
   * `contener` y el control tiene que llevarlo, o el recorte vuelve en
   * silencio la proxima vez que alguien suba un archivo.
   */
  const htmlPanel = await (await pedir('/panel/bloques')).text();
  comprobar('el control del logotipo pide «contener»',
    ajusteDelCampo(htmlPanel, 'certificaciones.0.imagen') === 'contener',
    ajusteDelCampo(htmlPanel, 'certificaciones.0.imagen') ?? 'no lo declara');

} finally {
  console.log('\n== Se deja como estaba ==');
  await copyFile(RESPALDO, HUECO);
  /*
   * Los campos se mandan VACIOS a proposito, no se omiten.
   *
   * `conciliar()` conserva lo que el formulario no envia —es lo que protege a
   * los campos de reserva— asi que devolver el objeto original SIN
   * `imagenFondo` dejaba el fondo puesto y la prueba se iba creyendo que habia
   * limpiado. Para quitar un campo hay que escribirlo en blanco.
   */
  const st = await guardarBloque({
    ...original,
    imagenFondo: original.imagenFondo ?? '',
    imagenFondoMovil: original.imagenFondoMovil ?? '',
    velo: original.velo ?? 'ninguno',
  });
  // Contra la COPIA, no contra un valor escrito a mano.
  comprobar('el contenido original vuelve',
    st === 200 && sql(`SELECT COALESCE(datos->>'imagenFondo','') FROM bloques WHERE id=${ID}`)
      === (JSON.parse(COPIA).imagenFondo ?? ''),
    sql(`SELECT COALESCE(datos->>'imagenFondo','(sin fondo)') FROM bloques WHERE id=${ID}`));
  /*
   * Y se RECOMPILA, porque esta suite publica a mitad: devolver la base no
   * basta cuando el sitio es estático.
   */
  await publicar();
  const final = await medir([1280]);
  /*
   * Contra la COPIA, no contra un valor escrito a mano: la portada vuelve a
   * tener figura o fondo segun lo que hubiera ANTES de la prueba. Escrito como
   * `=== true` daba por hecho que el bloque empieza sin foto, y dejo de ser
   * cierto en cuanto la estreno.
   */
  const teniaFondo = Boolean(JSON.parse(COPIA).imagenFondo);
  comprobar(`y la portada vuelve a ${teniaFondo ? 'su fondo' : 'su figura'}`,
    final[1280].hayFigura === !teniaFondo && final[1280].hayCapa === teniaFondo);
}

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
process.exitCode = fallos ? 1 : 0;
