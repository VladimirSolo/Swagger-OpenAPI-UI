import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useSchema } from '@/contexts/schema-context';
import { ValidationStatus } from './validation-status';

vi.mock('@/contexts/schema-context', () => ({
  useSchema: vi.fn(),
}));

function renderStatus() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ValidationStatus />
    </NextIntlClientProvider>,
  );
}

function mockSchema(overrides: Partial<ReturnType<typeof useSchema>>) {
  vi.mocked(useSchema).mockReturnValue({
    rawText: '',
    format: null,
    document: null,
    error: null,
    isValidating: false,
    setRawText: vi.fn(),
    toggleFormat: vi.fn(),
    ...overrides,
  } as never);
}

describe('ValidationStatus', () => {
  it('shows the placeholder text when there is no input yet', () => {
    mockSchema({ rawText: '' });
    renderStatus();
    expect(
      screen.getByText('Paste or type an OpenAPI/Swagger schema (JSON or YAML) to get started'),
    ).toBeInTheDocument();
  });

  it('shows a validating indicator while validation is in progress', () => {
    mockSchema({ rawText: '{}', isValidating: true });
    renderStatus();
    expect(screen.getByText('Validating…')).toBeInTheDocument();
  });

  it('shows the error message when validation fails', () => {
    mockSchema({ rawText: '{}', error: 'Missing required fields' });
    renderStatus();
    expect(screen.getByText('Missing required fields')).toBeInTheDocument();
  });

  it('shows a success message when the document is valid', () => {
    mockSchema({ rawText: '{}', document: {} as never });
    renderStatus();
    expect(screen.getByText('Schema is valid')).toBeInTheDocument();
  });

  it('renders nothing when there is text but no result yet', () => {
    mockSchema({ rawText: '{}' });
    const { container } = renderStatus();
    expect(container).toBeEmptyDOMElement();
  });
});
