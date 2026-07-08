import { describe, expect, it } from 'vitest';
import { verifySessionCookie } from './session';

describe('verifySessionCookie', () => {
  it('returns null when no cookie value is provided', async () => {
    expect(await verifySessionCookie(undefined)).toBeNull();
  });

  it('returns null when Firebase Admin is not configured', async () => {
    // No FIREBASE_ADMIN_* env vars are set in the test environment.
    expect(await verifySessionCookie('some-cookie-value')).toBeNull();
  });
});
