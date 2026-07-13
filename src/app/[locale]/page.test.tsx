import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { verifySessionCookie } from '@/lib/auth/session';
import { getSavedSchema } from '@/lib/schema/storage';
import Home from './page';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'cookie' }) }),
}));
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'session',
  verifySessionCookie: vi.fn(),
}));
vi.mock('@/lib/schema/storage', () => ({ getSavedSchema: vi.fn() }));
vi.mock('@/components/workspace/home-workspace', () => ({
  HomeWorkspace: ({ initialText }: { initialText: string }) => (
    <div data-testid="home-workspace">{initialText}</div>
  ),
}));

describe('Home page', () => {
  it('renders with an empty initial text when there is no session', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue(null);

    render(await Home());

    expect(screen.getByTestId('home-workspace')).toHaveTextContent('');
    expect(getSavedSchema).not.toHaveBeenCalled();
  });

  it('renders with the saved schema content for an authenticated user', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(getSavedSchema).mockResolvedValue({ content: '{"a":1}', format: 'json' });

    render(await Home());

    expect(getSavedSchema).toHaveBeenCalledWith('u1');
    expect(screen.getByTestId('home-workspace')).toHaveTextContent('{"a":1}');
  });

  it('renders with an empty initial text when the user has no saved schema', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(getSavedSchema).mockResolvedValue(null);

    render(await Home());

    expect(screen.getByTestId('home-workspace')).toHaveTextContent('');
  });
});
