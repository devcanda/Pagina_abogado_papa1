import { pagina, aviso, esc } from './vistas.js';
import {
  pintarCampos, pintarVariantes, clavesPintadas, FONDO_POR_TONO,
} from './formulario.js';
import { BLOQUES } from '../../../frontend/src/bloques/registro.js';

/**
 * Pantalla principal del panel: los BLOQUES de la portada.
 *
 * Antes era una lista plana de huecos de imagen. Quien entraba veía doce
 * casillas sueltas y tenía que adivinar cuál era cuál por su clave. Ahora cada
 * imagen sale bajo el bloque donde aparece, y cada bloque se puede encender y
 * apagar.
 *
 * El redimensionado y la conversión a WebP siguen ocurriendo AQUÍ, en el
 * navegador del editor, antes de subir nada:
 *
 *   · No hace falta `sharp` en el servidor, que es un módulo nativo y la
 *     primera fuente de problemas en hosting compartido.
 *   · El editor no puede degradar el rendimiento del sitio aunque arrastre un
 *     JPEG de 8 MB: al servidor llega ya un WebP del tamaño exacto.
 *
 * Es el único JavaScript del proyecto, y vive solo en el panel: el sitio
 * público sigue enviando 0 KB.
 *
 * Ver `specs/004-bloques-en-el-panel/`.
 */

