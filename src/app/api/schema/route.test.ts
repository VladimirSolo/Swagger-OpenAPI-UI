import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySessionCookie } from '@/lib/auth/session';
import { getSavedSchema, saveSchema } from '@/lib/schema/storage';
import { GET, POST } from './route';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'cookie-value' }) }),
}));
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'session',
  verifySessionCookie: vi.fn(),
}));
vi.mock('@/lib/schema/storage', () => ({
  getSavedSchema: vi.fn(),
  saveSchema: vi.fn(),
}));

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/schema', { method: 'POST', body: JSON.stringify(body) });
}

describe('/api/schema', () => {
  beforeEach(() => {
    vi.mocked(verifySessionCookie).mockReset();
    vi.mocked(getSavedSchema).mockReset();
    vi.mocked(saveSchema).mockReset();
  });

  describe('GET', () => {
    it('returns 401 when there is no valid session', async () => {
      vi.mocked(verifySessionCookie).mockResolvedValue(null);

      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('returns the saved schema for an authenticated user', async () => {
      vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
      vi.mocked(getSavedSchema).mockResolvedValue({ content: '{"a":1}', format: 'json' });

      const response = await GET();

      expect(getSavedSchema).toHaveBeenCalledWith('u1');
      expect(await response.json()).toEqual({ schema: { content: '{"a":1}', format: 'json' } });
    });
  });

  describe('POST', () => {
    it('returns 401 when there is no valid session', async () => {
      vi.mocked(verifySessionCookie).mockResolvedValue(null);

      const response = await POST(jsonRequest({ content: '{}', format: 'json' }));
      expect(response.status).toBe(401);
    });

    it('returns 400 for a missing content or invalid format', async () => {
      vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);

      const missingContent = await POST(jsonRequest({ format: 'json' }));
      expect(missingContent.status).toBe(400);

      const invalidFormat = await POST(jsonRequest({ content: '{}', format: 'xml' }));
      expect(invalidFormat.status).toBe(400);
    });

    it('saves the schema for an authenticated user', async () => {
      vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
      vi.mocked(saveSchema).mockResolvedValue(undefined);

      const response = await POST(jsonRequest({ content: '{"a":1}', format: 'json' }));

      expect(saveSchema).toHaveBeenCalledWith('u1', '{"a":1}', 'json');
      expect(await response.json()).toEqual({ success: true });
    });
  });
});
