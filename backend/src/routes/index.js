import { Router } from 'express';
import { paginasRouter } from './paginas.routes.js';
import { leadsRouter } from './leads.routes.js';
import { chatRouter } from './chat.routes.js';
import { pool } from '../config/db.js';

export const apiRouter = Router();

/** Sonda de salud: útil para el monitor de cPanel y para depurar el deploy. */
apiRouter.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'ok', uptime: Math.round(process.uptime()) });
  } catch (err) {
    res.status(503).json({ status: 'degraded', db: 'error', mensaje: err.message });
  }
});

apiRouter.use('/paginas', paginasRouter);
apiRouter.use('/leads', leadsRouter);
apiRouter.use('/chat', chatRouter);