const ESTILOS = `
<style>
  .bloque{background:#fff;border:1px solid #dfe4ec;border-radius:12px;
          margin-bottom:18px;overflow:hidden}
  .bloque.apagado{background:#f6f7f9;border-style:dashed}
  /* El bloque apagado se atenúa pero NO se esconde: si desapareciera del
     panel, nadie podría volver a encenderlo. */
  .bloque.apagado .cabeza h2,
  .bloque.apagado .rejilla{opacity:.55}
  .cabeza{display:flex;align-items:center;gap:14px;padding:14px 16px;
          border-bottom:1px solid #eef1f6}
  .bloque.apagado .cabeza{border-bottom-color:#e4e7ee}
  .cabeza h2{margin:0;font-size:16px;flex:1}
  .cabeza .tipo{font-size:12px;color:#7b8494;font-weight:400;margin-left:8px}
  .sin-imagenes{margin:0;padding:14px 16px;font-size:13px;color:#7b8494}
  .cuerpo-bloque{padding:16px}

  /* Interruptor. Es una casilla de verdad por debajo: así funciona con el
     teclado y los lectores de pantalla sin tener que reinventarlo. */
  .interruptor{display:inline-flex;align-items:center;gap:9px;cursor:pointer;
               font-size:13px;font-weight:600;color:#39414f;user-select:none}
  .interruptor input{position:absolute;opacity:0;width:0;height:0}
  .interruptor .via{width:42px;height:24px;border-radius:999px;background:#c3cad6;
                    position:relative;transition:background-color .18s ease;flex:none}
  .interruptor .via::after{content:'';position:absolute;top:3px;left:3px;width:18px;
                           height:18px;border-radius:50%;background:#fff;
                           transition:transform .18s ease;
                           box-shadow:0 1px 3px rgba(0,0,0,.25)}
  .interruptor input:checked + .via{background:#195ba9}
  .interruptor input:checked + .via::after{transform:translateX(18px)}
  .interruptor input:focus-visible + .via{outline:2px solid #195ba9;outline-offset:2px}
  .interruptor input:disabled + .via{opacity:.5;cursor:not-allowed}
  .interruptor .rotulo-estado{min-width:56px}

  .publicar{display:flex;align-items:center;gap:14px;background:#fff;
            border:1px solid #dfe4ec;border-radius:10px;padding:13px 16px;margin:0 0 22px}
  .publicar .texto{flex:1;font-size:13px;color:#5b6472;margin:0}
  .publicar .texto strong{color:#39414f}
  .publicar .texto.mal{color:#7e2326}
  .publicar .texto.mal strong{color:#7e2326}
  .publicar pre{margin:8px 0 0;padding:9px 11px;background:#fdeeee;
                border:1px solid #e7b9b9;border-radius:7px;font-size:11px;
                color:#5c1a1c;white-space:pre-wrap;max-height:160px;overflow:auto}
  .publicar button[disabled]{opacity:.55;cursor:not-allowed}

  /* ── Formulario del bloque ── */
  .editor{border-top:1px solid #eef1f6}
  .editor > summary{padding:11px 16px;cursor:pointer;font-size:13px;font-weight:600;
                    color:#195ba9;list-style:none;user-select:none}
  .editor > summary::-webkit-details-marker{display:none}
  .editor > summary::before{content:'B8 ';display:inline-block;transition:transform .15s}
  .editor[open] > summary::before{transform:rotate(90deg)}
  .editor > summary:hover{background:#f6f8fc}
  .editor .cuerpo-editor{padding:4px 16px 16px}
  .campo{margin-bottom:13px}
  .campo > label{display:block;font-size:12px;font-weight:600;color:#39414f;margin-bottom:4px}
  .campo input[type=text],.campo textarea,.campo select{width:100%;box-sizing:border-box;
       padding:7px 9px;border:1px solid #cfd6e2;border-radius:7px;font:inherit;font-size:13px}
  .campo textarea{resize:vertical;line-height:1.45}
  .campo input[type=text]:focus,.campo textarea:focus,.campo select:focus{
       outline:2px solid #195ba9;outline-offset:1px;border-color:#195ba9}
  .pista{display:block;font-size:11px;color:#7b8494;margin-top:3px}
  .contador{float:right;font-size:11px;color:#9aa3b1;margin-top:3px}
  .contador.cerca{color:#8a6d1f}
  .obligatorio{color:#a0373a}

  /* Color: el selector nativo, el hexadecimal y el contraste medido. */
  .fila-color{display:flex;align-items:center;gap:9px}
  .fila-color input[type=color]{width:42px;height:34px;padding:2px;border:1px solid #cfd6e2;
       border-radius:7px;background:#fff;cursor:pointer;flex:none}
  /* El selector lleva el tipo Y la clase a propósito. Un selector de atributo
     cuenta como una clase, así que '.campo input[type=text]' vale (0,2,1) y le
     ganaba a '.fila-color .hex' (0,2,0): el hexadecimal salía al 100% del
     ancho y empujaba el contraste fuera de la ficha. Se vio al meter los
     colores dentro de las láminas, que son más estrechas. */
  .fila-color input[type=text].hex{width:96px;flex:none;padding:7px 9px;
       border:1px solid #cfd6e2;border-radius:7px;font:inherit;font-size:13px;
       font-variant-numeric:tabular-nums}
  .fila-color .contraste{flex:1;min-width:0}
  .contraste{font-size:12px;font-variant-numeric:tabular-nums}
  .contraste.bien{color:#1d5c33}
  .contraste.flojo{color:#8a6d1f}
  .contraste.mal{color:#a0373a;font-weight:600}

  /* Imagen dentro del formulario: miniatura a la izquierda, controles al
     lado. Pequeña a propósito; está para identificar cuál es, no para
     valorarla, y el sitio real es la propia página. */
  .campo-imagen{border:1px solid #e2e7ef;border-radius:9px;padding:10px 12px;background:#fbfcfe}
  .fila-imagen{display:flex;gap:12px;align-items:flex-start}
  .fila-imagen .lienzo{width:92px;flex:none;aspect-ratio:3/4;background:#eef1f6;
       border-radius:7px;overflow:hidden;display:flex;align-items:center;justify-content:center}
  .fila-imagen .lienzo img{width:100%;height:100%;object-fit:cover}
  .fila-imagen .lienzo .sin-foto{font-size:11px;color:#8b94a3;text-align:center;padding:0 6px}
  .fila-imagen .lado{flex:1;min-width:0}
  .fila-imagen .lado select{width:100%;box-sizing:border-box;padding:7px 9px;
       border:1px solid #cfd6e2;border-radius:7px;font:inherit;font-size:13px}
  .fila-imagen .lado .meta{margin:6px 0 2px;font-size:11px;color:#7b8494}
  .fila-imagen .lado .meta + .meta{margin:0 0 8px}
  /* El control nativo se tapa con la etiqueta, igual que en la rejilla: sin
     esto sale el «Seleccionar archivo / Ningún archivo seleccionado» del
     navegador al lado del botón, y son dos botones para una sola acción. */
  .fila-imagen input[type=file]{display:none}
  .fila-imagen .falso-boton:has(input:disabled){opacity:.5;cursor:not-allowed}

  .campo-lista .elemento-lista,.campo-grupo .grupo-item{margin-bottom:8px}
  .campo-lista .elemento-lista{display:flex;gap:7px}
  .campo-lista .elemento-lista input{flex:1}
  .grupo-item{border:1px solid #e2e7ef;border-radius:9px;padding:10px 12px 4px;background:#fbfcfe}
  .grupo-item legend{font-size:12px;font-weight:600;color:#5b6472;padding:0 5px}
  .quitar{background:none;border:0;color:#a0373a;font-size:17px;line-height:1;cursor:pointer;
          padding:0 5px}
  .anadir{font-size:12px;padding:5px 11px}
  .variantes{border-top:1px dashed #e2e7ef;margin-top:14px;padding-top:12px}
  .variantes h4{margin:0 0 10px;font-size:12px;text-transform:uppercase;
                letter-spacing:.05em;color:#7b8494}
  .pie-editor{display:flex;align-items:center;gap:12px;margin-top:14px}
  .pie-editor .estado-guardado{font-size:12px;color:#6b7482}
  .pie-editor .estado-guardado.ok{color:#1d5c33}
  .pie-editor .estado-guardado.mal{color:#7e2326}
</style>`;

