import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia. antd's Grid/breakpoint observer (used by
// Form and others) calls it unconditionally, so every test needs a default
// stub; tests that care about a specific media query result (e.g. dark mode,
// split orientation) override window.matchMedia themselves.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
