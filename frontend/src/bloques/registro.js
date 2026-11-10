import { CLAVES_ICONO } from './iconos.js';

/**
 * Registro de bloques — la pieza central del compositor.
 *
 * Describe cada bloque una sola vez y las dos mitades del sistema lo leen:
 *
 *   · El renderizador decide qué componente invocar y con qué datos.
 *   · El panel genera sus formularios a partir de `campos` y `variantes`.
 *
 * Añadir un bloque es escribir su componente y una entrada aquí. El editor lo
 * muestra solo, sin tocar su código.
 *
 * Tipos de campo que el panel sabe pintar:
 *   texto     una línea
 *   parrafo   varias líneas
 *   lista     lista de cadenas, se añaden y quitan elementos
 *   imagen    selector de la biblioteca; lleva ancho y alto sugeridos
 *   enlace    ruta interna o URL
 *   opcion    lista cerrada de valores; el panel pinta un desplegable
 *   color     color hexadecimal; el panel pinta un selector con el contraste
 *             medido al lado. SIEMPRE validado: acaba dentro de un `style`.
 *             Con `papel: 'fondo'` es un color de FONDO: el panel no le mide
 *             el contraste contra sí mismo —daría 1.00:1 y no significaría
 *             nada— y en cambio los demás colores del bloque miden el suyo
 *             contra él.
 *
 * Un campo puede llevar `reserva: '<otroCampo>'`: significa que solo se usa
 * cuando ese otro campo —un grupo— está vacío. El panel entonces no lo pinta,
 * para no enseñar dos juegos de los mismos campos sin decir cuál manda.
 *   grupo     lista de objetos; `campos` describe los de cada elemento
 */

