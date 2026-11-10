/**
 * Saneado de HTML con lista blanca, para el bloque de texto libre.
 *
 * Es el único sitio donde el contenido del editor llega al navegador como
 * marcado en lugar de como texto, así que es el único sitio donde puede
 * inyectarse algo. La regla es la contraria a la habitual: **solo pasa lo que
 * está permitido**, nunca "todo menos lo prohibido", porque esa lista siempre
 * se queda corta.
 *
 * No se usa una biblioteca a propósito: las de saneado serio (DOMPurify)
 * necesitan un DOM, y aquí el conjunto permitido es tan pequeño que una lista
 * blanca estricta es más fácil de auditar que una dependencia.
 */

const ETIQUETAS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a',
]);

// Solo `href` en los enlaces. Nada de `style`, `class`, `on*` ni `target`.
const ATRIBUTOS = { a: new Set(['href']) };

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Solo rutas internas y http(s). Corta `javascript:`, `data:` y demás. */
function hrefSeguro(valor) {
  const v = String(valor).trim();
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(v) && !/[\u0000-\u001f]/.test(v)) {
    return v;
  }
  return null;
}

export function sanearHtml(entrada) {
  if (!entrada) return '';

  // Fuera de la lista blanca por definición: su contenido no es texto.
  let html = String(entrada).replace(
    /<(script|style|iframe|object|embed|svg|math)[\s\S]*?<\/\1>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  const salida = [];
  const abiertas = [];
  // El último caso captura un `<` suelto que no abre etiqueta: en un texto
  // legal («plazo < 30 días») tiene que sobrevivir escapado, no desaparecer.
  const patron = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|(<)/g;

  let m;
  while ((m = patron.exec(html)) !== null) {
    const [completo, etiqueta, atributos, texto, menorSuelto] = m;

    if (texto !== undefined) {
      salida.push(escapar(texto));
      continue;
    }
    if (menorSuelto !== undefined) {
      salida.push('&lt;');
      continue;
    }

    const nombre = etiqueta.toLowerCase();
    if (!ETIQUETAS.has(nombre)) continue;      // etiqueta no permitida: se omite

    if (completo.startsWith('</')) {
      const i = abiertas.lastIndexOf(nombre);
      if (i !== -1) {
        // Cierra también lo que quedara abierto por dentro.
        while (abiertas.length > i) salida.push(`</${abiertas.pop()}>`);
      }
      continue;
    }

    let attrs = '';
    const permitidos = ATRIBUTOS[nombre];
    if (permitidos) {
      const re = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
      let a;
      while ((a = re.exec(atributos || '')) !== null) {
        const clave = a[1].toLowerCase();
        if (!permitidos.has(clave)) continue;
        const valor = a[3] ?? a[4] ?? '';
        if (clave === 'href') {
          const seguro = hrefSeguro(valor);
          if (seguro) attrs += ` href="${escapar(seguro)}" rel="noopener"`;
        }
      }
    }

    if (nombre === 'br') {
      salida.push('<br />');
    } else {
      salida.push(`<${nombre}${attrs}>`);
      abiertas.push(nombre);
    }
  }

  while (abiertas.length) salida.push(`</${abiertas.pop()}>`);
  return salida.join('');
}
