/**
 * Pruebas de extremo a extremo del panel.
 *
 * En Node y no con curl porque `curl -F` falla al leer archivos en Git Bash
 * sobre Windows ("read error getting mime data"), y aquí hace falta control
 * exacto sobre el cuerpo multipart.
 */
const BASE = process.env.BASE ?? 'http://localhost:3000';
const CORREO = process.env.CORREO ?? 'publicidad@candamilabogados.com';
const CLAVE = process.env.CLAVE;

if (!CLAVE) {
  console.error('Falta la variable CLAVE con la contraseña del usuario de prueba.');
  process.exit(2);
}

let cookies = '';
const guardarCookies = (r) => {
  const puestas = r.headers.getSetCookie?.() ?? [];
  for (const c of puestas) {
    const [par] = c.split(';');
    const [nombre] = par.split('=');
    const resto = cookies.split('; ').filter((x) => x && !x.startsWith(nombre + '='));
    cookies = [...resto, par].join('; ');
  }
};

const pedir = async (ruta, opciones = {}) => {
  const r = await fetch(BASE + ruta, {
    redirect: 'manual',
    ...opciones,
    // Se envía `Origin` como lo haría un navegador real: el panel se sirve
    // desde este mismo origen. Sin esto, las pruebas no detectarían un fallo
    // de CORS que sí rompe el acceso desde el navegador.
    headers: { cookie: cookies, origin: BASE, ...(opciones.headers ?? {}) },
  });
  guardarCookies(r);
  return r;
};

const resultados = [];
const comprobar = (nombre, condicion, detalle = '') => {
  resultados.push({ nombre, bien: Boolean(condicion), detalle });
  console.log(`  ${condicion ? 'ok' : '!!'} ${nombre.padEnd(38)} ${detalle}`);
};

const leerCsrf = async (ruta) => {
  const html = await (await pedir(ruta)).text();
  return (html.match(/[a-f0-9]{48}/) ?? [])[0];
};

const subir = async (clave, bytes, csrf, nombre = 'x.webp') => {
  const cuerpo = new FormData();
  cuerpo.append('imagen', new Blob([bytes], { type: 'image/webp' }), nombre);
  const opciones = { method: 'POST', body: cuerpo };
  if (csrf) opciones.headers = { 'x-csrf-token': csrf };
  const r = await pedir(`/panel/imagenes/${clave}`, opciones);
  let datos = {};
  try { datos = await r.json(); } catch { /* respuesta no JSON */ }
  return { estado: r.status, datos };
};

// WebP mínimo válido de 1×1 generado a mano, para no depender de un archivo.
const WEBP_VALIDO = Buffer.from(
  'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=', 'base64');
// Bytes que NO son una imagen, para comprobar que la validación mira la
// cabecera del archivo y no su extensión.
//
// Deliberadamente inocuo: antes aquí había un webshell PHP de verdad y el
// antivirus lo puso en cuarentena, con razón. La prueba solo necesita algo que
// no empiece por una firma de imagen válida; no hace falta un exploit real.
const NO_ES_IMAGEN = Buffer.from('esto no es una imagen, solo texto plano');

console.log('\n══ Control de acceso ══');
comprobar('navegación sin sesión redirige',
  (await pedir('/panel/bloques', { headers: { accept: 'text/html' } })).status === 302);
comprobar('subida sin sesión da 401',
  (await subir('hero-abogado', WEBP_VALIDO, null)).estado === 401);

console.log('\n══ Acceso ══');
let csrf = await leerCsrf('/panel/entrar');
const mal = await pedir('/panel/entrar', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: CORREO, clave: 'equivocada' }),
});
comprobar('clave incorrecta da 401', mal.status === 401);

const bien = await pedir('/panel/entrar', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: CORREO, clave: CLAVE }),
});
comprobar('clave correcta inicia sesión', bien.status === 302,
  bien.headers.get('location') ?? '');

const biblioteca = await pedir('/panel/bloques');
const html = await biblioteca.text();
comprobar('pantalla de bloques accesible', biblioteca.status === 200,
  `${(html.match(/data-bloque=/g) ?? []).length} bloques, `
  + `${(html.match(/data-clave=/g) ?? []).length} huecos`);
csrf = (html.match(/const CSRF = "([a-f0-9]{48})"/) ?? [])[1];

console.log('\n══ Seguridad de la subida ══');
comprobar('archivo que no es imagen se rechaza',
  (await subir('hero-abogado', NO_ES_IMAGEN, csrf)).estado === 400);
comprobar('sin token CSRF se rechaza',
  (await subir('hero-abogado', WEBP_VALIDO, null)).estado === 403);
comprobar('hueco inexistente da 404',
  (await subir('no-existe', WEBP_VALIDO, csrf)).estado === 404);
comprobar('clave con barras se rechaza',
  (await subir('..%2F..%2Fevil', WEBP_VALIDO, csrf)).estado === 400);
comprobar('archivo de 5 MB se rechaza',
  [413, 400].includes((await subir('hero-abogado', Buffer.alloc(5 * 1024 * 1024, 7), csrf)).estado));

console.log('\n══ Subida legítima ══');
// Hueco reservado para pruebas: no lo usa ningún bloque y el panel lo oculta,
// así que la prueba no deja alterada ninguna imagen real del sitio.
const subida = await subir('prueba-tecnica', WEBP_VALIDO, csrf);
comprobar('WebP válido se acepta', subida.estado === 200,
  subida.datos?.data ? `${subida.datos.data.ancho}×${subida.datos.data.alto}, ${subida.datos.data.bytes} B` : '');

console.log('\n══ Cierre de sesión ══');
const salir = await pedir('/panel/salir', { method: 'POST' });
comprobar('cierra sesión', salir.status === 302);
comprobar('tras salir, la pantalla redirige',
  (await pedir('/panel/bloques', { headers: { accept: 'text/html' } })).status === 302);

const fallos = resultados.filter((r) => !r.bien);
console.log(`\n  ${resultados.length - fallos.length}/${resultados.length} comprobaciones correctas`);
process.exitCode = fallos.length ? 1 : 0;
