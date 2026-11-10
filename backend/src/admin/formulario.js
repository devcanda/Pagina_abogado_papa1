import { esc } from './vistas.js';

/**
 * Generador de formularios a partir del registro de bloques.
 *
 * Lee `campos` de `frontend/src/bloques/registro.js` —el mismo archivo que usa
 * el renderizador— y pinta un control por campo. **No hay catálogo duplicado**:
 * duplicarlo garantiza que un día el formulario y la página dejen de coincidir,
 * y nadie se entera hasta que un campo se guarda y no se pinta.
 *
 * Añadir un campo a un bloque es tocar el registro. El formulario aparece solo.
 *
 * ── Los nombres llevan la ruta dentro del dato ────────────────────────────
 * `laminas.1.titulo` en vez de `titulo`. Así el guion del panel reconstruye el
 * objeto anidado sin saber nada de la forma concreta de cada bloque, y los
 * campos de grupo —las láminas del slider, las tarjetas— funcionan igual que
 * los sueltos.
 */

/** Fondo dominante de cada tono, para poder medir el contraste. */
export const FONDO_POR_TONO = {
  oscuro: '#0a2443',   // marino-900
  // «medio» es la franja sobre `bg-humo`, que es CLARO pese al nombre del tono.
  // Medir contra navy daría números tranquilizadores y falsos.
  medio: '#f4f8fc',    // humo
  claro: '#ffffff',
};

/**
 * Huecos de la biblioteca que el desplegable nunca ofrece.
 *
 * `prueba-*` existe solo para que las pruebas automáticas tengan dónde subir
 * sin tocar una imagen real. Si apareciera en la lista, alguien podría apuntar
 * una lámina de la portada a ese hueco y la siguiente prueba cambiaría el
 * sitio de verdad.
 */
const PREFIJO_DE_PRUEBA = 'prueba-';

/**
 * Nombres legibles de los campos más repetidos.
 *
 * Sin esto, la etiqueta sale de partir el nombre interno por mayúsculas y
 * queda «Titulo», «Subtitulo», «Laminas»: sin tildes y en jerga de programador.
 * Quien usa el panel escribe en castellano y merece leerlo en castellano.
 *
 * Un campo puede traer su propio `nombre` en el registro y entonces manda ese.
 */
const NOMBRES = {
  titulo: 'Título',
  subtitulo: 'Subtítulo',
  etiqueta: 'Rótulo pequeño',
  texto: 'Texto',
  contenido: 'Contenido',
  destacado: 'Palabra destacada',
  laminas: 'Lámina',
  rotulo: 'Nombre del punto',
  textoBoton: 'Texto del botón',
  enlaceBoton: 'Enlace del botón',
  textoBoton2: 'Texto del segundo botón',
  enlaceBoton2: 'Enlace del segundo botón',
  palabraFondo: 'Palabra de fondo',
  colorTitulo: 'Color del titular',
  colorTexto: 'Color del texto',
  cifra: 'Cifra',
  cifraPie: 'Pie de la cifra',
  puntos: 'Puntos con marca de verificación',
  tarjetas: 'Tarjeta',
  cifras: 'Cifra',
  preguntas: 'Pregunta',
  casos: 'Caso',
  nombre: 'Nombre',
  enlace: 'Enlace',
  icono: 'Icono',
  valor: 'Valor',
  pregunta: 'Pregunta',
  respuesta: 'Respuesta',
  resumen: 'Resumen',
  textoTelefono: 'Texto del teléfono',
  rotativas: 'Palabras que rotan',
};

/**
 * ¿Este campo es una reserva que ya no manda?
 *
 * La cabecera tiene «titulo», «subtitulo»… sueltos Y los mismos dentro de cada
 * lámina. Los sueltos son la reserva que el componente usa cuando no hay
 * láminas. Enseñar los dos juegos a la vez deja a quien edita sin forma de
 * saber cuál toca, y casi seguro tocando el que no se ve.
 *
 * La regla vive aquí sola porque la usan dos sitios: el que pinta el
 * formulario y el que calcula qué imágenes quedan fuera de él. Duplicada, un
 * día dejarían de coincidir y una imagen desaparecería del panel.
 */
