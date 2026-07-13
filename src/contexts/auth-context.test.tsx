import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';

const { authState, onAuthStateChangedMock, firebaseSignOutMock } = vi.hoisted(() => ({
  authState: { configured: false },
  onAuthStateChangedMock: vi.fn(),
  firebaseSignOutMock: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => onAuthStateChangedMock(...args),
  signOut: (...args: unknown[]) => firebaseSignOutMock(...args),
}));

vi.mock('@/lib/firebase/client', () => ({
  get isFirebaseClientConfigured() {
    return authState.configured;
  },
  getFirebaseAuth: () => ({}),
}));

function TestConsumer() {
  const { user, loading, signOut } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? (user as { uid: string }).uid : 'none'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    authState.configured = false;
    onAuthStateChangedMock.mockReset();
    firebaseSignOutMock.mockReset();
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  });

  it('starts with no user and loading=false when Firebase is not configured', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(onAuthStateChangedMock).not.toHaveBeenCalled();
  });

  it('signOut calls the logout API even when Firebase is not configured', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    screen.getByRole('button', { name: 'Sign out' }).click();

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' }),
    );
    expect(firebaseSignOutMock).not.toHaveBeenCalled();
  });

  it('subscribes to auth state and updates user/loading when Firebase is configured', async () => {
    authState.configured = true;
    let capturedCallback: (user: unknown) => void = () => {};
    onAuthStateChangedMock.mockImplementation((_auth: unknown, cb: (user: unknown) => void) => {
      capturedCallback = cb;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    act(() => capturedCallback({ uid: 'abc123' }));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('abc123'));
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('signOut calls firebaseSignOut before hitting the logout API when configured', async () => {
    authState.configured = true;
    onAuthStateChangedMock.mockImplementation(() => vi.fn());
    firebaseSignOutMock.mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    screen.getByRole('button', { name: 'Sign out' }).click();

    await waitFor(() => expect(firebaseSignOutMock).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  });
});
