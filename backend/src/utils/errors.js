/** Error con código HTTP, para que el manejador central sepa qué responder. */
export class HttpError extends Error {
  constructor(status, message, detalles = undefined) {
    super(message);
    this.status = status;
    this.detalles = detalles;
  }
}

export const noEncontrado = (msg = 'Recurso no encontrado') => new HttpError(404, msg);
export const datosInvalidos = (msg, detalles) => new HttpError(400, msg, detalles);

/** Envuelve un handler async para que sus rechazos lleguen a next(). */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
