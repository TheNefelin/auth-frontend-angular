/**
 * Errores de parseo del body JSON (`express.json()`).
 *
 * Un cliente que envía JSON inválido recibía el error handler por defecto de
 * Express (HTML/stack). Aquí se responde 400 con el mismo contrato JSON
 * que el resto del BFF.
 */

import type { NextFunction, Request, Response } from 'express';

export function jsonErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  // `express.json()` envuelve el SyntaxError del parseo en un objeto con status 400.
  if (err instanceof SyntaxError) {
    res.status(400).json({
      type: 'malformed-json',
      title: 'Malformed JSON body.',
      status: 400,
      detail: 'El cuerpo de la petición no es un JSON válido.',
    });
    return;
  }
  next(err);
}
