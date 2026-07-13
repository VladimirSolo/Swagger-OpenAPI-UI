import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { HistoryView } from './history-view';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: React.ComponentProps<'a'>) => <a href={String(href)}>{children}</a>,
}));

function renderView(entries: Parameters<typeof HistoryView>[0]['entries']) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <HistoryView entries={entries} />
    </NextIntlClientProvider>,
  );
}

describe('HistoryView', () => {
  it('shows an empty state with a link to the editor when there are no entries', () => {
    renderView([]);

    expect(screen.getByText("You haven't executed any requests yet")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the Editor & Viewer' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('lists entries with method, url and status, linking to the detail page', () => {
    renderView([
      {
        id: 'e1',
        method: 'GET',
        url: 'https://api.example.com/todos/1',
        status: 200,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'e2',
        method: 'POST',
        url: 'https://api.example.com/todos',
        status: 500,
        timestamp: '2026-01-02T00:00:00.000Z',
      },
    ]);

    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/history/e1');
  });

  it('shows "No response" for an entry with a null status', () => {
    renderView([
      {
        id: 'e1',
        method: 'GET',
        url: 'https://api.example.com',
        status: null,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(screen.getByText('No response')).toBeInTheDocument();
  });
});
