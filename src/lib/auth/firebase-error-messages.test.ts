import { describe, expect, it } from 'vitest';
import { getFirebaseAuthErrorKey } from './firebase-error-messages';

describe('getFirebaseAuthErrorKey', () => {
  it.each([
    ['auth/invalid-credential', 'invalidCredentials'],
    ['auth/wrong-password', 'invalidCredentials'],
    ['auth/user-not-found', 'invalidCredentials'],
    ['auth/email-already-in-use', 'emailInUse'],
    ['auth/invalid-email', 'email'],
    ['auth/weak-password', 'passwordLength'],
    ['auth/too-many-requests', 'tooManyRequests'],
    ['auth/network-request-failed', 'network'],
  ])('maps %s to %s', (code, key) => {
    expect(getFirebaseAuthErrorKey(code)).toBe(key);
  });

  it('falls back to "generic" for unknown codes', () => {
    expect(getFirebaseAuthErrorKey('auth/something-unexpected')).toBe('generic');
    expect(getFirebaseAuthErrorKey('')).toBe('generic');
  });
});
