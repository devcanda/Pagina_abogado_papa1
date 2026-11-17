/**
 * Pruebas del bloque de redes sociales.
 *
 * Lo que de verdad hay que vigilar aquí no es el aspecto: es que una URL del
 * panel acaba dentro del `src` de un `<iframe>`. Si esa validación se afloja,
 * alguien con acceso al panel puede colar contenido de terceros en la portada
 * del bufete. Por eso la mitad de la suite son intentos de colarla.
 *
 * El aspecto se comprueba mirando, y solo tiene sentido con las cuentas
 * reales: con URLs inventadas las incrustaciones muestran errores de TikTok y
 * de Meta, no fallos nuestros.
 */
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const CORREO = process.env.CORREO;
const CLAVE = process.env.CLAVE;
if (!CORREO || !CLAVE) {
  console.error('Faltan CORREO y CLAVE en el entorno.');
  process.exit(2);
}

const sql = (q) => execFileSync('docker', ['exec', '-i', 'candamil-db-dev', 'psql',
  '-U', 'candamil_app', '-d', 'candamil_db', '-t', '-A', '-c', q], { encoding: 'utf8' }).trim();

const res = [];
const comprobar = (n, c, d = '') => { res.push(c); console.log(`  ${c ? 'ok' : '!!'} ${n.padEnd(56)} ${d}`); };

let cookies = '';
const guardar = (r) => {
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const [par] = c.split(';'); const [n] = par.split('=');
    cookies = [...cookies.split('; ').filter((x) => x && !x.startsWith(`${n}=`)), par].join('; ');
  }
};
const pedir = async (ruta, o = {}) => {
  const r = await fetch(BASE + ruta, { redirect: 'manual', ...o, headers: { cookie: cookies, ...(o.headers ?? {}) } });
  guardar(r); return r;
};

// ── Sesión ──────────────────────────────────────────────────────────────────
const csrf = (await (await pedir('/panel/entrar')).text()).match(/name="_csrf" value="([a-f0-9]+)"/)?.[1];
await pedir('/panel/entrar', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: CORREO, clave: CLAVE }),
});

const idBloque = sql("SELECT id FROM bloques WHERE tipo='redesSociales'");
if (!idBloque) { console.error('No existe el bloque de redes. ¿Falta la migración 012?'); process.exit(2); }

/*
 * Se escribe sobre el bloque REAL: copia al empezar y devolución en el
 * `finally`. Una suite hermana se saltó esto y dejó la portada publicada con
 * sus valores de prueba.
 */
const COPIA = sql(`SELECT datos::text FROM bloques WHERE id=${Number(idBloque)}`);
const tokenCsrf = (await (await pedir('/panel/bloques')).text()).match(/const CSRF = "([a-f0-9]+)"/)?.[1];

const guardarBloque = async (datos) => (await pedir(`/panel/bloques/${Number(idBloque)}`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-csrf-token': tokenCsrf },
  body: JSON.stringify({ datos, variantes: {} }),
})).status;

const videoGuardado = () => sql(`SELECT COALESCE(datos->>'youtubeVideo','') FROM bloques WHERE id=${Number(idBloque)}`);
const campoGuardado = (c) => sql(`SELECT COALESCE(datos->>'${c}','') FROM bloques WHERE id=${Number(idBloque)}`);