export function reservaSuperada(campo, datos) {
  return Boolean(campo.reserva
    && Array.isArray(datos?.[campo.reserva])
    && datos[campo.reserva].length);
}

/**
 * Claves de imagen que el formulario SÍ pinta, con sus grupos dentro.
 *
 * La rejilla de arriba enseña lo que queda fuera. Sin este cálculo habría que
 * elegir entre repetir cada foto dos veces en la misma pantalla o arriesgarse
 * a que alguna no salga en ninguna de las dos, que es peor: desde el panel
 * sería invisible para siempre.
 */
export function clavesPintadas(campos, datos = {}) {
  const claves = new Set();
  const recorrer = (defs, entrada) => {
    for (const [clave, campo] of Object.entries(defs)) {
      if (reservaSuperada(campo, entrada)) continue;
      const valor = entrada?.[clave];
      if (campo.tipo === 'imagen') {
        if (typeof valor === 'string' && valor) claves.add(valor);
      } else if (campo.tipo === 'grupo' && Array.isArray(valor)) {
        valor.forEach((item) => recorrer(campo.campos, item));
      }
    }
  };
  recorrer(campos, datos);
  return claves;
}

function etiqueta(clave, campo) {
  const nombre = campo.nombre ?? NOMBRES[clave] ?? clave
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase());
  return `${esc(nombre)}${campo.requerido ? ' <span class="obligatorio" title="Obligatorio">*</span>' : ''}`;
}

function ayuda(campo) {
  return campo.ayuda ? `<small class="pista">${esc(campo.ayuda)}</small>` : '';
}

/**
 * Selector de color.
 *
 * `refFondo` es la ruta del campo de FONDO del bloque, si lo declara. El
 * contraste se mide contra ese valor en vivo y no contra el tono congelado del
 * registro: desde que el fondo de la cabecera se elige desde el panel, medir
 * contra un navy fijo daría un número tranquilizador y falso en cuanto alguien
 * pusiera un fondo claro. `data-fondo` se queda como respaldo para los bloques
 * que no tienen campo de fondo.
 *
 * Un campo de fondo NO enseña contraste: medirlo contra sí mismo da 1.00:1 y
 * no significa nada. Lo que hace es provocar que los demás vuelvan a medirse.
 */
function campoColor(ruta, clave, campo, valor, tono, refFondo) {
  const actual = valor || campo.defecto || '#000000';
  const esFondo = campo.papel === 'fondo';
  return `
  <div class="campo campo-color" data-fondo="${esc(FONDO_POR_TONO[tono] ?? '#ffffff')}"
       ${refFondo && !esFondo ? `data-fondo-ref="${esc(refFondo)}"` : ''}>
    <label for="${esc(ruta)}">${etiqueta(clave, campo)}</label>
    <div class="fila-color">
      <input type="color" id="${esc(ruta)}" name="${esc(ruta)}" value="${esc(actual)}"
             data-color${esFondo ? ' data-color-fondo' : ''}>
      <input type="text" class="hex" value="${esc(actual)}" data-hex
             maxlength="7" spellcheck="false" aria-label="Valor hexadecimal">
      ${esFondo ? '' : '<span class="contraste" data-contraste aria-live="polite"></span>'}
    </div>
    ${ayuda(campo)}
  </div>`;
}

/**
 * Imagen de un bloque, dentro del formulario.
 *
 * Antes las fotos vivían SOLO en la rejilla de arriba y los textos aquí, así
 * que para cambiar la foto de la lámina 2 había que adivinar cuál de las tres
 * tarjetas de la cabecera era la suya. Ahora cada foto sale junto al texto al
 * que acompaña.
 *
 * Son dos acciones distintas y por eso hay dos controles:
 *
 *   · **Sustituir el archivo** del hueco que la lámina ya usa. Es lo normal:
 *     la clave no cambia, así que el sitio sigue apuntando donde apuntaba.
 *   · **Apuntar a otro hueco** de la biblioteca. Hace falta porque quitar y
 *     volver a añadir una lámina pierde su clave, y sin desplegable no habría
 *     forma de devolvérsela.
 *
 * El desplegable solo ofrece huecos de la MISMA medida sugerida: meter una
 * foto de caso (600×380) en el hueco de una lámina (900×1100) la deja
 * recortada, y un desplegable no es sitio para descubrir eso.
 */
