import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useSchema } from '@/contexts/schema-context';
import { FormatToggle } from './format-toggle';

vi.mock('@/contexts/schema-context', () => ({
  useSchema: vi.fn(),
}));

function renderToggle() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormatToggle />
    </NextIntlClientProvider>,
  );
}

describe('FormatToggle', () => {
  beforeEach(() => {
    vi.mocked(useSchema).mockReset();
  });

  it('is disabled and shows nothing meaningful when the format is undetected', () => {
    vi.mocked(useSchema).mockReturnValue({ format: null, toggleFormat: vi.fn() } as never);

    renderToggle();

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('offers to switch to YAML when the current format is JSON', async () => {
    const toggleFormat = vi.fn();
    vi.mocked(useSchema).mockReturnValue({ format: 'json', toggleFormat } as never);

    renderToggle();

    const button = screen.getByRole('button', { name: 'Switch to YAML' });
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(toggleFormat).toHaveBeenCalled();
  });

  it('offers to switch to JSON when the current format is YAML', () => {
    vi.mocked(useSchema).mockReturnValue({ format: 'yaml', toggleFormat: vi.fn() } as never);

    renderToggle();

    expect(screen.getByRole('button', { name: 'Switch to JSON' })).toBeInTheDocument();
  });
});
