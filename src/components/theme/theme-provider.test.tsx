import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePrefersDarkMode } from '@/hooks/use-prefers-dark-mode';
import { ThemeProvider } from './theme-provider';

vi.mock('@/hooks/use-prefers-dark-mode', () => ({ usePrefersDarkMode: vi.fn() }));

describe('ThemeProvider', () => {
  it('renders children under the light algorithm when the system prefers light mode', () => {
    vi.mocked(usePrefersDarkMode).mockReturnValue(false);

    render(
      <ThemeProvider>
        <span data-testid="child">content</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('content');
  });

  it('renders children under the dark algorithm when the system prefers dark mode', () => {
    vi.mocked(usePrefersDarkMode).mockReturnValue(true);

    render(
      <ThemeProvider>
        <span data-testid="child">content</span>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('content');
  });
});
