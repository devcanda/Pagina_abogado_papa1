import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as controller from '../controllers/chat.controller.js';
import { validarBody } from '../middlewares/validate.js';

export const chatRouter = Router();

// Cada turno cuesta tokens de OpenAI: el límite protege el presupuesto.
const limite = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Has enviado muchos mensajes. Espera un momento.' },
});

chatRouter.post('/triage', limite, validarBody(controller.esquemaChat), controller.triage);
