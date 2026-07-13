import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useAuth } from '@/contexts/auth-context';
import { HomeWorkspace } from './home-workspace';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));
vi.mock('@monaco-editor/react', () => ({
  default: ({ value }: { value: string }) => (
    <textarea data-testid="monaco-mock" value={value} readOnly />
  ),
}));
vi.mock('swagger-ui-react', () => ({ default: () => <div data-testid="swagger-ui-mock" /> }));
vi.mock('swagger-ui-react/swagger-ui.css', () => ({}));

function renderWorkspace(initialText: string) {
  vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <HomeWorkspace initialText={initialText} />
    </NextIntlClientProvider>,
  );
}

describe('HomeWorkspace', () => {
  it('wires the initial schema text into the editor', () => {
    renderWorkspace('{"openapi":"3.0.0"}');
    expect(screen.getByTestId('monaco-mock')).toHaveValue('{"openapi":"3.0.0"}');
  });

  it('shows the empty viewer state when there is no valid schema yet', () => {
    renderWorkspace('');
    expect(
      screen.getByText('Paste a valid OpenAPI/Swagger schema to see its endpoints here'),
    ).toBeInTheDocument();
  });
});