function campoImagen(ruta, clave, campo, valor, medios) {
  const actual = typeof valor === 'string' ? valor : '';
  const medio = medios.get(actual);
  const ancho = campo.ancho ?? medio?.ancho_sugerido ?? 0;
  const alto = campo.alto ?? medio?.alto_sugerido ?? 0;

  const compatibles = [...medios.values()].filter((m) =>
    !m.clave.startsWith(PREFIJO_DE_PRUEBA)
    && m.ancho_sugerido === ancho && m.alto_sugerido === alto);

  const opciones = [
    `<option value=""${actual ? '' : ' selected'}>— sin imagen —</option>`,
    ...compatibles.map((m) =>
      `<option value="${esc(m.clave)}"${m.clave === actual ? ' selected' : ''}>`
      + `${esc(m.descripcion || m.clave)}</option>`),
  ].join('');

  // La versión en la consulta obliga al navegador a releer el archivo: la
  // clave no cambia al sustituir la foto, así que sin esto la caché seguiría
  // enseñando la anterior y parecería que la subida no hizo nada.
  const version = medio ? (Date.parse(medio.actualizado_en) || 0) : 0;
  const medidas = medio?.ancho ? `${medio.ancho}×${medio.alto}` : 'sin medir';
  const peso = medio?.bytes ? `${Math.round(medio.bytes / 1024)} KB` : '—';

  return `
  <div class="campo campo-imagen" data-medio data-clave="${esc(actual)}">
    <label for="${esc(ruta)}">${etiqueta(clave, campo)}</label>
    <div class="fila-imagen">
      <div class="lienzo">
        ${medio
    ? `<img src="${esc(medio.archivo)}?v=${version}" alt="" loading="lazy">`
    : '<span class="sin-foto">Sin foto</span>'}
      </div>
      <div class="lado">
        <select id="${esc(ruta)}" name="${esc(ruta)}" data-elegir-imagen>${opciones}</select>
        <p class="meta">Debe medir ${ancho}×${alto} px</p>
        <p class="meta" data-medidas>${medio ? `Ahora: ${medidas} · ${peso}` : ''}</p>
        <label class="falso-boton">
          Sustituir la foto
          <input type="file" accept="image/png,image/jpeg,image/webp"
                 data-ancho="${ancho}" data-alto="${alto}"${actual ? '' : ' disabled'}>
        </label>
        <p class="estado" role="status"></p>
      </div>
    </div>
    ${ayuda(campo)}
  </div>`;
}

function campoLista(ruta, clave, campo, valor) {
  const items = Array.isArray(valor) ? valor : [];
  const filas = items.map((v, i) => `
      <div class="elemento-lista">
        <input type="text" name="${esc(ruta)}.${i}" value="${esc(v)}">
        <button type="button" class="quitar" data-quitar aria-label="Quitar">&times;</button>
      </div>`).join('');
  return `
  <div class="campo campo-lista" data-lista="${esc(ruta)}" data-max="${campo.max ?? 10}">
    <label>${etiqueta(clave, campo)}</label>
    <div data-elementos>${filas}</div>
    <button type="button" class="secundario anadir" data-anadir>Añadir</button>
    ${ayuda(campo)}
  </div>`;
}

function campoGrupo(ruta, clave, campo, valor, tono, medios, refFondo) {
  const items = Array.isArray(valor) ? valor : [];
  const fichas = items.map((item, i) => `
      <fieldset class="grupo-item">
        <legend>${esc(campo.nombre ?? NOMBRES[clave] ?? clave)} ${i + 1}
          <button type="button" class="quitar" data-quitar aria-label="Quitar">&times;</button>
        </legend>
        ${pintarCampos(campo.campos, item, `${ruta}.${i}`, tono, medios, refFondo)}
      </fieldset>`).join('');
  return `
  <div class="campo campo-grupo" data-grupo="${esc(ruta)}" data-max="${campo.max ?? 10}">
    <label>${etiqueta(clave, campo)}</label>
    <div data-elementos>${fichas}</div>
    <button type="button" class="secundario anadir" data-anadir>Añadir</button>
    ${ayuda(campo)}
  </div>`;
}

