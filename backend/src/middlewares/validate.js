import { datosInvalidos } from '../utils/errors.js';

/** Valida req.body contra un esquema Zod y lo reemplaza por el valor saneado. */
export const validarBody = (schema) => (req, res, next) => {
  const resultado = schema.safeParse(req.body);
  if (!resultado.success) {
    return next(
      datosInvalidos(
        'Los datos enviados no son válidos',
        resultado.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message })),
      ),
    );
  }
  req.body = resultado.data;
  next();
};
