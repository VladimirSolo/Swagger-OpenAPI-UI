import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import messages from '@/i18n/locales/en.json';
import { useSchema } from '@/contexts/schema-context';
import { SwaggerViewer } from './swagger-viewer';

vi.mock('@/contexts/schema-context', () => ({ useSchema: vi.fn() }));

vi.mock('swagger-ui-react', () => ({
  default: ({ requestInterceptor }: { requestInterceptor: (req: { url: string }) => unknown }) => {
    const result = requestInterceptor({ url: 'https://api.example.com/todos' });
    return <div data-testid="swagger-ui-mock">{JSON.stringify(result)}</div>;
  },
}));
vi.mock('swagger-ui-react/swagger-ui.css', () => ({}));

function renderViewer() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SwaggerViewer />
    </NextIntlClientProvider>,
  );
}

describe('SwaggerViewer', () => {
  it('shows an empty-state message when there is no valid document', () => {
    vi.mocked(useSchema).mockReturnValue({ document: null } as never);

    renderViewer();

    expect(
      screen.getByText('Paste a valid OpenAPI/Swagger schema to see its endpoints here'),
    ).toBeInTheDocument();
  });

  it('renders SwaggerUI and rewrites request URLs through the proxy', () => {
    vi.mocked(useSchema).mockReturnValue({ document: { openapi: '3.0.0' } } as never);

    renderViewer();

    const mock = screen.getByTestId('swagger-ui-mock');
    expect(mock.textContent).toContain('/api/proxy?target=');
    expect(mock.textContent).toContain(encodeURIComponent('https://api.example.com/todos'));
  });
});
