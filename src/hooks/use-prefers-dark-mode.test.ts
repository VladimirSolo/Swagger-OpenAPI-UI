import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePrefersDarkMode } from './use-prefers-dark-mode';

type Listener = () => void;

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<Listener>();

  const mql = {
    get matches() {
      return matches;
    },
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  };

  window.matchMedia = vi.fn().mockReturnValue(mql);

  return {
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

describe('usePrefersDarkMode', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns false when the system prefers light mode', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(false);
  });

  it('returns true when the system prefers dark mode', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(true);
  });

  it('updates when the system preference changes', () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(false);

    act(() => media.setMatches(true));
    expect(result.current).toBe(true);
  });
});
