import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminAuth } from '@/lib/firebase/admin';
import { POST } from './route';

const { adminState } = vi.hoisted(() => ({ adminState: { configured: true } }));

vi.mock('@/lib/firebase/admin', () => ({
  get isFirebaseAdminConfigured() {
    return adminState.configured;
  },
  getAdminAuth: vi.fn(),
}));

function jsonRequest(body: unknown) {
  return new Request('http://localhost/api/auth/session', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/session', () => {
  beforeEach(() => {
    adminState.configured = true;
    vi.mocked(getAdminAuth).mockReset();
  });

  it('returns 500 when Firebase Admin is not configured', async () => {
    adminState.configured = false;

    const response = await POST(jsonRequest({ idToken: 'token' }));
    expect(response.status).toBe(500);
  });

  it('returns 400 when idToken is missing', async () => {
    const response = await POST(jsonRequest({}));
    expect(response.status).toBe(400);
  });

  it('returns 401 when the token is invalid or expired', async () => {
    vi.mocked(getAdminAuth).mockReturnValue({
      verifyIdToken: vi.fn().mockRejectedValue(new Error('invalid')),
      createSessionCookie: vi.fn(),
    } as never);

    const response = await POST(jsonRequest({ idToken: 'bad-token' }));
    expect(response.status).toBe(401);
  });

  it('sets an httpOnly session cookie on success', async () => {
    vi.mocked(getAdminAuth).mockReturnValue({
      verifyIdToken: vi.fn().mockResolvedValue({ uid: 'u1' }),
      createSessionCookie: vi.fn().mockResolvedValue('signed-cookie-value'),
    } as never);

    const response = await POST(jsonRequest({ idToken: 'good-token' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    const cookie = response.cookies.get('session');
    expect(cookie?.value).toBe('signed-cookie-value');
    expect(cookie?.httpOnly).toBe(true);
  });
});
