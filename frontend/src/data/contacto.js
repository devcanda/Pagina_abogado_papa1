/**
 * Datos de contacto del bufete. ÚNICA fuente.
 *
 * Están aquí y no repetidos por los componentes porque Google penaliza la
 * incoherencia del NAP (nombre, dirección, teléfono): si la cabecera dice una
 * dirección y el pie otra, el negocio pierde posición en las búsquedas locales.
 * Con un solo archivo, cambiarlos es una línea y no hay forma de olvidar uno.
 */
export const telefono = import.meta.env.PUBLIC_TELEFONO ?? '';

/** `tel:` no admite espacios ni paréntesis. */
export const telefonoMarcable = telefono.replace(/[^\d+]/g, '');

export const telefonoFijo = '602 226 1303';
export const telefonoFijoMarcable = '+576022261303';

/**
 * `telefono` llega pegado («+573165325335») porque así viaja en el `.env`.
 * Para enseñarlo se le separa el indicativo, que es como lo escribe el propio
 * bufete. El `tel:` sigue usando `telefonoMarcable`, sin espacios.
 */
export const telefonoLegible = telefono.replace(/^(\+\d{2})(?=\d)/, '$1 ');

export const horario = {
  horas: '8:00 a. m. – 6:00 p. m.',
  dias: 'Abierto de lunes a viernes',
  /*
   * Las MISMAS horas en la notación compacta que usa la página publicada.
   * No es otro dato: es otra forma de escribir este. Si cambia el horario,
   * cambian las dos líneas o el sitio empieza a decir dos cosas.
   */
  horasCompactas: '8:00-18:00',
};

export const email = 'contacto@candamilabogados.com';

export const direccion = 'Cra. 31 #24-54, Céspedes, Tuluá';
export const ciudad = 'Tuluá, Valle del Cauca';

/*
 * `direccion` YA TERMINA en «Tuluá», así que pegarle `ciudad` detrás deja
 * «… Tuluá · Tuluá, Valle del Cauca». Estas dos piezas existen para componer
 * la dirección larga sin repetir la ciudad.
 */
export const departamento = 'Valle del Cauca';
export const pais = 'Colombia';

/**
 * Enlace a la FICHA del negocio, no a una búsqueda por dirección: así abre el
 * perfil con reseñas, horario y la opción de «cómo llegar».
 *
 * Se le quitaron los parámetros `entry` y `g_ep` que traía la URL copiada del
 * navegador: son de sesión y caducan.
 */
export const mapa = 'https://www.google.com/maps/place/Candamil+y+Asociados+Abogados/'
  + '@4.0857802,-76.198681,17z/data=!3m1!4b1!4m6!3m5'
  + '!1s0x8e39c5a2d482e3f1:0xf8f3ab36998cfe39'
  + '!8m2!3d4.0857749!4d-76.1938101!16s%2Fg%2F11ww7gt75h';

export const whatsapp = import.meta.env.PUBLIC_WHATSAPP ?? '';

/**
 * Perfiles en redes. ÚNICA fuente, por el mismo motivo que el resto: hasta
 * ahora los iconos de la barra superior apuntaban a `#` porque nadie los
 * configuró, y el día que se añadiera un bloque de redes habría dos listas que
 * acabarían discrepando.
 *
 * Aquí van los PERFILES, que no cambian nunca. El vídeo de YouTube que se
 * muestra en la portada NO está aquí: eso es contenido, cambia, y se edita
 * desde el panel como cualquier otro texto.
 *
 * Una cadena vacía significa «esa red no existe todavía»: ni el icono ni el
 * bloque la pintan. Es preferible a un enlace que lleva a ninguna parte.
 *
 * EL ORDEN DE DECLARACIÓN ES EL ORDEN EN QUE SE PINTAN. `redesActivas()`
 * recorre las claves tal como están escritas aquí, así que mover una línea
 * mueve el icono en la barra superior y en el menú móvil. Facebook, YouTube y
 * TikTok van primero por petición del cliente (18-11-2026): son las tres que
 * el bufete usa. Instagram y LinkedIn se quedan declaradas y vacías para que
 * añadirlas sea escribir una URL, no tocar código.
 */
export const redes = {
  facebook: '',
  youtube: '',
  tiktok: '',
  instagram: '',
  linkedin: '',
};

/** Las que están configuradas, en el orden en que se declaran. */
export const redesActivas = () =>
  Object.entries(redes).filter(([, url]) => url).map(([nombre, url]) => ({ nombre, url }));

/*
 * Las que el bufete USA, estén o no configuradas.
 *
 * Es una lista aparte de `redesActivas()` y no un capricho: el cliente quiere
 * ver los tres logotipos en la cabecera desde ya, y todavía no tiene las
 * direcciones de los perfiles (18-11-2026). Con una sola función no hay forma
 * de distinguir «esta red no la tenemos» de «la tenemos pero aún no sé la
 * URL», y las dos cosas se pintan distinto: la primera no sale, la segunda
 * sale como dibujo sin enlace.
 *
 * Pegar aquí abajo la URL en `redes` es lo único que hace falta para que el
 * dibujo se convierta en enlace. No hay que tocar ningún componente.
 *
 * El orden de ESTA lista es el que manda en la cabecera.
 */
export const REDES_EN_USO = ['facebook', 'youtube', 'tiktok'];

export const redesEnUso = () =>
  REDES_EN_USO.map((nombre) => ({ nombre, url: redes[nombre] ?? '' }));

export const MENSAJE_POR_DEFECTO = 'Hola, necesito asesoría jurídica. ¿Me pueden ayudar?';

/** Enlace a WhatsApp con el mensaje ya escrito. */
export function enlaceWhatsApp(mensaje) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje ?? MENSAJE_POR_DEFECTO)}`;
}
