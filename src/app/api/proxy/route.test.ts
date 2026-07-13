import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySessionCookie } from '@/lib/auth/session';
import { recordHistoryEntry } from '@/lib/history/storage';
import { isBlockedTarget } from '@/lib/proxy/ssrf-guard';
import { GET, POST } from './route';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'session',
  verifySessionCookie: vi.fn(),
}));
vi.mock('@/lib/history/storage', () => ({ recordHistoryEntry: vi.fn() }));
vi.mock('@/lib/proxy/ssrf-guard', () => ({ isBlockedTarget: vi.fn() }));

function makeRequest(url: string, init?: RequestInit) {
  return new NextRequest(new Request(url, init));
}

describe('proxy route', () => {
  beforeEach(() => {
    vi.mocked(verifySessionCookie).mockReset().mockResolvedValue(null);
    vi.mocked(recordHistoryEntry).mockReset().mockResolvedValue(undefined);
    vi.mocked(isBlockedTarget).mockReset().mockReturnValue(false);
    global.fetch = vi.fn();
  });

  it('returns 400 when the target query parameter is missing', async () => {
    const response = await GET(makeRequest('http://localhost/api/proxy'));
    expect(response.status).toBe(400);
  });

  it('returns 400 for an invalid target URL', async () => {
    const response = await GET(
      makeRequest('http://localhost/api/proxy?target=' + encodeURIComponent('not a url')),
    );
    expect(response.status).toBe(400);
  });

  it('returns 400 when the target is blocked (SSRF guard)', async () => {
    vi.mocked(isBlockedTarget).mockReturnValue(true);

    const response = await GET(
      makeRequest('http://localhost/api/proxy?target=' + encodeURIComponent('http://127.0.0.1')),
    );
    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('forwards the request and mirrors the upstream status/body, without recording history when unauthenticated', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const response = await GET(
      makeRequest(
        'http://localhost/api/proxy?target=' + encodeURIComponent('https://api.example.com/data'),
        { headers: { cookie: 'session=abc', host: 'localhost', 'accept-encoding': 'gzip' } },
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(recordHistoryEntry).not.toHaveBeenCalled();

    const [, options] = vi.mocked(global.fetch).mock.calls[0];
    const forwardedHeaders = options?.headers as Headers;
    expect(forwardedHeaders.has('cookie')).toBe(false);
    expect(forwardedHeaders.has('host')).toBe(false);
    expect(forwardedHeaders.has('accept-encoding')).toBe(false);
  });

  it('records a history entry for authenticated users', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(global.fetch).mockResolvedValue(new Response('body', { status: 201 }));

    await POST(
      makeRequest(
        'http://localhost/api/proxy?target=' + encodeURIComponent('https://api.example.com/data'),
        { method: 'POST', body: JSON.stringify({ a: 1 }) },
      ),
    );

    expect(recordHistoryEntry).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.example.com/data',
        status: 201,
        error: null,
      }),
    );
  });

  it('returns 502 and records the error when the upstream fetch fails', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(global.fetch).mockRejectedValue(new Error('network down'));

    const response = await GET(
      makeRequest(
        'http://localhost/api/proxy?target=' + encodeURIComponent('https://api.example.com'),
      ),
    );

    expect(response.status).toBe(502);
    expect(recordHistoryEntry).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ status: null, error: 'network down' }),
    );
  });

  it('never lets a history-logging failure break the actual response', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(global.fetch).mockResolvedValue(new Response('ok', { status: 200 }));
    vi.mocked(recordHistoryEntry).mockRejectedValue(new Error('firestore down'));

    const response = await GET(
      makeRequest(
        'http://localhost/api/proxy?target=' + encodeURIComponent('https://api.example.com'),
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('ok');
  });
});
