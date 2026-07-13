import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useSchema } from '@/contexts/schema-context';
import { SchemaEditor } from './schema-editor';

vi.mock('@/contexts/schema-context', () => ({ useSchema: vi.fn() }));

vi.mock('@monaco-editor/react', () => ({
  default: ({
    value,
    onChange,
    language,
  }: {
    value: string;
    onChange: (value: string | undefined) => void;
    language: string;
  }) => (
    <textarea
      data-testid="monaco-mock"
      data-language={language}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe('SchemaEditor', () => {
  it('renders the editor with the current text and language, and reports changes', async () => {
    const setRawText = vi.fn();
    vi.mocked(useSchema).mockReturnValue({
      rawText: '{"a":1}',
      format: 'json',
      setRawText,
    } as never);

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SchemaEditor />
      </NextIntlClientProvider>,
    );

    const textarea = screen.getByTestId('monaco-mock');
    expect(textarea).toHaveValue('{"a":1}');
    expect(textarea).toHaveAttribute('data-language', 'json');

    await userEvent.type(textarea, 'x');
    expect(setRawText).toHaveBeenCalled();
  });

  it('falls back to plaintext language when the format is undetected', () => {
    vi.mocked(useSchema).mockReturnValue({
      rawText: 'not valid',
      format: null,
      setRawText: vi.fn(),
    } as never);

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <SchemaEditor />
      </NextIntlClientProvider>,
    );

    expect(screen.getByTestId('monaco-mock')).toHaveAttribute('data-language', 'plaintext');
  });
});
