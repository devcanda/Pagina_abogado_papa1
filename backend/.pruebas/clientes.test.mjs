/**
 * Pruebas de la franja «Nuestros clientes».
 *
 * Ver `specs/009-nuestros-clientes/`.
 *
 * ── Lo que NO se comprueba en el navegador, y por qué ─────────────────────
 * Si un logotipo «de verdad se pinta» no se puede medir con `naturalWidth`:
 * vale 0 mientras la imagen no se haya cargado, y las siete van en carga
 * diferida, que este equipo no dispara con la ventana en segundo plano. Es la
 * misma trampa que ya puso en rojo la comprobacion de casillas vacias de los
 * avales del perito el dia que estrenaron logotipo.
 *
 * Aqui el navegador devuelve solo la DIRECCION de cada imagen y quien la mide
 * es Node, descargandola y leyendo la cabecera del WebP o del PNG.
 *
 * ── Una prueba NO puede nombrar contenido ─────────────────────────────────
 * Ni cuantos clientes hay, ni como se llaman, ni cual va primero. Todo eso se
 * cambia desde el panel. Lo que se comprueba es el COMPORTAMIENTO, y los
 * valores se leen de la copia que se toma al empezar.
 */
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const SITIO = process.env.SITIO ?? 'http://localhost:4340';
const CORREO = process.env.CORREO;
const CLAVE = process.env.CLAVE;
if (!CORREO || !CLAVE) {
  console.error('Faltan CORREO y CLAVE en el entorno.');
  process.exit(2);
}

const sql = (q) => execFileSync('docker', ['exec', '-i', 'candamil-db-dev', 'psql',
  '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A', '-c', q], { encoding: 'utf8' }).trim();

const res = [];
const comprobar = (n, c, d = '') => { res.push(Boolean(c)); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(54)} ${d}`); };
const titulo = (t) => console.log(`\n== ${t} ==`);

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

const ID = Number(sql("SELECT id FROM bloques WHERE tipo='muroClientes'"));
if (!ID) { console.error('No existe el bloque de clientes.'); process.exit(2); }

/*
 * Copia al empezar y devolucion en el `finally`. Las variables que usa el
 * `finally` se declaran FUERA del `try`: una `const` dentro del bloque no
 * existe alli, y un `finally` que revienta no protege nada.
 */
const COPIA = sql(`SELECT datos::text FROM bloques WHERE id=${ID}`);
const tokenCsrf = (await (await pedir('/panel/bloques')).text()).match(/const CSRF = "([a-f0-9]+)"/)?.[1];

const guardarBloque = async (datos) => (await pedir(`/panel/bloques/${ID}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': tokenCsrf },
  body: JSON.stringify({ datos, variantes: {} }),
})).status;

