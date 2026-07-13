import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { HistoryDetail, type SerializedHistoryDetail } from './history-detail';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: React.ComponentProps<'a'>) => <a href={String(href)}>{children}</a>,
}));

const baseEntry: SerializedHistoryDetail = {
  id: 'e1',
  method: 'GET',
  url: 'https://api.example.com/todos/1',
  status: 200,
  durationMs: 42,
  requestSize: 0,
  responseSize: 128,
  error: null,
  timestamp: '2026-01-01T00:00:00.000Z',
};

function renderDetail(entry: SerializedHistoryDetail) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <HistoryDetail entry={entry} />
    </NextIntlClientProvider>,
  );
}

describe('HistoryDetail', () => {
  it('renders all analytics fields for a successful request', () => {
    renderDetail(baseEntry);

    expect(screen.getByText('Request details')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Back to History' })).toHaveAttribute(
      'href',
      '/history',
    );
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/todos/1')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('42 ms')).toBeInTheDocument();
    expect(screen.getByText('0 B')).toBeInTheDocument();
    expect(screen.getByText('128 B')).toBeInTheDocument();
  });

  it('shows "No response" for a null status and omits the error row', () => {
    renderDetail({ ...baseEntry, status: null });

    expect(screen.getByText('No response')).toBeInTheDocument();
    expect(screen.queryByText('Error details')).not.toBeInTheDocument();
  });

  it('shows the error details row when the request failed', () => {
    renderDetail({ ...baseEntry, status: null, error: 'Connection refused' });

    expect(screen.getByText('Connection refused')).toBeInTheDocument();
  });
});
