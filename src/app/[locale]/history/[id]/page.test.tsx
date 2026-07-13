import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { verifySessionCookie } from '@/lib/auth/session';
import { getHistoryEntry } from '@/lib/history/storage';
import HistoryDetailPage from './page';

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'cookie' }) }),
}));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('@/lib/auth/session', () => ({
  SESSION_COOKIE_NAME: 'session',
  verifySessionCookie: vi.fn(),
}));
vi.mock('@/lib/history/storage', () => ({ getHistoryEntry: vi.fn() }));
vi.mock('@/components/history/history-detail', () => ({
  HistoryDetail: ({ entry }: { entry: { url: string; timestamp: string } }) => (
    <div data-testid="history-detail">
      {entry.url} {entry.timestamp}
    </div>
  ),
}));

describe('History detail page', () => {
  it('calls notFound when there is no session', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue(null);

    await expect(HistoryDetailPage({ params: Promise.resolve({ id: 'e1' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );

    expect(getHistoryEntry).not.toHaveBeenCalled();
  });

  it('calls notFound when the entry does not exist or belongs to another user', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(getHistoryEntry).mockResolvedValue(null);

    await expect(HistoryDetailPage({ params: Promise.resolve({ id: 'missing' }) })).rejects.toThrow(
      'NEXT_NOT_FOUND',
    );

    expect(getHistoryEntry).toHaveBeenCalledWith('u1', 'missing');
  });

  it('renders the entry with a serialized timestamp when found', async () => {
    vi.mocked(verifySessionCookie).mockResolvedValue({ uid: 'u1' } as never);
    vi.mocked(getHistoryEntry).mockResolvedValue({
      id: 'e1',
      method: 'GET',
      url: 'https://api.example.com',
      status: 200,
      durationMs: 10,
      requestSize: 0,
      responseSize: 5,
      error: null,
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
    });

    render(await HistoryDetailPage({ params: Promise.resolve({ id: 'e1' }) }));

    expect(screen.getByTestId('history-detail')).toHaveTextContent(
      'https://api.example.com 2026-01-01T00:00:00.000Z',
    );
  });
});
