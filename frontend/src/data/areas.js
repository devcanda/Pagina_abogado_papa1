/**
 * Catálogo estructurado de Áreas de Práctica.
 *
 * Fuente de datos para la página /areas/ y su cuadrícula moderna de 3 columnas.
 * Cada área cuenta con su imagen optimizada, síntesis de especialidad y
 * llamada de acción directa.
 */
import { enlaceWhatsApp } from './contacto.js';

export const areasPractica = [
  {
    id: 'laboral',
    nombre: 'Derecho Laboral',
    subtitulo: 'Despidos sin justa causa, liquidaciones, reintegros laborales, acoso y reclamación pensional.',
    imagen: '/img/area-laboral.webp',
    href: '/demanda-laboral/',
    ctaTexto: 'Ver servicio laboral',
    whatsappMensaje: 'Hola, deseo una consulta sobre un caso de Derecho Laboral.',
    destacado: true,
  },
  {
    id: 'civil',
    nombre: 'Derecho Civil',
    subtitulo: 'Responsabilidad civil y contractual, cobro de cartera, indemnizaciones y redacción de contratos.',
    imagen: '/img/area-civil.webp',
    href: enlaceWhatsApp('Hola, deseo realizar una consulta sobre un proceso de Derecho Civil.'),
    ctaTexto: 'Consultar caso civil',
    whatsappMensaje: 'Hola, deseo realizar una consulta sobre un proceso de Derecho Civil.',
    destacado: false,
  },
  {
    id: 'familia',
    nombre: 'Derecho de Familia',
    subtitulo: 'Sucesiones y herencias, divorcios, cuotas alimentarias, régimen de visitas y custodia.',
    imagen: '/img/area-familia.webp',
    href: enlaceWhatsApp('Hola, requiero asesoría jurídica en Derecho de Familia o Sucesiones.'),
    ctaTexto: 'Consultar caso de familia',
    whatsappMensaje: 'Hola, requiero asesoría jurídica en Derecho de Familia o Sucesiones.',
    destacado: false,
  },
  {
    id: 'penal',
    nombre: 'Derecho Penal',
    subtitulo: 'Defensa técnica especializada, representación de víctimas, audiencias preliminares y juicios.',
    imagen: '/img/area-penal.webp',
    href: enlaceWhatsApp('Hola, necesito asistencia y defensa jurídica en materia penal.'),
    ctaTexto: 'Consultar defensa penal',
    whatsappMensaje: 'Hola, necesito asistencia y defensa jurídica en materia penal.',
    destacado: false,
  },
  {
    id: 'inmobiliario',
    nombre: 'Derecho Inmobiliario',
    subtitulo: 'Restitución de inmuebles, prescripción adquisitiva (pertenencia), deslindes y escrituración.',
    imagen: '/img/area-inmobiliario.webp',
    href: enlaceWhatsApp('Hola, requiero orientación en Derecho Inmobiliario o litigio de tierras.'),
    ctaTexto: 'Consultar tema inmobiliario',
    whatsappMensaje: 'Hola, requiero orientación en Derecho Inmobiliario o litigio de tierras.',
    destacado: false,
  },
  {
    id: 'administrativo',
    nombre: 'Derecho Administrativo',
    subtitulo: 'Demandas contra el Estado, reparación directa, nulidad y restablecimiento del derecho, disciplinarios.',
    imagen: '/img/area-administrativo.webp',
    href: enlaceWhatsApp('Hola, deseo asesoría en una demanda o litigio contra el Estado.'),
    ctaTexto: 'Consultar tema administrativo',
    whatsappMensaje: 'Hola, deseo asesoría en una demanda o litigio contra el Estado.',
    destacado: false,
  },
  {
    id: 'peritaje',
    nombre: 'Perito Avaluador',
    subtitulo: 'Avalúos comerciales, urbanos, rurales y especiales certificados (RNA/ARAV) con defensa en estrado.',
    imagen: '/img/fondo-perito.webp',
    href: enlaceWhatsApp('Hola, necesito cotizar un avalúo o dictamen pericial con el perito titular.'),
    ctaTexto: 'Solicitar avalúo pericial',
    whatsappMensaje: 'Hola, necesito cotizar un avalúo o dictamen pericial con el perito titular.',
    destacado: true,
  },
  {
    id: 'transito',
    nombre: 'Tránsito y Accidentes',
    subtitulo: 'Reclamaciones por accidentes viales, cobro a aseguradoras (SOAT y contractual) y peritaje automotor.',
    imagen: '/img/area-transito.webp',
    href: enlaceWhatsApp('Hola, requiero asesoría por un accidente de tránsito o cobro de indemnización.'),
    ctaTexto: 'Consultar accidente de tránsito',
    whatsappMensaje: 'Hola, requiero asesoría por un accidente de tránsito o cobro de indemnización.',
    destacado: false,
  },
  {
    id: 'conciliacion',
    nombre: 'Conciliación y Contratos',
    subtitulo: 'Mecanismos alternativos de solución de conflictos (MASC), acuerdos extrajudiciales y blindaje contractual.',
    imagen: '/img/area-conciliacion.webp',
    href: enlaceWhatsApp('Hola, deseo asesoría para un trámite de conciliación extrajudicial o revisión contractual.'),
    ctaTexto: 'Consultar conciliación',
    whatsappMensaje: 'Hola, deseo asesoría para un trámite de conciliación extrajudicial o revisión contractual.',
    destacado: false,
  },
];
