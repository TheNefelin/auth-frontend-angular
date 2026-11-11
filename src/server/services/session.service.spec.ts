import { afterAll, beforeAll, afterEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';

const originalEnv = { ...process.env };

// `config.ts` valida API_URL y API_KEY al importarse: se definen antes del import dinámico.
beforeAll(() => {
  process.env['API_URL'] = 'http://api.test';
  process.env['API_KEY'] = 'key-test';
});

afterAll(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeRes() {
  const append = vi.fn();
  const res = { append } as unknown as Response;
  return { res, append };
}

describe('emitSessionCookies', () => {
  it('emite las 3 cookies con expires_in saneado (NaN → default 900)', async () => {
    const { emitSessionCookies } = await import('./session.service');
    const { res, append } = makeRes();
    emitSessionCookies(res, { access_token: 'A', refresh_token: 'R', expires_in: 'basura' }, false);
    const calls = append.mock.calls.map((c) => c[1] as string);
    expect(calls.some((c) => c.startsWith('access_token=A') && c.includes('Max-Age=900'))).toBe(true);
    expect(calls.some((c) => c.startsWith('refresh_token=R') && c.includes('Max-Age=86400'))).toBe(true);
    expect(calls.some((c) => c.startsWith('csrf_token=') && c.includes('Max-Age=900'))).toBe(true);
  });

  it('respeta un expires_in numérico positivo', async () => {
    const { emitSessionCookies } = await import('./session.service');
    const { res, append } = makeRes();
    emitSessionCookies(res, { access_token: 'A', expires_in: 1800 }, false);
    const access = append.mock.calls.map((c) => c[1] as string).find((c) => c.startsWith('access_token='));
    expect(access).toContain('Max-Age=1800');
  });

  it('solo access_token → no emite refresh_token', async () => {
    const { emitSessionCookies } = await import('./session.service');
    const { res, append } = makeRes();
    emitSessionCookies(res, { access_token: 'A' }, false);
    const names = append.mock.calls.map((c) => (c[1] as string).split('=')[0]);
    expect(names).toContain('access_token');
    expect(names).not.toContain('refresh_token');
    expect(names).toContain('csrf_token');
  });
});

describe('clearSessionCookies', () => {
  it('borra las 3 cookies con Max-Age=0', async () => {
    const { clearSessionCookies } = await import('./session.service');
    const { res, append } = makeRes();
    clearSessionCookies(res, false);
    const calls = append.mock.calls.map((c) => c[1] as string);
    expect(calls).toHaveLength(3);
    expect(calls.every((c) => c.includes('Max-Age=0'))).toBe(true);
  });
});

describe('refreshSession', () => {
  it('devuelve tokens saneados cuando el backend responde 200', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ access_token: 'A2', refresh_token: 'R2', expires_in: 'basura' }),
    })));
    const { refreshSession } = await import('./session.service');
    const result = await refreshSession('R1');
    expect(result?.accessToken).toBe('A2');
    expect(result?.refreshToken).toBe('R2');
    expect(result?.expiresIn).toBe(900);
  });

  it('devuelve null cuando el backend responde no-OK o fetch falla', async () => {
    const { refreshSession } = await import('./session.service');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    expect(await refreshSession('R1')).toBeNull();

    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    }));
    expect(await refreshSession('R1')).toBeNull();
  });
});
