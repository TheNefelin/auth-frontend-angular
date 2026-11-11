import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { csrfGuard } from './csrf';

function makeReq(method: string, cookie?: string, header?: string): Request {
  return { method, headers: { cookie, 'x-csrf-token': header } } as unknown as Request;
}

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('csrfGuard', () => {
  it('deja pasar métodos no mutantes sin revisar', () => {
    const next = vi.fn() as NextFunction;
    csrfGuard(makeReq('GET', 'csrf_token=abc'), makeRes() as unknown as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('deja pasar mutante sin cookie csrf_token (sin sesión)', () => {
    const next = vi.fn() as NextFunction;
    csrfGuard(makeReq('POST'), makeRes() as unknown as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('rechaza mutante con cookie pero sin cabecera X-CSRF-Token', () => {
    const res = makeRes();
    csrfGuard(makeReq('POST', 'csrf_token=abc'), res as unknown as Response, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ type: 'csrf-failed' }));
  });

  it('rechaza mutante con cabecera que no coincide', () => {
    const res = makeRes();
    csrfGuard(makeReq('PUT', 'csrf_token=abc', 'otro'), res as unknown as Response, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deja pasar mutante con cabecera igual a la cookie', () => {
    const next = vi.fn() as NextFunction;
    csrfGuard(makeReq('PATCH', 'csrf_token=abc', 'abc'), makeRes() as unknown as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