/** Lee ancho y alto de un WebP o un PNG a partir de sus bytes de cabecera. */
const medirArchivo = async (url) => {
  const b = Buffer.from(await (await fetch(url)).arrayBuffer());
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const tipo = b.toString('ascii', 12, 16);
    if (tipo === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (tipo === 'VP8L') {
      const n = b.readUInt32LE(21);
      return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 };
    }
    if (tipo.startsWith('VP8')) return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  if (b.length > 24 && b.toString('ascii', 1, 4) === 'PNG') {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  return { w: 0, h: 0 };
};

/** Mide la franja en la pagina real, a los anchos dados. */
const medir = async (anchos, reducido = false) => {
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
    /*
     * Sin esto, este Chrome congela el reloj de las animaciones por estar en
     * segundo plano: `playState` dice `running` y `currentTime` no avanza ni
     * un milisegundo. Se estaria midiendo si alguien tenia la ventana delante,
     * no si la cinta se mueve. Es la hermana del aviso de la carga diferida.
     */
    await env('Emulation.setFocusEmulationEnabled', { enabled: true });
    await env('Page.setWebLifecycleState', { state: 'active' });
    for (const ancho of anchos) {
      await env('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: reducido ? 'reduce' : 'no-preference' }],
      });
      await env('Emulation.setDeviceMetricsOverride', { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700 });
      const c = esperar('Page.loadEventFired');
      await env('Page.navigate', { url: `${SITIO}/?c=${Date.now()}` });
      await c;
      await new Promise((r) => setTimeout(r, 800));
      const { result } = await env('Runtime.evaluate', { returnByValue: true, expression: `
        (() => {
          const ul = document.querySelector('[data-clientes]');
          if (!ul) return JSON.stringify({ falta: true });
          const lis = [...ul.querySelectorAll('li')];
          const tops = lis.map((li) => Math.round(li.getBoundingClientRect().top));
          const filas = [...new Set(tops)];
          return JSON.stringify({
            marcas: lis.length,
            filas: filas.length,
            porFila: filas.map((t) => tops.filter((x) => x === t).length),
            imagenes: lis.map((li) => { const i = li.querySelector('img'); return i ? i.src : null; }),
            textos: lis.map((li) => li.querySelector('img') ? null : li.textContent.trim()),
            alts: lis.map((li) => { const i = li.querySelector('img'); return i ? i.getAttribute('alt') : null; }),
            desborda: document.documentElement.scrollWidth > window.innerWidth,
            cierre: /Evaluamos su caso/.test(document.body.innerText),
            cinta: (() => {
              const pista = document.querySelector('.cinta-pista');
              if (!pista) return null;
              const grupos = [...document.querySelectorAll('.cinta-grupo')]
                .filter((g) => getComputedStyle(g).display !== 'none');
              const cs = getComputedStyle(pista);
              const an = pista.getAnimations()[0];
              return {
                grupos: grupos.length,
                ocultos: grupos.filter((g) => g.getAttribute('aria-hidden') === 'true').length,
                pista: Math.round(pista.getBoundingClientRect().width),
                grupo: Math.round(grupos[0].getBoundingClientRect().width),
                animacion: cs.animationName,
                estado: an ? an.playState : 'sin animacion',
                holgura: Math.round(pista.getBoundingClientRect().width
                  - window.innerWidth - pista.getBoundingClientRect().width / grupos.length),
              };
            })(),
          });
        })()` });
      salida[ancho] = JSON.parse(result.value);
    }
  } finally { ws.close(); }
  return salida;
};

