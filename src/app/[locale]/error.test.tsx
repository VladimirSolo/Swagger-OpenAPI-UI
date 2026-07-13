import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import ErrorBoundary from './error';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: React.ComponentProps<'a'>) => <a href={String(href)}>{children}</a>,
}));

describe('ErrorBoundary (app/[locale]/error.tsx)', () => {
  it('shows a friendly message and logs the error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });
    const reset = vi.fn();

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ErrorBoundary error={error} reset={reset} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });

  it('calls reset when clicking "Try again"', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ErrorBoundary error={new Error('boom')} reset={reset} />
      </NextIntlClientProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalled();
  });

  it('links back to the home page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ErrorBoundary error={new Error('boom')} reset={vi.fn()} />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('link', { name: 'Go to home page' })).toHaveAttribute('href', '/');
  });
});
