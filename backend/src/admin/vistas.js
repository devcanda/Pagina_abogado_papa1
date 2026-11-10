/**
 * Vistas del panel: HTML servido por el propio Node.
 *
 * Sin framework y sin paso de compilación a propósito. El panel lo usan dos o
 * tres personas al mes; montar aquí una cadena de build sería más código que
 * mantener que todo el panel junto.
 *
 * Los estilos van en línea y son deliberadamente distintos de los del sitio
 * público: quien edita tiene que notar al instante si está mirando el panel o
 * la página real.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Todo lo que venga de la base pasa por aquí antes de llegar al HTML. */
export const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

const ESTILOS = `
  *,*::before,*::after{box-sizing:border-box}
  body{margin:0;font:15px/1.5 ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif;
       background:#f4f6f9;color:#23262d}
  a{color:#134782}
  .barra{background:#0a2443;color:#fff;padding:12px 20px;display:flex;
         align-items:center;gap:18px;flex-wrap:wrap}
  .barra strong{font-size:15px;letter-spacing:.02em}
  .barra nav{display:flex;gap:16px;margin-left:auto;align-items:center}
  .barra nav a{color:#dce8f5;text-decoration:none;font-size:14px}
  .barra nav a:hover,.barra nav a[aria-current]{color:#fff;text-decoration:underline}
  .envoltorio{max-width:1060px;margin:0 auto;padding:26px 20px 60px}
  h1{font-size:23px;margin:0 0 6px}
  .sub{color:#5b6472;margin:0 0 26px;font-size:14px}
  .tarjeta{background:#fff;border:1px solid #dfe4ec;border-radius:10px;padding:20px}
  label{display:block;font-weight:600;font-size:13px;margin:14px 0 5px}
  input[type=text],input[type=email],input[type=password]{
    width:100%;padding:9px 11px;border:1px solid #c6cedb;border-radius:7px;font:inherit;background:#fff}
  input:focus{outline:2px solid #195ba9;outline-offset:1px;border-color:#195ba9}
  button{font:inherit;font-weight:600;padding:9px 18px;border-radius:7px;border:0;
         background:#a0373a;color:#fff;cursor:pointer}
  button:hover{background:#8a2f32}
  button[disabled]{opacity:.55;cursor:not-allowed}
  .secundario{background:#fff;color:#134782;border:1px solid #c6cedb}
  .secundario:hover{background:#eef2f8}
  .aviso{padding:11px 14px;border-radius:8px;font-size:14px;margin-bottom:18px;
         display:flex;gap:9px;align-items:flex-start}
  .aviso.error{background:#fdeeee;border:1px solid #e7b9b9;color:#7e2326}
  .aviso.bien{background:#eaf5ed;border:1px solid #b2d8bf;color:#1d5c33}
  .aviso.info{background:#eef3fa;border:1px solid #c0d3ea;color:#1c3f68}
  .rejilla{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(248px,1fr))}
  .medio{background:#fff;border:1px solid #dfe4ec;border-radius:10px;overflow:hidden;
         display:flex;flex-direction:column}
  .medio .lienzo{background:#eef1f6;aspect-ratio:4/3;display:flex;align-items:center;
                 justify-content:center;overflow:hidden}
  .medio .lienzo img{max-width:100%;max-height:100%;object-fit:contain}
  .medio .cuerpo{padding:12px 13px;display:flex;flex-direction:column;gap:5px;flex:1}
  .medio h3{margin:0;font-size:14px}
  .medio .meta{font-size:12px;color:#6b7482}
  .medio .acciones{margin-top:auto;padding-top:10px}
  .medio input[type=file]{display:none}
  .falso-boton{display:inline-block;font-size:13px;font-weight:600;padding:7px 13px;
               border-radius:7px;border:1px solid #c6cedb;background:#fff;color:#134782;cursor:pointer}
  .falso-boton:hover{background:#eef2f8}
  .estado{font-size:12px;margin-top:7px;min-height:1.2em}
  .estado.mal{color:#7e2326}
  .estado.ok{color:#1d5c33}
  .pie{margin-top:34px;font-size:12px;color:#7b8494}
  .entrar{max-width:380px;margin:9vh auto;padding:0 20px}
`;

export function pagina({ titulo, usuario, activo, contenido }) {
  const nav = usuario
    ? `<nav>
         <a href="/panel/bloques"${activo === 'bloques' ? ' aria-current="page"' : ''}>Bloques</a>
         <span style="color:#7d8ba1">${esc(usuario.nombre)}</span>
         <form method="post" action="/panel/salir" style="margin:0">
           <button class="secundario" style="padding:5px 12px;font-size:13px">Salir</button>
         </form>
       </nav>`
    : '';

  return `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(titulo)} · Panel Candamil</title>
<style>${ESTILOS}</style>
</head>
<body>
<header class="barra"><strong>Panel de contenido</strong>${nav}</header>
<main class="envoltorio">${contenido}</main>
</body>
</html>`;
}

const ICONOS_AVISO = { error: '⚠', bien: '✓', info: 'i' };

export const aviso = (tipo, texto) =>
  `<p class="aviso ${tipo}"><span aria-hidden="true">${ICONOS_AVISO[tipo] ?? 'i'}</span>
   <span>${esc(texto)}</span></p>`;

export function vistaEntrar({ error, email = '', csrf }) {
  return pagina({
    titulo: 'Entrar',
    contenido: `
    <div class="entrar">
      <h1>Entrar al panel</h1>
      <p class="sub">Acceso para el equipo de contenido de Candamil Asociados.</p>
      ${error ? aviso('error', error) : ''}
      <form method="post" action="/panel/entrar" class="tarjeta">
        <input type="hidden" name="_csrf" value="${esc(csrf)}">
        <label for="email">Correo</label>
        <input id="email" name="email" type="email" autocomplete="username"
               required value="${esc(email)}">
        <label for="clave">Contraseña</label>
        <input id="clave" name="clave" type="password"
               autocomplete="current-password" required>
        <div style="margin-top:20px"><button>Entrar</button></div>
      </form>
    </div>`,
  });
}
