import { z } from 'zod';
import * as leadsRepo from '../repositories/leads.repo.js';
import { asyncHandler } from '../utils/errors.js';

export const esquemaLead = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre completo').max(120),
  telefono: z
    .string()
    .trim()
    .min(7, 'El teléfono es demasiado corto')
    .max(20)
    .regex(/^[\d\s+()-]+$/, 'El teléfono solo puede contener números y los signos + ( ) -'),
  area_legal: z.enum(['laboral', 'civil', 'familia', 'administrativo', 'penal', 'otro']).optional(),
  resumen_caso: z.string().trim().max(2000).optional(),
  email: z.string().trim().email('Correo inválido').optional().or(z.literal('')),
  origen: z.string().trim().max(120).optional(),
  // Ley 1581 de 2012: sin consentimiento explícito no podemos tratar el dato.
  consentimiento_datos: z.literal(true, {
    errorMap: () => ({ message: 'Debes autorizar el tratamiento de tus datos' }),
  }),
});

/** POST /api/leads */
export const crear = asyncHandler(async (req, res) => {
  const body = req.body;
  const lead = await leadsRepo.crearLead({
    nombre: body.nombre,
    telefono: body.telefono,
    areaLegal: body.area_legal ?? null,
    resumenCaso: body.resumen_caso ?? null,
    email: body.email || null,
    origen: body.origen ?? null,
    consentimientoDatos: body.consentimiento_datos,
  });

  res.status(201).json({ data: lead });
});
