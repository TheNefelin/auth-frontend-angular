import { describe, expect, it } from 'vitest';
import { buildSetCookie, cookieOpts, parseCookies } from './cookies';

describe('parseCookies', () => {
  it('parsea múltiples cookies y decodifica valores', () => {
    expect(parseCookies('a=1; b=%C3%B1o%20x; lone=')).toEqual({ a: '1', b: 'ño x', lone: '' });
  });

  it('ignora segmentos sin = y tolera cabecera ausente', () => {
    expect(parseCookies('x; a=1')).toEqual({ a: '1' });
    expect(parseCookies(undefined)).toEqual({});
  });
});

describe('cookieOpts', () => {
  it('incluye HttpOnly y Secure solo cuando aplican', () => {
    expect(cookieOpts(900, true, true)).toBe('Path=/; SameSite=Lax; Max-Age=900; HttpOnly; Secure');
    expect(cookieOpts(0, false, false)).toBe('Path=/; SameSite=Lax; Max-Age=0');
  });
});

describe('buildSetCookie', () => {
  it('codifica el valor por defecto', () => {
    expect(buildSetCookie('t', 'a b+c', 900, true, false)).toContain('t=a%20b%2Bc; ');
  });

  it('permite valor sin codificar cuando se indica', () => {
    expect(buildSetCookie('t', 'plain', 900, false, false, false)).toContain('t=plain; ');
  });
});
