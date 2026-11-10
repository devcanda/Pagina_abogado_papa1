/**
 * Contenido estructurado de la página principal.
 *
 * Vive aquí y no en PostgreSQL a propósito: son listas cortas y estables, y la
 * tabla `paginas` solo guarda un bloque de HTML. Cuando el bufete necesite
 * editarlas sin tocar el repositorio, les corresponde una tabla propia
 * (`areas_practica`, `casos`) — queda anotado como spec 004.
 */

export const areas = [
  {
    nombre: 'Derecho laboral',
    imagen: '/img/area-laboral.svg',
    href: '/areas/derecho-laboral/',
    icono: 'M10 2h4a2 2 0 0 1 2 2v2h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4V4a2 2 0 0 1 2-2m0 4h4V4h-4z',
  },
  {
    nombre: 'Derecho civil',
    imagen: '/img/area-civil.svg',
    href: '/areas/derecho-civil/',
    icono: 'M12 2 2 7v2h20V7zM4 11v7H2v2h20v-2h-2v-7h-2v7h-3v-7h-2v7H8v-7z',
  },
  {
    nombre: 'Derecho de familia',
    imagen: '/img/area-familia.svg',
    href: '/areas/derecho-familia/',
    icono: 'M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6M5 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m14 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M12 12c2.7 0 5 1.6 5 3.6V20H7v-4.4c0-2 2.3-3.6 5-3.6M4 15.5c.4-.5 1-1 1.7-1.3A6 6 0 0 0 5 17v3H1v-2.3c0-1.2 1.3-2.2 3-2.2m16 0c1.7 0 3 1 3 2.2V20h-4v-3c0-1-.3-2-.7-2.8.7.3 1.3.8 1.7 1.3',
  },
  {
    nombre: 'Derecho penal',
    imagen: '/img/area-penal.svg',
    href: '/areas/derecho-penal/',
    icono: 'M14.1 2.6 9.9 6.8l1.4 1.4-5.7 5.7-1.4-1.4-1.4 1.4 5.7 5.7 1.4-1.4-1.4-1.4 5.7-5.7 1.4 1.4 4.2-4.2zM3 20h10v2H3z',
  },
  {
    nombre: 'Derecho inmobiliario',
    imagen: '/img/area-inmobiliario.svg',
    href: '/areas/derecho-inmobiliario/',
    icono: 'M12 3 2 11h3v10h5v-6h4v6h5V11h3zm0 2.7 5 4V19h-1v-6H8v6H7v-9.3z',
  },
  {
    nombre: 'Derecho administrativo',
    imagen: '/img/area-administrativo.svg',
    href: '/areas/derecho-administrativo/',
    icono: 'M4 2h12l4 4v16H4zm11 1.5V7h3.5zM7 10h10v2H7zm0 4h10v2H7zm0 4h6v2H7z',
  },
];

export const testimonio = {
  cita:
    'Llevaba ocho meses peleando mi liquidación por mi cuenta sin avanzar. '
    + 'Aquí me explicaron en la primera cita qué era viable y qué no, sin '
    + 'prometerme nada. Cuatro meses después el caso estaba resuelto.',
  autor: 'Miguel Ángel Restrepo',
  cargo: 'Proceso laboral · Tuluá',
};

export const casos = [
  {
    area: 'Laboral',
    titulo: 'Despido sin justa causa',
    desenlace: 'Indemnización reconocida en primera instancia',
    resumen: 'Reintegro e indemnización completa tras seis años de contrato indefinido.',
    imagen: '/img/caso-1.svg',
  },
  {
    area: 'Civil',
    titulo: 'Responsabilidad contractual',
    desenlace: 'Acuerdo favorable en segunda instancia',
    resumen: 'Incumplimiento de obra privada resuelto en segunda instancia.',
    imagen: '/img/caso-2.svg',
  },
  {
    area: 'Familia',
    titulo: 'Sucesión intestada',
    desenlace: 'Partición cerrada sin llegar a juicio',
    resumen: 'Partición de bienes entre cinco herederos sin llegar a juicio.',
    imagen: '/img/caso-3.svg',
  },
  {
    area: 'Administrativo',
    titulo: 'Nulidad y restablecimiento',
    desenlace: 'Reintegro con salarios caídos',
    resumen: 'Sanción disciplinaria anulada y reintegro al cargo con salarios caídos.',
    imagen: '/img/caso-4.svg',
  },
  {
    area: 'Laboral',
    titulo: 'Accidente de trabajo',
    desenlace: 'Pensión de invalidez reconocida',
    resumen: 'Calificación de origen revisada y pensión de invalidez reconocida.',
    imagen: '/img/caso-5.svg',
  },
];

export const equipo = [
  {
    nombre: 'Daniel Candamil',
    area: 'derecho laboral',
    tarjeta: 'Litigante ante juzgados laborales y tribunales superiores.',
    foto: '/img/equipo-1.svg',
    href: '/equipo/',
  },
  {
    nombre: 'Nombre del abogado',
    area: 'derecho civil',
    tarjeta: 'Responsabilidad contractual y procesos ejecutivos.',
    foto: '/img/equipo-2.svg',
    href: '/equipo/',
  },
  {
    nombre: 'Nombre del abogado',
    area: 'derecho de familia',
    tarjeta: 'Sucesiones, custodias y liquidación de sociedad conyugal.',
    foto: '/img/equipo-3.svg',
    href: '/equipo/',
  },
  {
    nombre: 'Nombre del perito',
    area: 'avalúos periciales',
    tarjeta: 'Avalúos comerciales y dictámenes para proceso judicial.',
    foto: '/img/equipo-4.svg',
    href: '/equipo/',
  },
];