try {
  console.log('\n== Una URL que no es de YouTube no se guarda ==');
  /*
   * Lista de lo PERMITIDO, no de lo prohibido. Cada uno de estos entraría por
   * un hueco distinto: otro dominio, otro protocolo, y un `javascript:` que
   * es el caso clásico de inyección en un atributo.
   */
  for (const [nombre, url] of [
    ['otro dominio', 'https://evil.example.com/watch?v=dQw4w9WgXcQ'],
    ['sin cifrar', 'http://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    ['javascript:', 'javascript:alert(document.cookie)'],
    ['dominio parecido', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ'],
    ['id inventado', 'https://www.youtube.com/watch?v=corto'],
  ]) {
    await guardarBloque({ titulo: 'Redes', youtubeVideo: url });
    comprobar(`se descarta: ${nombre}`, videoGuardado() === '', videoGuardado() || '(vacío)');
  }

  console.log('\n== Una URL buena se guarda LIMPIA ==');
  await guardarBloque({ titulo: 'Redes', youtubeVideo: 'https://youtu.be/dQw4w9WgXcQ?si=basuraDeSesion' });
  comprobar('el enlace corto se convierte en el canónico',
    videoGuardado() === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoGuardado());

  await guardarBloque({ titulo: 'Redes', youtubeVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42&si=x' });
  comprobar('se tira la basura de sesión',
    videoGuardado() === 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoGuardado());

  console.log('\n== Los perfiles se validan igual que el video ==');
  /*
   * TikTok y Facebook se editan desde el panel desde el 11-11-2026. Entran por
   * el mismo sitio que el video y acaban en un `cite`, un `data-href` y un
   * `href`, asi que valen las mismas reglas: lista de dominios permitidos y
   * direccion reconstruida por nosotros.
   */
  for (const [campo, malas, buena, esperada] of [
    ['tiktokPerfil',
      ['https://evil.example.com/@alguien', 'http://www.tiktok.com/@alguien',
       'https://tiktok.com.evil.test/@alguien', 'javascript:alert(1)'],
      'https://www.tiktok.com/@alguien?lang=es&is_from_webapp=1',
      'https://www.tiktok.com/@alguien'],
    ['facebookPagina',
      ['https://evil.example.com/pagina', 'http://www.facebook.com/pagina',
       'https://facebook.com.evil.test/pagina', 'javascript:alert(1)'],
      'https://www.facebook.com/unapagina/?ref=basura',
      'https://www.facebook.com/unapagina'],
  ]) {
    for (const mala of malas) {
      await guardarBloque({ titulo: 'Redes', [campo]: mala });
      comprobar(`${campo}: se descarta ${mala.slice(0, 32)}`, campoGuardado(campo) === '',
        campoGuardado(campo) || '(vacio)');
    }
    await guardarBloque({ titulo: 'Redes', [campo]: buena });
    comprobar(`${campo}: la buena se guarda limpia`, campoGuardado(campo) === esperada,
      campoGuardado(campo));
  }

  /*
   * Y los TRES a la vez antes de publicar.
   *
   * Cada guardado reemplaza los datos enteros, asi que el ultimo del bucle
   * dejaba el bloque con un solo perfil y sin video, y lo que se publicaba no
   * era el bloque completo. Con los tres puestos, la comprobacion de los
   * enlaces de respaldo mide algo de verdad en vez de pasar por el caso
   * «no hay nada configurado».
   */
  await guardarBloque({
    titulo: 'Redes',
    tiktokPerfil: 'https://www.tiktok.com/@alguien',
    facebookPagina: 'https://www.facebook.com/unapagina',
    youtubeVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });

  console.log('\n== Y así sale en la página publicada ==');
  const pub = await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': tokenCsrf } });
  comprobar('la publicación arranca', pub.status === 202);
  /*
   * Esperar a VERLA arrancar antes de esperar a que acabe.
   *
   * La ruta responde 202 en cuanto coge el candado, no cuando termina: sin el
   * primer bucle, la primera lectura llega antes de que la compilacion empiece
   * y se sale creyendo que ya esta, midiendo el sitio ANTERIOR.
   */
  for (let i = 0; i < 50; i++) {
    const e = await (await pedir('/panel/publicar/estado')).json();
    if ((e.data ?? e).estado === 'en-marcha') break;
    await new Promise((r) => setTimeout(r, 200));
  }
  for (let i = 0; i < 120; i++) {
    const e = await (await pedir('/panel/publicar/estado')).json();
    if ((e.data ?? e).estado !== 'en-marcha') break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  const html = await readFile('../frontend/dist/index.html', 'utf8');
  comprobar('el vídeo se sirve desde youtube-nocookie',
    html.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'));
  /*
   * Lo que el editor escribió NO puede aparecer en un `src`. Aunque la
   * validación lo aceptara, el componente arma la dirección por su cuenta.
   */
  comprobar('la URL del editor no viaja a ningún src',
    !/src="https:\/\/www\.youtube\.com\//.test(html));

  /*
   * La RESERVA es lo que sostiene la columna cuando la incrustacion no llega.
   *
   * Sin ella, el marco de TikTok se queda en la altura de su enlace de
   * respaldo -28px medidos- junto a un video de 362, y la fila se descuadra.
   * No es un caso raro: se descubrio en una maquina que filtra `tiktok.com`,
   * que es justo lo que hacen una red corporativa o un bloqueador de
   * rastreadores. El enlace seguia ahi, que era lo prometido, pero la portada
   * parecia rota.
   */
  comprobar('el marco reserva su alto por si la incrustacion no llega',
    /class="[^"]*reserva-red/.test(html) && /\.reserva-red\b/.test(html));

  console.log('\n== El bloque sobrevive sin los scripts de terceros ==');
  /*
   * Es el caso de quien bloquea rastreadores, que es mucha gente. Sin estos
   * enlaces el bloque sería un hueco en medio de la portada.
   */
  const seccion = html.slice(html.indexOf('youtube-nocookie') - 4000, html.indexOf('youtube-nocookie') + 4000);
  comprobar('queda al menos un enlace alcanzable sin JavaScript',
    /<a[^>]+href="https:\/\/(www\.)?(tiktok|facebook|youtube)\.com/.test(seccion)
    || !/tiktok-embed|fb-page/.test(seccion),
    'sin perfiles configurados no hay nada que enlazar, y es correcto');

} finally {
  console.log('\n== Se deja como estaba ==');
  const st = await guardarBloque(JSON.parse(COPIA));
  // Contra la COPIA, no contra un valor escrito a mano.
  comprobar('el contenido original vuelve',
    st === 200 && videoGuardado() === (JSON.parse(COPIA).youtubeVideo ?? ''),
    videoGuardado() || '(vacío)');

  /*
   * Y se RECOMPILA, porque esta suite publica a mitad.
   *
   * Devolver solo la base no basta: el sitio es estático, así que `dist/` se
   * quedaría con el vídeo de prueba publicado aunque la base ya estuviera
   * limpia. Una prueba que deja el sitio alterado no es una prueba.
   */
  await pedir('/panel/publicar', { method: 'POST', headers: { 'x-csrf-token': tokenCsrf } });
  /*
   * Esperar a VERLA arrancar antes de esperar a que acabe.
   *
   * La ruta responde 202 en cuanto coge el candado, no cuando termina: sin el
   * primer bucle, la primera lectura llega antes de que la compilacion empiece
   * y se sale creyendo que ya esta, midiendo el sitio ANTERIOR.
   */
  for (let i = 0; i < 50; i++) {
    const e = await (await pedir('/panel/publicar/estado')).json();
    if ((e.data ?? e).estado === 'en-marcha') break;
    await new Promise((r) => setTimeout(r, 200));
  }
  for (let i = 0; i < 120; i++) {
    const e = await (await pedir('/panel/publicar/estado')).json();
    if ((e.data ?? e).estado !== 'en-marcha') break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  const limpio = await readFile('../frontend/dist/index.html', 'utf8');
  comprobar('el sitio publicado ya no lleva el vídeo de prueba',
    !limpio.includes('dQw4w9WgXcQ'));
}

console.log('\n== El bloque al que sustituye sigue ahí, apagado ==');
const viejo = sql("SELECT visible::text FROM bloques WHERE tipo='cifrasYPreguntas'");
comprobar('cifrasYPreguntas existe y está oculto', viejo === 'false', `visible=${viejo || '(no existe)'}`);

const fallos = res.filter((x) => !x).length;
console.log(`\n  ${res.length - fallos}/${res.length} comprobaciones correctas`);
process.exitCode = fallos ? 1 : 0;
