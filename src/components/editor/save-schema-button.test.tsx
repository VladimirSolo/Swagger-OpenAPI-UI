import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useAuth } from '@/contexts/auth-context';
import { useSchema } from '@/contexts/schema-context';
import { SaveSchemaButton } from './save-schema-button';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));
vi.mock('@/contexts/schema-context', () => ({ useSchema: vi.fn() }));

function renderButton() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SaveSchemaButton />
    </NextIntlClientProvider>,
  );
}

describe('SaveSchemaButton', () => {
  beforeEach(() => {
    vi.mocked(useSchema).mockReturnValue({
      rawText: '{}',
      format: 'json',
      document: {} as never,
    } as never);
    global.fetch = vi.fn();
  });

  it('renders nothing when the user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn() });

    const { container } = renderButton();
    expect(container).toBeEmptyDOMElement();
  });

  it('is disabled when there is no valid document', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'u1' } as never,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(useSchema).mockReturnValue({ rawText: '', format: null, document: null } as never);

    renderButton();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('shows a success toast when saving succeeds', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'u1' } as never,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 200 }));

    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(global.fetch).toHaveBeenCalledWith('/api/schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '{}', format: 'json' }),
    });
    await waitFor(() => expect(screen.getByText('Schema saved')).toBeInTheDocument());
  });

  it('shows an error toast when saving fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'u1' } as never,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 500 }));

    renderButton();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByText('Failed to save schema')).toBeInTheDocument());
  });
});
