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

export const email = 'contacto@candamilabogados.com';

export const direccion = 'Cra. 31 #24-54, Céspedes, Tuluá';
export const ciudad = 'Tuluá, Valle del Cauca';

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
 */
export const redes = {
  facebook: '',
  instagram: '',
  linkedin: '',
  tiktok: '',
  youtube: '',
};

/** Las que están configuradas, en el orden en que se declaran. */
export const redesActivas = () =>
  Object.entries(redes).filter(([, url]) => url).map(([nombre, url]) => ({ nombre, url }));

export const MENSAJE_POR_DEFECTO = 'Hola, necesito asesoría jurídica. ¿Me pueden ayudar?';

/** Enlace a WhatsApp con el mensaje ya escrito. */
export function enlaceWhatsApp(mensaje) {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje ?? MENSAJE_POR_DEFECTO)}`;
}