function tarjetaMedio(m) {
  const medidas = m.ancho ? `${m.ancho}×${m.alto}` : 'sin medir';
  const peso = m.bytes ? `${Math.round(m.bytes / 1024)} KB` : '—';
  return `
  <article class="medio" data-medio data-clave="${esc(m.clave)}">
    <div class="lienzo">
      <img src="${esc(m.archivo)}?v=${Date.parse(m.actualizado_en) || 0}"
           alt="" loading="lazy">
    </div>
    <div class="cuerpo">
      <h3>${esc(m.descripcion || m.clave)}</h3>
      <p class="meta">Debe medir ${m.ancho_sugerido}×${m.alto_sugerido} px</p>
      <p class="meta" data-medidas>Ahora: ${medidas} · ${peso}</p>
      <div class="acciones">
        <label class="falso-boton">
          Sustituir imagen
          <input type="file" accept="image/png,image/jpeg,image/webp"
                 data-ancho="${m.ancho_sugerido}" data-alto="${m.alto_sugerido}">
        </label>
        <p class="estado" role="status"></p>
      </div>
    </div>
  </article>`;
}

/**
 * Ficha de un bloque.
 *
 * Las imágenes que el formulario pinta junto a su texto NO se repiten en la
 * rejilla de arriba: el mismo control dos veces en la misma pantalla invita a
 * tocar el que está más lejos de lo que se quería cambiar. Lo que queda fuera
 * del formulario sí sale en la rejilla, porque callarlo lo haría inalcanzable
 * desde el panel.
 */
function fichaBloque(b, puedeApagar, medios) {
  const nombre = b.rotulo || b.tipo;
  const def = BLOQUES[b.tipo];
  const enFormulario = def ? clavesPintadas(def.campos, b.datos) : new Set();
  const imagenes = (b.imagenes ?? []).filter((m) => m && !enFormulario.has(m.clave));
  return `
  <section class="bloque${b.visible ? '' : ' apagado'}" data-bloque="${b.id}">
    <div class="cabeza">
      <h2>${esc(nombre)}<span class="tipo">${esc(b.tipo)}</span></h2>
      <label class="interruptor">
        <input type="checkbox" ${b.visible ? 'checked' : ''}
               ${puedeApagar ? '' : 'disabled'}
               aria-label="Mostrar «${esc(nombre)}» en el sitio">
        <span class="via" aria-hidden="true"></span>
        <span class="rotulo-estado">${b.visible ? 'Visible' : 'Oculto'}</span>
      </label>
    </div>
    ${imagenes.length
      ? `<div class="cuerpo-bloque">
           <p class="sin-imagenes" style="padding:0 0 10px">Imágenes de este bloque
              que no están en ningún campo del formulario:</p>
           <div class="rejilla">${imagenes.map(tarjetaMedio).join('')}</div>
         </div>`
      : ''}
    ${formularioBloque(b, medios)}
  </section>`;
}

/**
 * Franja de publicación.
 *
 * El sitio es estático: el contenido se consulta al compilar. Sin este botón,
 * editar cambiaba la base y nada más, y quien editaba concluía que estaba roto.
 * Ver `specs/005-publicar-y-recompilar/`.
 */
function franjaPublicar(p, puedePublicar) {
  const enMarcha = p?.estado === 'en-marcha';
  return `
  <div class="publicar" data-publicar${enMarcha ? ' data-en-marcha="1"' : ''}>
    <p class="texto" role="status">${textoPublicacion(p)}</p>
    ${puedePublicar
      ? `<button type="button" data-publicar-boton ${enMarcha ? 'disabled' : ''}>
           ${enMarcha ? 'Publicando…' : 'Publicar cambios'}
         </button>`
      : ''}
  </div>`;
}

function textoPublicacion(p) {
  if (!p) {
    return '<strong>El sitio nunca se ha publicado desde aquí.</strong> '
      + 'Pulse «Publicar cambios» para que lo editado se vea en la página.';
  }
  if (p.estado === 'en-marcha') {
    return '<strong>Publicando…</strong> Tarda unos segundos. '
      + 'Puede seguir trabajando; no hace falta esperar en esta pantalla.';
  }
  if (p.estado === 'fallida') {
    return '<strong>La última publicación falló.</strong> El sitio sigue '
      + 'mostrando la versión anterior, así que no se ha roto nada.';
  }
  if (p.estado === 'interrumpida') {
    return '<strong>La última publicación quedó a medias</strong> porque el '
      + 'servidor se reinició. Vuelva a pulsar «Publicar cambios».';
  }
  return '<strong>Todo lo editado está publicado.</strong> '
    + 'Si cambia algo más, vuelva a pulsar «Publicar cambios».';
}

