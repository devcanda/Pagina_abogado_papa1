import { Router } from 'express';
import * as controller from '../controllers/paginas.controller.js';

export const paginasRouter = Router();

paginasRouter.get('/', controller.listar);
paginasRouter.get('/:slug/bloques', controller.obtenerConBloques);
paginasRouter.get('/:slug', controller.obtenerPorSlug);