/**
 * Pinta los campos de un objeto `campos` del registro. Recursiva por los grupos.
 *
 * `medios` es el catálogo de la biblioteca indexado por clave. Hace falta aquí
 * porque un campo de imagen no se puede pintar sin saber qué archivo tiene
 * detrás ni qué otros huecos de su misma medida existen.
 */
export function pintarCampos(
  campos, datos = {}, prefijo = '', tono = 'claro', medios = new Map(), refFondo = null,
) {
  const partes = [];

  /*
   * Campo de fondo del bloque, si lo declara. Se busca una sola vez en la raíz
   * y se arrastra hacia los grupos: las láminas del slider miden su contraste
   * contra el fondo de la franja, que es del bloque, no suyo.
   */
  const fondoDelBloque = refFondo ?? Object.entries(campos)
    .filter(([, c]) => c.tipo === 'color' && c.papel === 'fondo')
    .map(([k]) => (prefijo ? `${prefijo}.${k}` : k))[0] ?? null;

  for (const [clave, campo] of Object.entries(campos)) {
    if (reservaSuperada(campo, datos)) continue;

    const ruta = prefijo ? `${prefijo}.${clave}` : clave;
    const valor = datos?.[clave];

    if (campo.tipo === 'imagen') {
      partes.push(campoImagen(ruta, clave, campo, valor, medios));
      continue;
    }
    if (campo.tipo === 'color') {
      partes.push(campoColor(ruta, clave, campo, valor, tono, fondoDelBloque));
      continue;
    }
    if (campo.tipo === 'lista') {
      partes.push(campoLista(ruta, clave, campo, valor));
      continue;
    }
    if (campo.tipo === 'grupo') {
      partes.push(campoGrupo(ruta, clave, campo, valor, tono, medios, fondoDelBloque));
      continue;
    }

    let control;
    if (campo.tipo === 'parrafo') {
      control = `<textarea id="${esc(ruta)}" name="${esc(ruta)}" rows="4"`
        + `${campo.max ? ` maxlength="${campo.max}"` : ''}>${esc(valor ?? '')}</textarea>`;
    } else if (campo.tipo === 'opcion') {
      const opciones = campo.opciones.map((o) =>
        `<option value="${esc(o)}"${o === (valor ?? campo.defecto) ? ' selected' : ''}>${esc(o)}</option>`).join('');
      control = `<select id="${esc(ruta)}" name="${esc(ruta)}">${opciones}</select>`;
    } else {
      control = `<input type="text" id="${esc(ruta)}" name="${esc(ruta)}"`
        + ` value="${esc(valor ?? '')}"`
        + `${campo.max ? ` maxlength="${campo.max}"` : ''}>`;
    }

    // El contador de caracteres solo donde hay tope: sin él no dice nada.
    const contador = campo.max
      ? `<small class="contador" data-contador="${campo.max}"></small>`
      : '';

    partes.push(`
  <div class="campo">
    <label for="${esc(ruta)}">${etiqueta(clave, campo)}</label>
    ${control}
    ${ayuda(campo)}${contador}
  </div>`);
  }

  return partes.join('');
}

/** Selector de variantes: listas cerradas, nada que validar en el navegador. */
export function pintarVariantes(variantes, elegidas = {}) {
  const entradas = Object.entries(variantes ?? {});
  if (!entradas.length) return '';
  const controles = entradas.map(([clave, v]) => {
    const opciones = v.opciones.map((o) =>
      `<option value="${esc(o)}"${o === (elegidas?.[clave] ?? v.defecto) ? ' selected' : ''}>${esc(o)}</option>`).join('');
    return `
    <div class="campo">
      <label for="variantes.${esc(clave)}">${esc(v.nombre ?? clave)}</label>
      <select id="variantes.${esc(clave)}" name="variantes.${esc(clave)}">${opciones}</select>
    </div>`;
  }).join('');
  return `<div class="variantes"><h4>Disposición</h4>${controles}</div>`;
}
