import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LocaleLayout from './layout';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));
vi.mock('@ant-design/nextjs-registry', () => ({
  AntdRegistry: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) => locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/contexts/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/theme/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@/components/header/header', () => ({ Header: () => <header data-testid="header" /> }));
vi.mock('@/components/footer/footer', () => ({ Footer: () => <footer data-testid="footer" /> }));

describe('LocaleLayout', () => {
  it('renders the header, children and footer for a supported locale', async () => {
    const jsx = await LocaleLayout({
      children: <div data-testid="page-content">content</div>,
      params: Promise.resolve({ locale: 'en' }),
    });

    render(jsx);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('calls notFound for an unsupported locale', async () => {
    await expect(
      LocaleLayout({
        children: <div />,
        params: Promise.resolve({ locale: 'fr' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});
