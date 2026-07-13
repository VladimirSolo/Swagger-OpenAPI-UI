'use client';

import { useSyncExternalStore } from 'react';

export type SplitOrientation = 'horizontal' | 'vertical';

const QUERY = '(min-aspect-ratio: 1/1)';

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot(): SplitOrientation {
  return window.matchMedia(QUERY).matches ? 'horizontal' : 'vertical';
}

function getServerSnapshot(): SplitOrientation {
  return 'horizontal';
}

export function useSplitOrientation(): SplitOrientation {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
