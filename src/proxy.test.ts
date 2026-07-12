import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { proxy } from './proxy';

vi.mock('./lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'session',
  verifySessionCookie: vi.fn(async (cookie: string | undefined) =>
    cookie === 'valid-session' ? { uid: 'user-1' } : null,
  ),
}));

vi.mock('next-intl/middleware', () => ({
  default: () => () => NextResponse.next(),
}));

function makeRequest(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) headers.set('cookie', `session=${cookie}`);
  return new NextRequest(new URL(path, 'https://example.com'), { headers });
}

describe('proxy', () => {
  it('redirects an authenticated user away from /sign-in to the locale home', async () => {
    const response = await proxy(makeRequest('/en/sign-in', 'valid-session'));

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('https://example.com/en');
  });

  it('redirects an authenticated user away from /sign-up to the locale home', async () => {
    const response = await proxy(makeRequest('/en/sign-up', 'valid-session'));

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('https://example.com/en');
  });

  it('does not redirect an anonymous user away from /sign-in', async () => {
    const response = await proxy(makeRequest('/en/sign-in'));

    expect(response?.status).not.toBe(307);
  });

  it('redirects an anonymous user away from the protected /history route', async () => {
    const response = await proxy(makeRequest('/en/history'));

    expect(response?.status).toBe(307);
    expect(response?.headers.get('location')).toBe('https://example.com/en');
  });

  it('does not redirect an authenticated user away from /history', async () => {
    const response = await proxy(makeRequest('/en/history', 'valid-session'));

    expect(response?.status).not.toBe(307);
  });
});
