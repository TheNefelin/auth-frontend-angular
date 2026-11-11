import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { jsonErrorHandler } from './json-error';

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('jsonErrorHandler', () => {
  it('responde 400 JSON ante SyntaxError de parseo', () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    jsonErrorHandler(new SyntaxError('Unexpected token'), {} as Request, res as unknown as Response, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ type: 'malformed-json' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('delega errores que no son de parseo', () => {
    const res = makeRes();
    const next = vi.fn() as NextFunction;
    const err = new Error('boom');
    jsonErrorHandler(err, {} as Request, res as unknown as Response, next);
    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });
});
