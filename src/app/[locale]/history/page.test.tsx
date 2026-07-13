import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { verifySessionCookie } from '@/lib/auth/session';
import { listHistoryEntries } from '@/lib/history/storage';
import HistoryPage from './page';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'cookie' }) }),
}));
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'session',
  verifySessionCookie: vi.fn(),
}));
vi.mock('@/lib/history/storage', () => ({ listHistoryEntries: vi.fn() }));
vi.mock('@/components/history/history-view', () => ({
  HistoryView: ({ entries }: { entries: unknown[] }) => (
    <div data-testid="history-view">{JSON.stringify(entries)}</div>
  ),
}));

describe('History page', () => {
  it('renders an empty list when there is no session', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue(null);

    render(await HistoryPage());

    expect(screen.getByTestId('history-view')).toHaveTextContent('[]');
    expect(listHistoryEntries).not.toHaveBeenCalled();
  });

  it('serializes timestamps to ISO strings for authenticated users', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(listHistoryEntries).mockResolvedValue([
      {
        id: 'e1',
        method: 'GET',
        url: 'https://api.example.com',
        status: 200,
        durationMs: 10,
        requestSize: 0,
        responseSize: 5,
        error: null,
        timestamp: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    render(await HistoryPage());

    expect(listHistoryEntries).toHaveBeenCalledWith('u1');
    expect(screen.getByTestId('history-view')).toHaveTextContent('2026-01-01T00:00:00.000Z');
  });
});
