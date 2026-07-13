import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminAuth } from '@/lib/firebase/admin';
import { verifySessionCookie } from './session';

const { adminState } = vi.hoisted(() => ({ adminState: { configured: false } }));

vi.mock('@/lib/firebase/admin', () => ({
  get isFirebaseAdminConfigured() {
    return adminState.configured;
  },
  getAdminAuth: vi.fn(),
}));

describe('verifySessionCookie', () => {
  beforeEach(() => {
    adminState.configured = false;
    vi.mocked(getAdminAuth).mockReset();
  });

  it('returns null when no cookie value is provided', async () => {
    expect(await verifySessionCookie(undefined)).toBeNull();
  });

  it('returns null when Firebase Admin is not configured', async () => {
    expect(await verifySessionCookie('some-cookie-value')).toBeNull();
  });

  it('returns the decoded claims for a valid session cookie', async () => {
    adminState.configured = true;
    vi.mocked(getAdminAuth).mockReturnValue({
      verifySessionCookie: vi.fn().mockResolvedValue({ uid: 'u1' }),
    } as never);

    expect(await verifySessionCookie('valid-cookie')).toEqual({ uid: 'u1' });
  });

  it('returns null when the session cookie is invalid or expired', async () => {
    adminState.configured = true;
    vi.mocked(getAdminAuth).mockReturnValue({
      verifySessionCookie: vi.fn().mockRejectedValue(new Error('expired')),
    } as never);

    expect(await verifySessionCookie('bad-cookie')).toBeNull();
  });
});
