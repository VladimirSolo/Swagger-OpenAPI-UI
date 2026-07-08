import { describe, expect, it } from 'vitest';
import { isProtectedPath } from './protected-paths';

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
