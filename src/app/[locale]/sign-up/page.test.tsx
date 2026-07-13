import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useAuth } from '@/contexts/auth-context';
import { establishSession } from '@/lib/auth/establish-session';
import SignUpPage from './page';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));
vi.mock('@/lib/auth/establish-session', () => ({ establishSession: vi.fn() }));
vi.mock('@/lib/firebase/client', () => ({ getFirebaseAuth: () => ({}) }));
vi.mock('firebase/auth', () => ({ createUserWithEmailAndPassword: vi.fn() }));

const pushMock = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: React.ComponentProps<'a'>) => <a href={String(href)}>{children}</a>,
  useRouter: () => ({ push: pushMock, replace: replaceMock, refresh: refreshMock }),
}));

function renderPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignUpPage />
    </NextIntlClientProvider>,
  );
}

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });
    pushMock.mockClear();
    replaceMock.mockClear();
    refreshMock.mockClear();
    vi.mocked(establishSession).mockReset();
    vi.mocked(createUserWithEmailAndPassword).mockReset();
  });

  it('shows validation errors when submitting a weak password', async () => {
    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      await screen.findByText('Password must be at least 8 characters long'),
    ).toBeInTheDocument();
  });

  it('signs up, establishes a session and redirects home on success', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { getIdToken: () => Promise.resolve('token-abc') },
    } as never);
    vi.mocked(establishSession).mockResolvedValue(undefined);

    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Abc123!@');
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => expect(establishSession).toHaveBeenCalledWith('token-abc'));
    expect(pushMock).toHaveBeenCalledWith('/');
    expect(refreshMock).toHaveBeenCalled();
  });

  it('shows a friendly error toast when the email is already in use', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(
      new FirebaseError('auth/email-already-in-use', 'Email already in use'),
    );

    renderPage();

    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Abc123!@');
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(
      await screen.findByText('An account with this email already exists'),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to home when an authenticated user lands on this page', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'u1' } as never,
      loading: false,
      signOut: vi.fn(),
    });

    renderPage();

    expect(replaceMock).toHaveBeenCalledWith('/');
  });
});
