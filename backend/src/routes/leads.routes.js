import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from '../controllers/leads.controller.js';
import { validarBody } from '../middlewares/validate.js';

export const leadsRouter = Router();

// Formulario público: límite estricto por IP para frenar el spam de bots.
const limite = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados envíos. Intenta de nuevo en unos minutos.' },
});

leadsRouter.post('/', limite, validarBody(controller.esquemaLead), controller.crear);