/**
 * Formulario de textos y colores del bloque.
 *
 * Va dentro de un `<details>` y cerrado por defecto: con ocho bloques abiertos
 * a la vez la pantalla sería ilegible, y casi siempre se viene a tocar uno.
 * `<details>` es nativo, así que abre y cierra sin JavaScript.
 */
function formularioBloque(b, medios) {
  const def = BLOQUES[b.tipo];
  if (!def) {
    return `<p class="sin-imagenes">Este bloque es de un tipo que ya no existe
            (<code>${esc(b.tipo)}</code>); no se puede editar desde aquí.</p>`;
  }
  const tono = def.tono ?? 'claro';
  return `
    <details class="editor" data-editor="${b.id}" data-fondo="${esc(FONDO_POR_TONO[tono] ?? '#ffffff')}">
      <summary>Editar textos, imágenes y colores</summary>
      <div class="cuerpo-editor">
        ${pintarCampos(def.campos, b.datos, '', tono, medios)}
        ${pintarVariantes(def.variantes, b.variantes)}
        <div class="pie-editor">
          <button type="button" data-guardar>Guardar</button>
          <span class="estado-guardado" role="status"></span>
        </div>
      </div>
    </details>`;
}

export function vistaBloques({
  usuario, bloques, sueltas, medios = [], publicacion, csrf, nonce, mensaje,
}) {
  // Catálogo indexado: lo necesita cada campo de imagen para saber qué archivo
  // tiene detrás y qué otros huecos de su misma medida puede ofrecer.
  const porClave = new Map(medios.map((m) => [m.clave, m]));

  // Apagar un bloque hace desaparecer una sección entera, y quien pasa por la
  // página no tiene por qué notar que falta. Sustituir una imagen se ve de un
  // vistazo; esto no.
  const puedeApagar = usuario?.rol === 'admin';

  const grupoSueltas = sueltas.length
    ? `<section class="bloque">
         <div class="cabeza">
           <h2>Sin bloque asignado<span class="tipo">no salen en la portada</span></h2>
         </div>
         <div class="cuerpo-bloque"><div class="rejilla">${sueltas.map(tarjetaMedio).join('')}</div></div>
       </section>`
    : '';

  return pagina({
    titulo: 'Bloques',
    usuario,
    activo: 'bloques',
    contenido: `${ESTILOS}
    <h1>Bloques de la portada</h1>
    <p class="sub">Cada bloque es una franja de la página, en el mismo orden en
       que se ven. Apague uno y deja de salir, sin perder lo que tiene dentro.</p>

    ${franjaPublicar(publicacion, puedeApagar)}

    ${puedeApagar ? '' : aviso('info', 'Su usuario puede cambiar imágenes, pero no apagar bloques. Eso lo hace un administrador.')}
    ${mensaje ? aviso('bien', mensaje) : ''}

    ${bloques.map((b) => fichaBloque(b, puedeApagar, porClave)).join('')}
    ${grupoSueltas}

    <p class="pie">Las imágenes se ven en el sitio al recargar. No hace falta avisar a nadie.</p>

<script nonce="${nonce}">
const CSRF = ${JSON.stringify(csrf)};
const MAX_BYTES = 2 * 1024 * 1024;

/* Catálogo de la biblioteca. Lo usa el desplegable de imagen para cambiar la
   miniatura sin recargar la página.

   El '<' se escapa porque la etiqueta de cierre de este mismo bloque, si
   apareciera dentro de una cadena, lo cerraría antes de tiempo y el resto del
   guion se interpretaría como HTML. */
const MEDIOS = ${JSON.stringify(
    Object.fromEntries(medios.map((m) => [m.clave, {
      archivo: m.archivo,
      ancho: m.ancho,
      alto: m.alto,
      bytes: m.bytes,
      v: Date.parse(m.actualizado_en) || 0,
    }])),
  ).replace(/</g, '\u003c')};

/**
 * Reduce al tamaño pedido sin deformar: recorta el sobrante del lado largo,
 * que es lo que hace 'object-fit: cover' en el sitio.
 */
function redimensionar(archivo, anchoDestino, altoDestino) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const lienzo = document.createElement('canvas');
      lienzo.width = anchoDestino;
      lienzo.height = altoDestino;
      const ctx = lienzo.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      const escala = Math.max(anchoDestino / img.width, altoDestino / img.height);
      const w = img.width * escala;
      const h = img.height * escala;
      ctx.drawImage(img, (anchoDestino - w) / 2, (altoDestino - h) / 2, w, h);

      // Se baja la calidad por pasos hasta entrar en el límite, en vez de
      // rechazar: el editor no tiene por qué pelearse con el peso.
      const intentar = (calidad) => {
        lienzo.toBlob((blob) => {
          if (!blob) return rechazar(new Error('No se pudo convertir la imagen'));
          if (blob.size <= MAX_BYTES || calidad <= 0.5) return resolver(blob);
          intentar(calidad - 0.1);
        }, 'image/webp', calidad);
      };
      intentar(0.9);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rechazar(new Error('El archivo no es una imagen')); };
    img.src = url;
  });
}

/**
 * Vuelca en una vista lo que MEDIOS dice de su clave.
 *
 * Se usa tras subir una foto y tras cambiar el hueco en el desplegable: los
 * dos casos dejan la miniatura desfasada, y una miniatura que no corresponde
 * al texto de al lado es exactamente lo que este rediseño venía a evitar.
 */
function pintarMedio(vista) {
  const clave = vista.dataset.clave;
  const m = MEDIOS[clave];
  const lienzo = vista.querySelector('.lienzo');
  const medidas = vista.querySelector('[data-medidas]');
  const archivo = vista.querySelector('input[type=file]');

  if (m) {
    lienzo.innerHTML = '';
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.src = m.archivo + '?v=' + m.v;
    lienzo.appendChild(img);
  } else {
    lienzo.innerHTML = '<span class="sin-foto">Sin foto</span>';
  }

  // Sin clave no hay hueco donde subir: el servidor rechazaría el archivo con
  // un 404 después de haber hecho esperar. Mejor que el botón no invite.
  if (archivo) archivo.disabled = !clave;

  if (medidas) {
    medidas.textContent = m
      ? 'Ahora: ' + (m.ancho ? m.ancho + '×' + m.alto : 'sin medir')
        + ' · ' + (m.bytes ? Math.round(m.bytes / 1024) + ' KB' : '—')
      : '';
  }
}

/**
 * Apuntar el campo a otro hueco de la biblioteca.
 *
 * La clave viaja en el 'name' del desplegable, así que el guardado ya la
 * recoge solo. Lo único que hace falta aquí es que la pantalla deje de mentir:
 * la miniatura y el botón de sustituir tienen que seguir al hueco elegido.
 */
function engancharEleccion(vista) {
  const select = vista.querySelector('[data-elegir-imagen]');
  if (!select) return;
  select.addEventListener('change', () => {
    vista.dataset.clave = select.value;
    pintarMedio(vista);
  });
}

document.querySelectorAll('.campo-imagen').forEach(engancharEleccion);

// '[data-medio]' cubre las dos: la tarjeta de la rejilla y el campo de imagen
// del formulario. Comparten contrato (clave, lienzo, medidas, estado) para que
// la subida sea la misma en ambos sitios y no haya dos caminos que mantener.
function engancharSubida(entrada) {
  entrada.addEventListener('change', async () => {
    const archivo = entrada.files[0];
    if (!archivo) return;
    const tarjeta = entrada.closest('[data-medio]');
    const estado = tarjeta.querySelector('.estado');
    const clave = tarjeta.dataset.clave;

    estado.className = 'estado';
    estado.textContent = 'Ajustando la imagen…';
    try {
      const blob = await redimensionar(
        archivo, Number(entrada.dataset.ancho), Number(entrada.dataset.alto));

      estado.textContent = 'Subiendo (' + Math.round(blob.size / 1024) + ' KB)…';
      const cuerpo = new FormData();
      cuerpo.append('imagen', blob, clave + '.webp');

      const r = await fetch('/panel/imagenes/' + encodeURIComponent(clave), {
        method: 'POST', body: cuerpo, headers: { 'x-csrf-token': CSRF },
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(datos.error || ('Error ' + r.status));

      // La misma imagen puede salir en dos bloques: se actualizan TODAS sus
      // tarjetas, no solo aquella en la que se pulsó.
      MEDIOS[clave] = {
        archivo: datos.data.archivo, ancho: datos.data.ancho,
        alto: datos.data.alto, bytes: datos.data.bytes, v: Date.now(),
      };
      document.querySelectorAll('[data-medio][data-clave="' + CSS.escape(clave) + '"]')
        .forEach(pintarMedio);
      estado.className = 'estado ok';
      estado.textContent = 'Listo. Ya se ve en el sitio.';
    } catch (e) {
      estado.className = 'estado mal';
      estado.textContent = e.message;
    } finally {
      entrada.value = '';
    }
  });
}

document.querySelectorAll('[data-medio] input[type=file]').forEach(engancharSubida);

/* ─── Editor de textos y colores ────────────────────────────────────────── */

/**
 * Reconstruye el objeto anidado a partir de los nombres de los campos.
 *
 * Los controles se llaman por su RUTA dentro del dato ('laminas.1.titulo'), así
 * que aquí no hace falta saber nada de la forma de cada bloque: se parte el
 * nombre por puntos y se va creando lo que falte. Un tramo numérico crea un
 * array; cualquier otro, un objeto.
 */
function recomponer(raiz) {
  const salida = {};
  for (const control of raiz.querySelectorAll('[name]')) {
    // Los hexadecimales son espejo del selector de color: no se envían.
    if (control.hasAttribute('data-hex')) continue;
    const tramos = control.name.split('.');
    let nodo = salida;
    for (let i = 0; i < tramos.length - 1; i++) {
      const t = tramos[i];
      const siguienteEsIndice = /^[0-9]+$/.test(tramos[i + 1]);
      if (nodo[t] === undefined) nodo[t] = siguienteEsIndice ? [] : {};
      nodo = nodo[t];
    }
    nodo[tramos[tramos.length - 1]] = control.value;
  }
  return salida;
}

/* ── Contraste ──
 * Se calcula en el navegador y NO bloquea nada: decisión del cliente. Enseñar
 * el número es lo único que queda entre un color y un texto que nadie puede
 * leer, así que se enseña siempre, también cuando está bien. */
function luminancia(hex) {
  const n = hex.replace('#', '');
  const c = [0, 2, 4].map(function (i) { return parseInt(n.slice(i, i + 2), 16) / 255; })
    .map(function (x) { return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

function contraste(a, b) {
  var bueno = /^#[0-9a-fA-F]{6}$/;
  if (!bueno.test(a) || !bueno.test(b)) return null;
  var la = luminancia(a); var lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Contra qué fondo se mide este campo.
 *
 * Si el bloque declara un campo de fondo, se lee su valor EN VIVO: desde que
 * el fondo de la cabecera se elige desde el panel, medir contra el navy
 * congelado del registro daría un número tranquilizador y falso en cuanto
 * alguien pusiera un fondo claro. El atributo data-fondo queda de respaldo
 * para los bloques que no tienen ese campo.
 */
function fondoDe(campo) {
  var ref = campo.dataset.fondoRef;
  if (ref) {
    var editor = campo.closest('[data-editor]');
    var control = editor && editor.querySelector('[name="' + CSS.escape(ref) + '"]');
    if (control && /^#[0-9a-fA-F]{6}$/.test(control.value)) return control.value;
  }
  return campo.dataset.fondo || '#ffffff';
}

function pintarContraste(campo) {
  var color = campo.querySelector('[data-color]');
  var marca = campo.querySelector('[data-contraste]');
  if (!marca) return;
  var r = contraste(color.value, fondoDe(campo));
  if (r === null) { marca.textContent = ''; return; }
  // 4.5:1 es el mínimo AA para texto normal; 3:1 vale para titulares grandes.
  marca.className = 'contraste ' + (r >= 4.5 ? 'bien' : r >= 3 ? 'flojo' : 'mal');
  marca.textContent = r.toFixed(2) + ':1 '
    + (r >= 4.5 ? 'legible' : r >= 3 ? 'solo titulares grandes' : 'ILEGIBLE');
}

function engancharColor(campo) {
  var color = campo.querySelector('[data-color]');
  var hex = campo.querySelector('[data-hex]');
  if (!color || !hex) return;
  pintarContraste(campo);
  color.addEventListener('input', function () {
    hex.value = color.value;
    pintarContraste(campo);
  });
  hex.addEventListener('input', function () {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
      color.value = hex.value;
      pintarContraste(campo);
    }
  });
}

document.querySelectorAll('.campo-color').forEach(engancharColor);

/* Cambiar el fondo vuelve a medir TODO el bloque: si no, los contrastes
   seguirían enseñando el número del fondo anterior, que es peor que no
   enseñar ninguno. */
document.querySelectorAll('[data-color-fondo]').forEach(function (control) {
  control.addEventListener('input', function () {
    var editor = control.closest('[data-editor]');
    if (!editor) return;
    editor.querySelectorAll('.campo-color').forEach(pintarContraste);
  });
});

/* ── Contador de caracteres ── */
function engancharContador(marca) {
  var campo = marca.closest('.campo');
  var control = campo.querySelector('input[type=text], textarea');
  if (!control) return;
  var tope = Number(marca.dataset.contador);
  var pintar = function () {
    var n = control.value.length;
    marca.textContent = n + '/' + tope;
    marca.className = 'contador' + (n > tope * 0.9 ? ' cerca' : '');
  };
  control.addEventListener('input', pintar);
  pintar();
}

document.querySelectorAll('[data-contador]').forEach(engancharContador);

/* ── Añadir y quitar elementos de listas y grupos ── */

// Se renumera el PRIMER tramo numérico de la ruta, que es el del elemento.
function renumerar(nodo, indice) {
  nodo.querySelectorAll('[name]').forEach(function (c) {
    c.name = c.name.replace(/\.([0-9]+)(?=\.|$)/, '.' + indice);
    if (c.id) c.id = c.name;
  });
  var leyenda = nodo.querySelector('legend');
  if (leyenda && leyenda.childNodes[0]) {
    leyenda.childNodes[0].textContent =
      leyenda.childNodes[0].textContent.replace(/[0-9]+\s*$/, String(indice + 1)) + ' ';
  }
}

document.querySelectorAll('[data-anadir]').forEach(function (boton) {
  boton.addEventListener('click', function () {
    var contenedor = boton.closest('[data-lista], [data-grupo]');
    var elementos = contenedor.querySelector('[data-elementos]');
    var max = Number(contenedor.dataset.max || 10);
    if (elementos.children.length >= max) { boton.disabled = true; return; }

    // Se clona el último y se vacía, en vez de pedirle otra plantilla al
    // servidor: así un elemento nuevo tiene exactamente los mismos campos que
    // los demás, sin duplicar el pintado aquí.
    var ultimo = elementos.lastElementChild;
    if (!ultimo) return;
    var copia = ultimo.cloneNode(true);
    var indice = elementos.children.length;
    copia.querySelectorAll('[name]').forEach(function (c) {
      if (c.type === 'color') c.value = c.defaultValue || '#000000';
      else if (c.tagName === 'SELECT') c.selectedIndex = 0;
      else c.value = '';
    });
    renumerar(copia, indice);
    copia.querySelectorAll('[data-hex]').forEach(function (h) {
      var col = h.parentElement.querySelector('[data-color]');
      h.value = col ? col.value : '';
    });
    // El clon trae la miniatura del elemento del que salió, pero su
    // desplegable ya se ha vaciado: sin esto la foto de al lado sería la de
    // otra lámina y quien edita creería que ya tiene imagen.
    copia.querySelectorAll('.campo-imagen').forEach(function (vista) {
      vista.dataset.clave = '';
      pintarMedio(vista);
    });

    elementos.appendChild(copia);
    copia.querySelectorAll('.campo-color').forEach(engancharColor);
    copia.querySelectorAll('[data-contador]').forEach(engancharContador);
    copia.querySelectorAll('.campo-imagen').forEach(engancharEleccion);
    copia.querySelectorAll('input[type=file]').forEach(engancharSubida);
    if (elementos.children.length >= max) boton.disabled = true;
  });
});

// Delegado, no por elemento: los que se añaden luego también tienen que servir.
document.addEventListener('click', function (e) {
  var boton = e.target.closest ? e.target.closest('[data-quitar]') : null;
  if (!boton) return;
  var elemento = boton.closest('.elemento-lista, .grupo-item');
  var contenedor = boton.closest('[data-lista], [data-grupo]');
  if (!elemento || !contenedor) return;
  elemento.remove();
  // Renumerar: si se quita el de en medio, las rutas quedarían con un hueco y
  // el servidor recibiría un array con posiciones vacías.
  var elementos = contenedor.querySelector('[data-elementos]');
  Array.prototype.forEach.call(elementos.children, renumerar);
  var anadir = contenedor.querySelector('[data-anadir]');
  if (anadir) anadir.disabled = false;
});

/* ── Guardar ── */
document.querySelectorAll('[data-guardar]').forEach(function (boton) {
  boton.addEventListener('click', async function () {
    var editor = boton.closest('[data-editor]');
    var estado = editor.querySelector('.estado-guardado');
    var todo = recomponer(editor);
    // 'variantes' viaja aparte: el registro las valida con otras reglas.
    var variantes = todo.variantes || {};
    delete todo.variantes;

    boton.disabled = true;
    estado.className = 'estado-guardado';
    estado.textContent = 'Guardando...';
    try {
      var r = await fetch('/panel/bloques/' + editor.dataset.editor, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-csrf-token': CSRF },
        body: JSON.stringify({ datos: todo, variantes: variantes }),
      });
      var datos = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(datos.error || ('Error ' + r.status));
      estado.className = 'estado-guardado ok';
      estado.textContent = 'Guardado. Pulse «Publicar cambios» para que se vea.';
    } catch (err) {
      estado.className = 'estado-guardado mal';
      estado.textContent = err.message;
    } finally {
      boton.disabled = false;
    }
  });
});

/* ─── Publicar ──────────────────────────────────────────────────────────── */
const franja = document.querySelector('[data-publicar]');
const boton = document.querySelector('[data-publicar-boton]');
const aviso = franja && franja.querySelector('.texto');
let vigilando = false;

function pintar(p) {
  if (!aviso) return;
  const enMarcha = p && p.estado === 'en-marcha';
  const fallo = p && (p.estado === 'fallida' || p.estado === 'interrumpida');

  let texto;
  if (!p) texto = '<strong>El sitio nunca se ha publicado desde aquí.</strong>';
  else if (enMarcha) texto = '<strong>Publicando…</strong> Tarda unos segundos.';
  else if (p.estado === 'fallida') texto = '<strong>La última publicación falló.</strong> '
    + 'El sitio sigue mostrando la versión anterior, así que no se ha roto nada.';
  else if (p.estado === 'interrumpida') texto = '<strong>La última publicación quedó a medias.</strong> '
    + 'Vuelva a pulsar «Publicar cambios».';
  else texto = '<strong>Publicado</strong> ' + hace(p.acabada_en) + '.';

  // El log solo se enseña cuando falla: en el camino feliz no aporta nada y
  // llena la pantalla de ruido.
  aviso.className = 'texto' + (fallo ? ' mal' : '');
  aviso.innerHTML = texto
    + (fallo && p.salida ? '<pre>' + escapar(p.salida) + '</pre>' : '');

  if (boton) {
    boton.disabled = Boolean(enMarcha);
    boton.textContent = enMarcha ? 'Publicando…' : 'Publicar cambios';
  }
}

function escapar(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function hace(cuando) {
  if (!cuando) return 'hace un momento';
  const seg = Math.round((Date.now() - Date.parse(cuando)) / 1000);
  if (seg < 60) return 'hace ' + seg + ' s';
  if (seg < 3600) return 'hace ' + Math.round(seg / 60) + ' min';
  if (seg < 86400) return 'hace ' + Math.round(seg / 3600) + ' h';
  return 'el ' + new Date(cuando).toLocaleDateString('es-CO');
}

// Se pregunta por el estado en vez de abrir un WebSocket: esto pasa unas veces
// al día y un sondeo cada dos segundos durante unos segundos no es un problema.
async function vigilar() {
  if (vigilando) return;
  vigilando = true;
  try {
    for (let i = 0; i < 160; i++) {
      const r = await fetch('/panel/publicar/estado');
      if (!r.ok) break;
      const { data } = await r.json();
      pintar(data);
      if (!data || data.estado !== 'en-marcha') break;
      await new Promise((r2) => setTimeout(r2, 2000));
    }
  } finally {
    vigilando = false;
  }
}

if (boton) {
  boton.addEventListener('click', async () => {
    boton.disabled = true;
    boton.textContent = 'Publicando…';
    try {
      const r = await fetch('/panel/publicar', {
        method: 'POST', headers: { 'x-csrf-token': CSRF },
      });
      const datos = await r.json().catch(() => ({}));
      // 409 = ya había una en marcha. No es un error del que avisar: se vigila
      // la que ya existe, que es lo que la persona quería saber.
      if (!r.ok && r.status !== 409) throw new Error(datos.error || ('Error ' + r.status));
      pintar(datos.data);
      vigilar();
    } catch (e) {
      aviso.className = 'texto mal';
      aviso.innerHTML = '<strong>No se pudo publicar:</strong> ' + escapar(e.message);
      boton.disabled = false;
      boton.textContent = 'Publicar cambios';
    }
  });
}

// Si se entra con una compilación ya en marcha, se sigue desde el principio.
if (franja && franja.dataset.enMarcha) vigilar();

document.querySelectorAll('.bloque .interruptor input').forEach((casilla) => {
  casilla.addEventListener('change', async () => {
    const ficha = casilla.closest('.bloque');
    const rotulo = ficha.querySelector('.rotulo-estado');
    const querido = casilla.checked;

    casilla.disabled = true;
    rotulo.textContent = 'Guardando…';
    try {
      const r = await fetch('/panel/bloques/' + ficha.dataset.bloque + '/visibilidad', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-csrf-token': CSRF },
        body: JSON.stringify({ visible: querido }),
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(datos.error || ('Error ' + r.status));

      // Se obedece al SERVIDOR, no a la casilla: si rechazó el cambio, la
      // pantalla tiene que acabar enseñando lo que de verdad quedó guardado.
      casilla.checked = datos.data.visible;
      ficha.classList.toggle('apagado', !datos.data.visible);
      rotulo.textContent = datos.data.visible ? 'Visible' : 'Oculto';
    } catch (e) {
      casilla.checked = !querido;
      rotulo.textContent = 'No se pudo: ' + e.message;
    } finally {
      casilla.disabled = false;
    }
  });
});
</script>`,
  });
}
