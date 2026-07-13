import { describe, expect, it } from 'vitest';
import { isGuestOnlyPath, isProtectedPath } from './protected-paths';

describe('isProtectedPath', () => {
  it('matches an exact protected path', () => {
    expect(isProtectedPath('/history')).toBe(true);
  });

  it('matches nested protected paths', () => {
    expect(isProtectedPath('/history/123')).toBe(true);
  });

  it('does not match public paths', () => {
    expect(isProtectedPath('/')).toBe(false);
    expect(isProtectedPath('/about')).toBe(false);
    expect(isProtectedPath('/sign-in')).toBe(false);
  });

  it('does not match paths that merely start with the same prefix', () => {
    expect(isProtectedPath('/history-export')).toBe(false);
  });
});

describe('isGuestOnlyPath', () => {
  it('matches sign-in and sign-up', () => {
    expect(isGuestOnlyPath('/sign-in')).toBe(true);
    expect(isGuestOnlyPath('/sign-up')).toBe(true);
  });

  it('does not match public or protected paths', () => {
    expect(isGuestOnlyPath('/')).toBe(false);
    expect(isGuestOnlyPath('/about')).toBe(false);
    expect(isGuestOnlyPath('/history')).toBe(false);
  });
});
