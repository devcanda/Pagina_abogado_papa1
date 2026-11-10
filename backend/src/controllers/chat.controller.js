import { z } from 'zod';
import { ejecutarTriage } from '../services/triage.service.js';
import * as chatLogsRepo from '../repositories/chatLogs.repo.js';
import * as leadsRepo from '../repositories/leads.repo.js';
import { asyncHandler } from '../utils/errors.js';

export const esquemaChat = z.object({
  mensaje: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(1000),
  session_id: z.string().uuid().optional(),
  origen: z.string().trim().max(120).optional(),
});

/** POST /api/chat/triage — un turno de conversación con el bot. */
export const triage = asyncHandler(async (req, res) => {
  const { mensaje, session_id: sessionId, origen } = req.body;

  const historial = sessionId ? await chatLogsRepo.historialDeSesion(sessionId) : [];
  const resultado = await ejecutarTriage(mensaje, historial);

  // El lead se crea solo cuando el modelo confirma nombre y teléfono.
  let lead = null;
  if (resultado.listo_para_lead && resultado.nombre && resultado.telefono) {
    lead = await leadsRepo.crearLead({
      nombre: resultado.nombre,
      telefono: resultado.telefono,
      areaLegal: resultado.area_legal,
      resumenCaso: resultado.resumen_caso,
      origen: origen ?? 'chat-triage',
      // El aviso de tratamiento de datos se acepta al abrir el chat en el frontend.
      consentimientoDatos: true,
    });
  }

  const turno = await chatLogsRepo.registrarTurno({
    leadId: lead?.id ?? null,
    sessionId: sessionId ?? null,
    mensajeUsuario: mensaje,
    respuestaIa: resultado.respuesta,
  });

  res.json({
    data: {
      respuesta: resultado.respuesta,
      area_legal: resultado.area_legal,
      session_id: turno.session_id,
      lead_id: lead?.id ?? null,
    },
  });
});
