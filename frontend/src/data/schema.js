/**
 * Datos estructurados (JSON-LD) del sitio. Spec 014.
 *
 * ── Qué había antes ────────────────────────────────────────────────────────
 * Un `LegalService` con cuatro campos —nombre, url, `areaServed: 'CO'` y
 * teléfono— repetido IDÉNTICO en las siete páginas. Para la búsqueda local
 * eso es casi no declarar nada: sin dirección, sin coordenadas, sin horario y
 * sin perfiles, Google no tiene con qué casar el sitio con la ficha del
 * negocio.
 *
 * Y el teléfono se leía de `PUBLIC_TELEFONO` directamente, saltándose
 * `contacto.js`: el mismo NAP duplicado que el proyecto ya cerró dos veces.
 * Aquí TODO sale de la fuente única.
 *
 * ── Una entidad, no siete ──────────────────────────────────────────────────
 * El bufete se declara entero una vez, con un `@id` estable. Las demás
 * páginas lo REFERENCIAN por ese `@id` en lugar de copiarlo. Siete copias
 * pobres son siete entidades débiles; una bien descrita es una fuerte.
 *
 * ── Lo que deliberadamente NO se declara ───────────────────────────────────
 * - **`aggregateRating` y `review`.** No hay reseñas que los respalden.
 *   Inventarlos es motivo de penalización y, en un bufete, de algo peor.
 * - **`priceRange`.** El sitio publica el precio de tres planes de asesoría,
 *   que no es el rango de honorarios de un litigio. Declarar «$$» sería
 *   adivinar y declarar el de los planes sería engañar.
 * - **`sameAs`.** Se emite solo si hay perfiles REALES configurados. Hoy el
 *   bloque de redes lleva valores de ejemplo que apuntan a las cuentas de
 *   TikTok y de Meta; declarar eso sería decirle a Google que ese es el
 *   bufete.
 */
import {
  nombreLegal, nombresAlternativos,
  telefono, email, direccionPartes, departamento, pais,
  coordenadas, mapa, horario, redes,
} from './contacto.js';

/** Ancla estable de la entidad. No cambia aunque cambie el contenido. */
export const idBufete = (sitio) => new URL('#bufete', sitio).href;

/**
 * Las materias del despacho, para `knowsAbout`.
 *
 * No es relleno: es la lista de temas por los que el bufete quiere que lo
 * encuentren, dicha en el vocabulario que la máquina entiende. Hoy el sitio
 * no tiene una página por materia —ver D5 de la spec 014—, así que esta es la
 * única señal temática estructurada que existe.
 */
const MATERIAS = [
  'Derecho laboral', 'Derecho civil', 'Derecho de familia',
  'Derecho penal', 'Derecho inmobiliario', 'Derecho administrativo',
  'Derecho de la seguridad social', 'Avalúos y peritaje',
];

/** Solo los perfiles con URL de verdad. Ver la nota sobre `sameAs` arriba. */
const perfilesReales = () => Object.values(redes).filter(Boolean);

/**
 * `8:00` → `08:00`.
 *
 * `openingHoursSpecification` quiere la hora en ISO 8601, que exige dos
 * dígitos. `horasCompactas` se escribió para que la lea una persona, así que
 * trae `8:00` sin el cero. Sin esta conversión el dato sale mal formado y el
 * validador de Google lo rechaza **sin que nada en la página se vea raro**.
 */
const hora24 = (h) => h.trim().padStart(5, '0');

/** La entidad completa. Va en las páginas que describen el negocio. */
export function esquemaBufete(sitio) {
  const perfiles = perfilesReales();
  return {
    '@context': 'https://schema.org',
    /*
     * Dos tipos a la vez, que es JSON-LD válido: `LegalService` es el que
     * Google documenta para negocios jurídicos y `Attorney` es el subtipo
     * exacto. Declarando los dos no se depende de cuál reconozca cada
     * consumidor del dato.
     */
    '@type': ['LegalService', 'Attorney'],
    '@id': idBufete(sitio),
    name: nombreLegal,
    alternateName: nombresAlternativos,
    url: new URL('/', sitio).href,
    logo: new URL('/img/logo-candamil.png', sitio).href,
    image: new URL('/img/og-imagen.png', sitio).href,
    description:
      'Bufete de abogados en Tuluá, Valle del Cauca, con 26 años de ejercicio '
      + 'en derecho laboral, civil, de familia, penal y administrativo, y '
      + 'avalúos certificados. Atención directa del abogado titular.',
    telephone: telefono,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: direccionPartes.via,
      addressLocality: direccionPartes.localidad,
      addressRegion: departamento,
      addressCountry: 'CO',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: coordenadas.latitud,
      longitude: coordenadas.longitud,
    },
    hasMap: mapa,
    /*
     * El horario en notación de schema.org sale de `horasCompactas`, que
     * existe en `contacto.js` precisamente para esto: es el mismo horario que
     * se pinta en la página, escrito de otra forma.
     */
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: hora24(horario.horasCompactas.split('-')[0]),
      closes: hora24(horario.horasCompactas.split('-')[1]),
    }],
    areaServed: [
      { '@type': 'AdministrativeArea', name: departamento },
      { '@type': 'Country', name: pais },
    ],
    knowsAbout: MATERIAS,
    availableLanguage: 'es',
    founder: {
      '@type': 'Person',
      name: 'Diego Antonio Candamil Rengifo',
      jobTitle: 'Abogado titular',
    },
    foundingDate: '2000',
    ...(perfiles.length ? { sameAs: perfiles } : {}),
  };
}

/** Referencia a la entidad, para las páginas que no la describen. */
export const refBufete = (sitio) => ({ '@id': idBufete(sitio) });

/**
 * Migas de pan.
 *
 * `tramos` es [{ nombre, ruta }], de la portada hacia dentro. Google las usa
 * para sustituir la URL del resultado por un rastro legible, que es más
 * fácil de leer y gana clics.
 *
 * La página actual se incluye y **no lleva `item`**: es la recomendación de
 * Google para el último tramo, porque enlazar a donde ya estás no aporta.
 */
export function esquemaMigas(sitio, tramos) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: tramos.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.nombre,
      ...(i < tramos.length - 1 ? { item: new URL(t.ruta, sitio).href } : {}),
    })),
  };
}

/**
 * El sitio como entidad, con su buscador interno... que NO existe.
 *
 * Por eso aquí NO se declara `potentialAction: SearchAction`: anunciarle a
 * Google un buscador que no está es pedirle que enseñe una caja de búsqueda
 * en el resultado y que no funcione.
 */
export function esquemaSitio(sitio) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': new URL('#sitio', sitio).href,
    url: new URL('/', sitio).href,
    name: nombreLegal,
    inLanguage: 'es-CO',
    publisher: refBufete(sitio),
  };
}