let fallo = null;
try {
  const datos = JSON.parse(COPIA);
  const declarados = (datos.clientes ?? []).filter((c) => c && c.nombre);

  titulo('La franja se pinta y sustituye a la de cierre');
  const m = await medir([1920, 1440, 1280, 1024, 768, 390, 360]);
  comprobar('la franja existe en todos los anchos',
    Object.values(m).every((v) => !v.falta), `${Object.keys(m).length} anchos`);
  comprobar('sale una marca por cliente declarado',
    Object.values(m).every((v) => v.marcas === declarados.length),
    `${m[1440].marcas} marcas · ${declarados.length} declarados`);
  comprobar('la franja de cierre ya no se pinta',
    Object.values(m).every((v) => v.cierre === false));
  comprobar('el bloque de cierre sigue en la base, apagado',
    sql("SELECT visible FROM bloques WHERE tipo='franjaCierre'") === 'f');

  titulo('La cinta se mueve sola, y sin JavaScript');
  comprobar('todas las marcas van en una sola fila',
    Object.values(m).every((v) => v.filas === 1),
    Object.entries(m).map(([a, v]) => `${a}:${v.porFila.join('+')}`).join(' '));
  comprobar('no desborda a ningun ancho',
    Object.values(m).every((v) => v.desborda === false));
  comprobar('la cinta existe y esta en marcha',
    Object.values(m).every((v) => v.cinta && v.cinta.animacion !== 'none' && v.cinta.estado === 'running'),
    `${m[1440].cinta?.animacion} · ${m[1440].cinta?.estado}`);
  /*
   * El EMPALME. El paso de la animacion es un tercio de la pista, asi que ese
   * tercio tiene que medir exactamente lo que mide un grupo; si no, en cada
   * vuelta se ve un salto. Es lo que se rompe si alguien cambia el hueco de
   * `margin-inline-end` por un `gap` en la lista: con `gap`, el hueco entre
   * grupos no cuenta igual que el de dentro y los tercios dejan de coincidir.
   */
  comprobar('el paso coincide con un grupo, asi que no hay costura',
    Object.values(m).every((v) => v.cinta && Math.abs(v.cinta.pista / v.cinta.grupos - v.cinta.grupo) <= 1),
    `pista ${m[1440].cinta?.pista} / ${m[1440].cinta?.grupos} vs grupo ${m[1440].cinta?.grupo}`);
  /*
   * Y la pista tiene que ser mas ancha que la pantalla MAS un grupo entero, o
   * al final del ciclo asoma un hueco por la derecha.
   */
  comprobar('la pista cubre la pantalla mas un grupo',
    Object.values(m).every((v) => v.cinta && v.cinta.holgura > 0),
    `holgura minima ${Math.min(...Object.values(m).map((v) => v.cinta?.holgura ?? -1))}px`);
  comprobar('solo se anuncia un grupo al lector de pantalla',
    Object.values(m).every((v) => v.cinta && v.cinta.ocultos === v.cinta.grupos - 1),
    `${m[1440].cinta?.ocultos} de ${m[1440].cinta?.grupos} ocultos`);

  titulo('Con «menos movimiento» se apaga');
  const r = await medir([1280, 390], true);
  comprobar('la animacion no corre',
    Object.values(r).every((v) => v.cinta === null || v.cinta.animacion === 'none'),
    `${r[1280].cinta?.animacion ?? 'sin cinta'}`);
  comprobar('queda un solo grupo, y no desborda',
    Object.values(r).every((v) => v.marcas === declarados.length && v.desborda === false),
    `${r[1280].marcas} marcas · ${r[390].marcas} en movil`);

  titulo('Ninguna casilla queda vacia');
  const urls = m[1440].imagenes;
  const medidas = [];
  for (const u of urls) medidas.push(u ? await medirArchivo(u) : null);
  const vacias = medidas.filter((x, i) => (x ? x.w < 4 : !m[1440].textos[i])).length;
  comprobar('toda marca trae logotipo real o su nombre', vacias === 0,
    `${medidas.filter((x) => x && x.w >= 4).length} con logotipo · ${m[1440].textos.filter(Boolean).length} con texto`);
  comprobar('todo logotipo lleva texto alternativo',
    m[1440].alts.every((a, i) => urls[i] === null || (a && a.trim().length > 0)),
    `${m[1440].alts.filter(Boolean).length} con alt`);

  titulo('Los logotipos se igualan por AREA, no por altura');
  const reales = medidas.filter((x) => x && x.w >= 4);
  comprobar('todos llegan en el mismo lienzo',
    new Set(reales.map((x) => `${x.w}x${x.h}`)).size === 1,
    [...new Set(reales.map((x) => `${x.w}x${x.h}`))].join(' '));

  titulo('Un cliente sin logotipo enseña su nombre');
  const sinFoto = declarados.map((c, i) => (i === 0 ? { ...c, imagen: '' } : c));
  const estado = await guardarBloque({ ...datos, clientes: sinFoto });
  comprobar('el panel acepta quitar el logotipo', estado === 200, `HTTP ${estado}`);
  const guardado = JSON.parse(sql(`SELECT datos::text FROM bloques WHERE id=${ID}`));
  comprobar('el primer cliente se queda sin imagen',
    !guardado.clientes[0].imagen, `imagen: ${JSON.stringify(guardado.clientes[0].imagen ?? null)}`);
  comprobar('y conserva su nombre, que es el respaldo',
    guardado.clientes[0].nombre === declarados[0].nombre);
  comprobar('los demas no se tocan',
    guardado.clientes.slice(1).every((c, i) => c.imagen === declarados[i + 1].imagen),
    `${guardado.clientes.length - 1} intactos`);
} catch (e) {
  fallo = e;
} finally {
  /*
   * La devolucion va SIEMPRE, y se compara contra la COPIA, no contra un valor
   * escrito a mano: si no, la prueba daria por hecho como estaba la portada el
   * dia que se escribio.
   */
  titulo('Se deja como estaba');
  const estado = await guardarBloque(JSON.parse(COPIA));
  const vuelto = sql(`SELECT datos::text FROM bloques WHERE id=${ID}`);
  comprobar('el contenido original vuelve',
    JSON.stringify(JSON.parse(vuelto)) === JSON.stringify(JSON.parse(COPIA)), `HTTP ${estado}`);
}

if (fallo) { console.error('\n', fallo); }
const bien = res.filter(Boolean).length;
console.log(`\n  ${bien}/${res.length} comprobaciones correctas`);
process.exit(fallo || bien !== res.length ? 1 : 0);
