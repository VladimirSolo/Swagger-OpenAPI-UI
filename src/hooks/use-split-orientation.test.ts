import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSplitOrientation } from './use-split-orientation';

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

describe('useSplitOrientation', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns horizontal when the viewport is wider than tall', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useSplitOrientation());
    expect(result.current).toBe('horizontal');
  });

  it('returns vertical when the viewport is taller than wide', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useSplitOrientation());
    expect(result.current).toBe('vertical');
  });

  it('updates when the media query match changes', () => {
    const media = mockMatchMedia(true);
    const { result } = renderHook(() => useSplitOrientation());
    expect(result.current).toBe('horizontal');

    act(() => media.setMatches(false));
    expect(result.current).toBe('vertical');
  });
});