export const BLOQUES = {
  // ──────────────────────────────────────────────────────────────────────────
  cabecera: {
    nombre: 'Cabecera',
    descripcion: 'Titular grande con texto, botones y foto. Va al principio de la página. '
      + 'Admite hasta tres láminas que el visitante va pasando.',
    tono: 'oscuro',
    componente: 'Cabecera.astro',
    campos: {
      // Campos sueltos: la cabecera de UNA lámina. Se conservan porque son la
      // reserva de `laminas`; si no hay láminas, el componente pinta esto.
      // Quitarlos rompería cualquier cabecera anterior a la 003.
      etiqueta: { tipo: 'texto', reserva: 'laminas', max: 40, ayuda: 'Rótulo pequeño sobre el titular' },
      titulo: { tipo: 'texto', reserva: 'laminas', max: 90, requerido: true },
      subtitulo: { tipo: 'parrafo', reserva: 'laminas', max: 240 },
      imagen: { tipo: 'imagen', reserva: 'laminas', ancho: 900, alto: 1100 },
      textoBoton: { tipo: 'texto', reserva: 'laminas', max: 30 },
      enlaceBoton: { tipo: 'enlace', reserva: 'laminas' },
      textoBoton2: { tipo: 'texto', reserva: 'laminas', max: 30 },
      enlaceBoton2: { tipo: 'enlace', reserva: 'laminas' },

      /**
       * Láminas del carrusel. Con una o ninguna, la cabecera no muestra
       * controles y se ve igual que antes.
       *
       * El tope es 3 a propósito: la altura de la sección la fija la lámina
       * más larga, y por encima de tres nadie llega a la última. Los `max` de
       * texto están igualados a los de arriba para que las tres queden parejas
       * y el bloque no dé un salto de altura al cambiar.
       */
      laminas: {
        tipo: 'grupo',
        max: 3,
        ayuda: 'Deje una sola para que la cabecera no sea un carrusel',
        campos: {
          etiqueta: { tipo: 'texto', max: 40, ayuda: 'Rótulo pequeño sobre el titular' },
          titulo: { tipo: 'texto', max: 90, requerido: true },
          subtitulo: { tipo: 'parrafo', max: 240 },
          imagen: { tipo: 'imagen', ancho: 900, alto: 1100 },
          textoBoton: { tipo: 'texto', max: 30 },
          enlaceBoton: { tipo: 'enlace' },
          textoBoton2: { tipo: 'texto', max: 30 },
          enlaceBoton2: { tipo: 'enlace' },
          // Nombre del punto de navegación. Sin esto, el lector de pantalla
          // solo puede decir «1 de 3», que no orienta a nadie.
          rotulo: { tipo: 'texto', max: 24, ayuda: 'Nombre del punto, p. ej. «Perito avaluador»' },
          /*
           * Colores PROPIOS de cada lámina.
           *
           * Estaban solo en el bloque, así que los tres titulares compartían
           * color a la fuerza. Son tres mensajes a tres públicos y cada uno
           * lleva su foto; no hay razón para que no lleven su color.
           *
           * El contraste se mide contra el fondo de ESTA lámina, no contra el
           * navy fijo: desde que el fondo también se elige, medir contra un
           * valor congelado daría números tranquilizadores y falsos.
           */
          colorTitulo: { tipo: 'color', defecto: '#ffffff', ayuda: 'Color del titular de esta lámina' },
          colorTexto: { tipo: 'color', defecto: '#dce8f5', ayuda: 'Color del texto de esta lámina' },
          /*
           * Color del rótulo pequeño y de su filete.
           *
           * Hace falta por los fondos con foto. El rojo de marca sobre navy
           * plano da 5,92:1, pero sobre una foto —por oscura que se ponga—
           * cae por debajo del mínimo: para que el rojo llegara a 4,5:1 el
           * fondo no podría pasar de una luminancia de 0,0385, que es casi
           * negro y deja la foto en nada.
           *
           * Pasarlo a claro en esas láminas además CUMPLE mejor la regla del
           * proyecto: el rojo se reserva a la acción, y así el botón vuelve a
           * ser lo único rojo de la pantalla.
           *
           * Por defecto el rojo de siempre, para no cambiar las láminas que ya
           * estaban.
           */
          colorEtiqueta: {
            tipo: 'color', defecto: '#d98a8c', nombre: 'Color del rótulo',
            ayuda: 'Sobre una foto de fondo, el rojo no se lee: póngalo claro',
          },

          /*
           * Imagen de FONDO de la lámina, a sangre y por detrás del texto.
           *
           * No es la misma pieza que `imagen`: aquella es la figura recortada
           * que se monta sobre la cuña, y las dos conviven. Por eso son dos
           * campos y dos huecos distintos en la biblioteca.
           *
           * Vacío por defecto: sin él no se pinta ninguna capa y la franja se
           * ve como siempre. Un campo nuevo no cambia nada hasta que alguien
           * lo toca.
           */
          imagenFondo: {
            tipo: 'imagen', ancho: 1920, alto: 1080, nombre: 'Imagen de fondo',
            ayuda: 'Ocupa toda la franja por detrás del texto. Se recorta para llenarla',
          },
          /*
           * Versión VERTICAL del fondo, solo para móvil.
           *
           * La de escritorio es apaisada y en el teléfono la franja es alta y
           * estrecha: `cover` recorta por los lados y deja a la vista entre un
           * 32 % y un 39 % del ancho. En la lámina laboral ahí cabe el abogado
           * y nadie más, con lo que se pierde a quién le explica el contrato.
           *
           * Y no se arregla moviendo el encuadre: los dos personajes ocupan el
           * 52 % del lienzo y en móvil caben 39 %. Hace falta otra imagen.
           *
           * Opcional: sin ella, el móvil sigue usando la de escritorio.
           */
          imagenFondoMovil: {
            tipo: 'imagen', ancho: 800, alto: 1270, nombre: 'Imagen de fondo (móvil)',
            ayuda: 'Versión vertical. Sin ella, en el teléfono se usa la de escritorio',
          },
          /*
           * Velo sobre la imagen de fondo.
           *
           * Una foto cualquiera detrás de un titular blanco es una moneda al
           * aire: el contraste depende de la zona de la foto que caiga bajo
           * cada letra, y eso no hay forma de medirlo desde el panel. El velo
           * es la única herramienta que arregla eso sin tocar la foto.
           *
           * Lista cerrada en vez de un número: no hay tipo numérico en el
           * registro, y «medio» se entiende mejor que «0.5» en una pantalla
           * que usa alguien que no programa.
           *
           * Por defecto NINGUNO, para que añadir el campo no oscurezca nada.
           */
          velo: {
            tipo: 'opcion', nombre: 'Velo sobre la imagen',
            opciones: ['ninguno', 'ligero', 'medio', 'fuerte', 'opaco'],
            defecto: 'ninguno',
            ayuda: 'Oscurece la foto para que se lea el texto. Suba el velo si no se lee',
          },
        },
      },
      /*
       * Colores del texto para la cabecera SIN láminas. Son la reserva, igual
       * que `titulo` o `imagen`: en cuanto hay láminas manda el color de cada
       * una y el panel deja de pintarlos, para no enseñar dos juegos de lo
       * mismo sin decir cuál gana.
       */
      colorTitulo: { tipo: 'color', reserva: 'laminas', defecto: '#ffffff', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', reserva: 'laminas', defecto: '#dce8f5', ayuda: 'Color del texto corrido' },
      colorEtiqueta: { tipo: 'color', reserva: 'laminas', defecto: '#d98a8c', nombre: 'Color del rótulo' },

      /*
       * Fondo de la franja, COMPARTIDO por las tres láminas.
       *
       * No es un descuido que no sea por lámina: las tres ocupan la misma
       * celda de la rejilla dentro de una sola `<section>`, así que un fondo
       * distinto por lámina habría que montarlo como una segunda pila de capas
       * con su propio juego de reglas `:has()`. Y aunque funcionara, el fondo
       * cambiando de color cada cinco segundos es justo lo que hace que un
       * carrusel resulte molesto. El fondo es el escenario; lo que cambia son
       * los actores.
       */
      colorFondo: { tipo: 'color', papel: 'fondo', defecto: '#0a2443',
        nombre: 'Fondo de la franja',
        ayuda: 'Color de toda la franja del slider, detrás de las tres láminas' },
      colorCuna: { tipo: 'color', papel: 'fondo', defecto: '#134782',
        nombre: 'Cuña en diagonal',
        ayuda: 'El triángulo más claro del lado de la foto. Igual que el fondo para quitarla' },
    },
    variantes: {},
  },

  // ──────────────────────────────────────────────────────────────────────────
  textoConImagen: {
    nombre: 'Texto con imagen e insignia',
    descripcion: 'Argumento a un lado, foto al otro, con una cifra destacada montada en la esquina.',
    tono: 'claro',
    componente: 'TextoConImagen.astro',
    campos: {
      etiqueta: { tipo: 'texto', max: 40 },
      titulo: { tipo: 'texto', max: 90, requerido: true },
      destacado: { tipo: 'texto', max: 45, ayuda: 'Parte del titular en cursiva subrayada' },
      texto: { tipo: 'parrafo', max: 600 },
      puntos: { tipo: 'lista', max: 5, ayuda: 'Cada punto lleva una marca de verificación' },
      imagen: { tipo: 'imagen', ancho: 700, alto: 900 },
      cifra: { tipo: 'texto', max: 6, ayuda: 'Número de la insignia' },
      cifraPie: { tipo: 'texto', max: 30 },
      textoBoton: { tipo: 'texto', max: 30 },
      enlaceBoton: { tipo: 'enlace' },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#373435', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#373435', ayuda: 'Color del texto corrido' },
    },
    variantes: {
      ladoImagen: { nombre: 'Lado de la imagen', opciones: ['izquierda', 'derecha'], defecto: 'izquierda' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  franjaTexto: {
    nombre: 'Franja de una línea',
    descripcion: 'Separador con un mensaje corto. Las palabras finales van rotando.',
    tono: 'medio',
    componente: 'FranjaTexto.astro',
    campos: {
      texto: { tipo: 'texto', max: 60, requerido: true },
      rotativas: { tipo: 'lista', max: 4, ayuda: 'Se alternan solas; deja una sola para fijarla' },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#5b5557', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#5b5557', ayuda: 'Color del texto corrido' },
    },
    variantes: {},
  },

  // ──────────────────────────────────────────────────────────────────────────
  rejillaTarjetas: {
    nombre: 'Rejilla de tarjetas con icono',
    descripcion: 'Servicios o áreas, cada uno con su imagen de fondo e icono.',
    tono: 'oscuro',
    componente: 'RejillaTarjetas.astro',
    campos: {
      etiqueta: { tipo: 'texto', max: 40 },
      titulo: { tipo: 'texto', max: 90, requerido: true },
      destacado: { tipo: 'texto', max: 45 },
      texto: { tipo: 'parrafo', max: 300 },
      textoBoton: { tipo: 'texto', max: 30 },
      enlaceBoton: { tipo: 'enlace' },
      palabraFondo: { tipo: 'texto', max: 14, ayuda: 'Palabra grande y tenue al fondo' },
      tarjetas: {
        tipo: 'grupo',
        max: 12,
        campos: {
          nombre: { tipo: 'texto', max: 50, requerido: true },
          enlace: { tipo: 'enlace' },
          imagen: { tipo: 'imagen', ancho: 600, alto: 800 },
          icono: { tipo: 'opcion', opciones: CLAVES_ICONO, defecto: 'balanza' },
        },
      },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#ffffff', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#dce8f5', ayuda: 'Color del texto corrido' },
    },
    variantes: {
      columnas: { nombre: 'Columnas', opciones: ['2', '3'], defecto: '3' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  cifrasYPreguntas: {
    nombre: 'Cifras y preguntas',
    descripcion: 'Cuadrícula de datos a un lado y acordeón de preguntas al otro.',
    tono: 'claro',
    componente: 'CifrasYPreguntas.astro',
    campos: {
      etiqueta: { tipo: 'texto', max: 40 },
      titulo: { tipo: 'texto', max: 90, requerido: true },
      destacado: { tipo: 'texto', max: 45 },
      cifras: {
        tipo: 'grupo',
        max: 4,
        campos: {
          valor: { tipo: 'texto', max: 8, requerido: true },
          texto: { tipo: 'texto', max: 30, requerido: true },
        },
      },
      preguntas: {
        tipo: 'grupo',
        max: 8,
        campos: {
          pregunta: { tipo: 'texto', max: 120, requerido: true },
          respuesta: { tipo: 'parrafo', max: 600, requerido: true },
        },
      },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#373435', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#373435', ayuda: 'Color del texto corrido' },
    },
    variantes: {},
  },

  // ──────────────────────────────────────────────────────────────────────────
  servicioDestacado: {
    nombre: 'Servicio destacado',
    descripcion: 'Un servicio con texto, lista de puntos, imagen y botón.',
    tono: 'oscuro',
    componente: 'ServicioDestacado.astro',
    campos: {
      etiqueta: { tipo: 'texto', max: 40 },
      titulo: { tipo: 'texto', max: 60, requerido: true },
      destacado: { tipo: 'texto', max: 45 },
      texto: { tipo: 'parrafo', max: 600 },
      puntos: { tipo: 'lista', max: 6 },
      imagen: { tipo: 'imagen', ancho: 900, alto: 680 },
      textoBoton: { tipo: 'texto', max: 30 },
      enlaceBoton: { tipo: 'enlace' },
      palabraFondo: { tipo: 'texto', max: 14, ayuda: 'Palabra grande y tenue al fondo' },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#ffffff', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#dce8f5', ayuda: 'Color del texto corrido' },
    },
    variantes: {
      ladoImagen: { nombre: 'Lado de la imagen', opciones: ['izquierda', 'derecha'], defecto: 'izquierda' },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  tarjetasConFoto: {
    nombre: 'Tarjetas con fotografía',
    descripcion: 'Casos, noticias o proyectos, con foto, etiqueta y resultado.',
    tono: 'claro',
    componente: 'TarjetasConFoto.astro',
    campos: {
      etiqueta: { tipo: 'texto', max: 40 },
      titulo: { tipo: 'texto', max: 90, requerido: true },
      destacado: { tipo: 'texto', max: 45 },
      texto: { tipo: 'parrafo', max: 300 },
      textoBoton: { tipo: 'texto', max: 30 },
      enlaceBoton: { tipo: 'enlace' },
      tarjetas: {
        tipo: 'grupo',
        max: 9,
        campos: {
          etiqueta: { tipo: 'texto', max: 24 },
          titulo: { tipo: 'texto', max: 70, requerido: true },
          resumen: { tipo: 'parrafo', max: 240 },
          pie: { tipo: 'texto', max: 70, ayuda: 'Resultado o fecha, con marca de verificación' },
          imagen: { tipo: 'imagen', ancho: 600, alto: 380 },
        },
      },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#373435', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#373435', ayuda: 'Color del texto corrido' },
    },
    variantes: {},
  },

  // ──────────────────────────────────────────────────────────────────────────
  franjaCierre: {
    nombre: 'Franja de cierre',
    descripcion: 'Última llamada a la acción antes del pie. Un solo botón.',
    tono: 'oscuro',
    componente: 'FranjaCierre.astro',
    campos: {
      titulo: { tipo: 'texto', max: 70, requerido: true },
      destacado: { tipo: 'texto', max: 30 },
      textoBoton: { tipo: 'texto', max: 30 },
      enlaceBoton: { tipo: 'enlace' },
      textoTelefono: { tipo: 'texto', max: 30 },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#ffffff', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#dce8f5', ayuda: 'Color del texto corrido' },
    },
    variantes: {},
  },

  // ──────────────────────────────────────────────────────────────────────────
  textoLibre: {
    nombre: 'Texto libre',
    descripcion: 'Párrafos y subtítulos sueltos. Para contenido que no encaja en otro bloque.',
    tono: 'claro',
    componente: 'TextoLibre.astro',
    campos: {
      titulo: { tipo: 'texto', max: 90 },
      destacado: { tipo: 'texto', max: 45 },
      contenido: { tipo: 'parrafo', max: 4000, ayuda: 'Admite HTML sencillo: párrafos, subtítulos y listas' },
      /*
       * Colores del texto. Selector LIBRE por decisión del cliente (D4): no
       * se bloquea nada, pero el panel enseña el contraste medido al lado.
       *
       * Los valores por defecto son los que el bloque ya usaba, así que
       * añadir estos campos no cambió nada hasta que alguien los toque.
       */
      colorTitulo: { tipo: 'color', defecto: '#373435', ayuda: 'Color del titular' },
      colorTexto: { tipo: 'color', defecto: '#373435', ayuda: 'Color del texto corrido' },
    },
    variantes: {
      ancho: { nombre: 'Ancho del texto', opciones: ['estrecho', 'ancho'], defecto: 'estrecho' },
    },
  },
};

/** Lista para el catálogo del panel, en el orden en que conviene ofrecerlos. */
export const CATALOGO = Object.entries(BLOQUES).map(([tipo, def]) => ({
  tipo,
  nombre: def.nombre,
  descripcion: def.descripcion,
  tono: def.tono,
}));

/** Valores por defecto de las variantes de un tipo, para crear un bloque nuevo. */
export function variantesPorDefecto(tipo) {
  const def = BLOQUES[tipo];
  if (!def) return {};
  return Object.fromEntries(
    Object.entries(def.variantes).map(([k, v]) => [k, v.defecto]),
  );
}

/**
 * Valida y limpia lo que llega del panel contra la definición del bloque.
 * Nunca se guarda un campo que el registro no declare: así el editor no puede
 * inyectar propiedades arbitrarias en el componente.
 */
export function sanearDatos(tipo, datos) {
  const def = BLOQUES[tipo];
  if (!def) throw new Error(`Tipo de bloque desconocido: ${tipo}`);

  const limpiar = (campos, entrada) => {
    const salida = {};
    for (const [clave, campo] of Object.entries(campos)) {
      const valor = entrada?.[clave];
      if (valor === undefined || valor === null) continue;

      if (campo.tipo === 'lista') {
        salida[clave] = (Array.isArray(valor) ? valor : [])
          .slice(0, campo.max ?? 10)
          .map((v) => String(v).trim())
          .filter(Boolean);
      } else if (campo.tipo === 'grupo') {
        salida[clave] = (Array.isArray(valor) ? valor : [])
          .slice(0, campo.max ?? 10)
          .map((item) => limpiar(campo.campos, item));
      } else if (campo.tipo === 'opcion') {
        // Solo valores del catálogo: el editor no puede inventar uno.
        salida[clave] = campo.opciones.includes(valor) ? valor : campo.defecto;
      } else if (campo.tipo === 'imagen') {
        /*
         * Es la CLAVE de un hueco de la biblioteca (`hero-perito`), no una
         * ruta, y acaba usándose como índice para buscar el archivo. Se exige
         * la forma de una clave y se descarta todo lo demás: un valor con
         * barras o puntos solo puede venir de alguien intentando apuntar a
         * otro sitio.
         *
         * Una clave que no existe en la biblioteca se queda como está: el
         * renderizador la resuelve a cadena vacía y el bloque pinta el hueco
         * sin foto, que es un error visible y recuperable. Comprobar que
         * existe de verdad le toca al panel, que es quien tiene el catálogo.
         */
        const c = String(valor).trim().toLowerCase();
        salida[clave] = /^[a-z0-9][a-z0-9-]{0,62}$/.test(c) ? c : '';
      } else if (campo.tipo === 'color') {
        /*
         * Un color acaba DENTRO de un atributo `style`. Sin esta comprobación
         * el campo sería una vía de inyección de CSS: bastaría guardar
         * `red;background:url(...)` para sacar marcado de su sitio.
         *
         * Se exige la forma exacta y se descarta todo lo demás, en vez de
         * intentar limpiar lo que venga: una lista de lo permitido no se puede
         * rodear; una de lo prohibido, siempre.
         */
        const hex = String(valor).trim().toLowerCase();
        salida[clave] = /^#[0-9a-f]{6}$/.test(hex) ? hex : (campo.defecto ?? '');
      } else {
        const t = String(valor).trim();
        salida[clave] = campo.max ? t.slice(0, campo.max) : t;
      }
    }
    return salida;
  };

  return limpiar(def.campos, datos);
}

/** Igual que `sanearDatos`, pero para las variantes: solo opciones declaradas. */
export function sanearVariantes(tipo, variantes) {
  const def = BLOQUES[tipo];
  if (!def) return {};
  const salida = {};
  for (const [clave, v] of Object.entries(def.variantes)) {
    const elegida = variantes?.[clave];
    salida[clave] = v.opciones.includes(elegida) ? elegida : v.defecto;
  }
  return salida;
}

/**
 * Sustituye las claves de imagen por su ruta actual.
 *
 * Los bloques guardan la clave del hueco (`sobre-nosotros`), no la ruta. Es lo
 * que permite que sustituir una imagen en el panel se vea en el sitio aunque
 * el archivo nuevo tenga otra extensión: la clave no cambia nunca.
 *
 * Un hueco sin imagen cargada se queda vacío y el bloque decide qué hacer; es
 * preferible a pintar la ruta rota de un archivo que no existe.
 */
export function resolverMedios(tipo, datos, medios = {}) {
  const def = BLOQUES[tipo];
  if (!def) return datos;

  const resolver = (campos, entrada) => {
    const salida = { ...entrada };
    for (const [clave, campo] of Object.entries(campos)) {
      const valor = entrada?.[clave];
      if (valor === undefined) continue;

      if (campo.tipo === 'imagen') {
        salida[clave] = medios[valor]?.archivo ?? '';
        salida[clave + 'Alt'] = medios[valor]?.alt ?? '';
      } else if (campo.tipo === 'grupo' && Array.isArray(valor)) {
        salida[clave] = valor.map((item) => resolver(campo.campos, item));
      }
    }
    return salida;
  };

  return resolver(def.campos, datos);
}
