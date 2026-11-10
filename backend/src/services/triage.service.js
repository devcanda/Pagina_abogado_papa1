import OpenAI from 'openai';
import { env } from '../config/env.js';

let cliente = null;

/** Instancia perezosa: si no hay API key, el resto de la API sigue funcionando. */
function obtenerCliente() {
  if (!env.openaiApiKey) return null;
  cliente ??= new OpenAI({ apiKey: env.openaiApiKey });
  return cliente;
}

const PROMPT_SISTEMA = `Eres el asistente de recepción de Candamil Abogados, un bufete colombiano.

Tu única función es hacer TRIAGE: entender el problema del visitante, clasificarlo y
recoger sus datos de contacto para que un abogado lo llame.

Reglas innegociables:
- NUNCA des asesoría jurídica, opiniones legales, plazos de prescripción ni pronósticos
  sobre el caso. Si te lo piden, responde que eso lo define el abogado en la consulta.
- No prometas resultados, montos de indemnización ni tiempos de proceso.
- Habla en español neutro de Colombia, en tono cercano y claro. Máximo 3 frases por turno.
- Pide los datos de a uno: primero el problema, luego el nombre, luego el teléfono.
- Si el tema no es jurídico o está fuera de nuestras áreas, dilo con amabilidad y ofrece
  dejar los datos de todas formas.

Áreas que atendemos: laboral, civil, familia, administrativo, penal.`;

// Esquema de salida estructurada: el modelo clasifica y decide si ya hay datos
// suficientes para crear el lead, en vez de que lo adivinemos con expresiones regulares.
const ESQUEMA_TRIAGE = {
  type: 'json_schema',
  json_schema: {
    name: 'triage_legal',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        respuesta: { type: 'string', description: 'Lo que se le muestra al visitante.' },
        area_legal: {
          type: ['string', 'null'],
          enum: ['laboral', 'civil', 'familia', 'administrativo', 'penal', 'otro', null],
        },
        resumen_caso: { type: ['string', 'null'] },
        nombre: { type: ['string', 'null'] },
        telefono: { type: ['string', 'null'] },
        listo_para_lead: { type: 'boolean' },
      },
      required: ['respuesta', 'area_legal', 'resumen_caso', 'nombre', 'telefono', 'listo_para_lead'],
    },
  },
};

// Respuesta de reserva cuando la IA no está disponible (sin clave, cuota agotada,
// caída del proveedor). El visitante sigue pudiendo dejar sus datos.
const RESPUESTA_DEGRADADA = Object.freeze({
  respuesta:
    'Gracias por escribir. En este momento el asistente no está disponible; '
    + 'déjanos tu nombre y teléfono y un abogado te contacta hoy mismo.',
  area_legal: null,
  resumen_caso: null,
  nombre: null,
  telefono: null,
  listo_para_lead: false,
});

/**
 * Ejecuta un turno de conversación.
 * @param {string} mensaje  Texto del visitante.
 * @param {{mensaje_usuario: string, respuesta_ia: string}[]} historial Turnos previos.
 */
export async function ejecutarTriage(mensaje, historial = []) {
  const openai = obtenerCliente();

  // Sin API key ni siquiera intentamos la llamada.
  if (!openai) return RESPUESTA_DEGRADADA;

  const mensajes = [
    { role: 'system', content: PROMPT_SISTEMA },
    ...historial.flatMap((t) => [
      { role: 'user', content: t.mensaje_usuario },
      { role: 'assistant', content: t.respuesta_ia },
    ]),
    { role: 'user', content: mensaje },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: env.openaiModel,
      messages: mensajes,
      response_format: ESQUEMA_TRIAGE,
      temperature: 0.3,
      max_tokens: 400,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    // Nunca dejamos salir el error de OpenAI hacia el navegador: su texto
    // incluye el prefijo de la API key y detalles de nuestra configuración.
    // Un fallo del proveedor no debe costarnos el lead: degradamos y seguimos.
    console.error(`[triage] Fallo en OpenAI (${error.status ?? 'sin código'}): ${error.message}`);
    return RESPUESTA_DEGRADADA;
  }
}
