import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useAuth } from '@/contexts/auth-context';
import { Header } from './header';

vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: React.ComponentProps<'a'>) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Header />
    </NextIntlClientProvider>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it('shows Sign In and Sign Up for anonymous users', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });

    renderHeader();

    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'History' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign Out' })).not.toBeInTheDocument();
  });

  it('shows History and Sign Out for authenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: '123' } as never,
      loading: false,
      signOut: vi.fn(),
    });

    renderHeader();

    expect(screen.getByRole('link', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign In' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
  });

  it('always shows a link to the About page', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });

    renderHeader();

    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
  });
});
