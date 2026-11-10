/** Sustituye una imagen por el panel y comprueba que el sitio la refleja. */
const BASE = 'http://localhost:3000';
let cookies = '';
const guardar = (r) => {
  for (const c of r.headers.getSetCookie?.() ?? []) {
    const [par] = c.split(';'); const [n] = par.split('=');
    cookies = [...cookies.split('; ').filter((x) => x && !x.startsWith(n + '=')), par].join('; ');
  }
};
const pedir = async (ruta, o = {}) => {
  const r = await fetch(BASE + ruta, { redirect: 'manual', ...o,
    headers: { cookie: cookies, ...(o.headers ?? {}) } });
  guardar(r); return r;
};
const csrfDe = async (ruta) => ((await (await pedir(ruta)).text()).match(/[a-f0-9]{48}/) ?? [])[0];

let csrf = await csrfDe('/panel/entrar');
await pedir('/panel/entrar', { method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ _csrf: csrf, email: process.env.CORREO, clave: process.env.CLAVE }) });
csrf = ((await (await pedir('/panel/imagenes')).text()).match(/const CSRF = "([a-f0-9]{48})"/) ?? [])[1];

// WebP rojo de 2×2, distinguible del marcador SVG.
const WEBP = Buffer.from('UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIAAkA4JaQAA3AA/v89WAAA', 'base64');
const cuerpo = new FormData();
cuerpo.append('imagen', new Blob([WEBP], { type: 'image/webp' }), 'x.webp');
const r = await pedir('/panel/imagenes/caso-3', { method: 'POST', body: cuerpo,
  headers: { 'x-csrf-token': csrf } });
const d = await r.json();
console.log('  subida:', r.status, JSON.stringify(d.data ?? d));
