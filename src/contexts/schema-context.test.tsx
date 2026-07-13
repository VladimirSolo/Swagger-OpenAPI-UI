import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SchemaProvider, useSchema } from './schema-context';

function TestConsumer() {
  const { rawText, format, document, error, isValidating, setRawText, toggleFormat } = useSchema();

  return (
    <div>
      <textarea aria-label="raw" value={rawText} onChange={(e) => setRawText(e.target.value)} />
      <div data-testid="format">{format ?? 'none'}</div>
      <div data-testid="error">{error ?? 'none'}</div>
      <div data-testid="validating">{String(isValidating)}</div>
      <div data-testid="title">{document?.info?.title ?? 'none'}</div>
      <button onClick={toggleFormat}>toggle</button>
    </div>
  );
}

const validOpenApiJson = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'My API', version: '1.0.0' },
  paths: {
    '/ping': { get: { responses: { '200': { description: 'ok' } } } },
  },
});

describe('SchemaProvider', () => {
  it('starts empty with no error', () => {
    render(
      <SchemaProvider>
        <TestConsumer />
      </SchemaProvider>,
    );

    expect(screen.getByTestId('format')).toHaveTextContent('none');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('detects format and validates a schema typed by the user', async () => {
    const user = userEvent.setup();
    render(
      <SchemaProvider>
        <TestConsumer />
      </SchemaProvider>,
    );

    await user.click(screen.getByLabelText('raw'));
    await user.paste(validOpenApiJson);

    expect(screen.getByTestId('format')).toHaveTextContent('json');

    await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('My API'), {
      timeout: 2000,
    });
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('shows an error for an invalid schema', async () => {
    const user = userEvent.setup();
    render(
      <SchemaProvider>
        <TestConsumer />
      </SchemaProvider>,
    );

    await user.click(screen.getByLabelText('raw'));
    await user.paste('{"openapi": "3.0.0"}');

    await waitFor(() => expect(screen.getByTestId('error')).not.toHaveTextContent('none'), {
      timeout: 2000,
    });
    expect(screen.getByTestId('title')).toHaveTextContent('none');
  });

  it('converts between JSON and YAML via toggleFormat without losing data', async () => {
    const user = userEvent.setup();
    render(
      <SchemaProvider initialText={validOpenApiJson}>
        <TestConsumer />
      </SchemaProvider>,
    );

    expect(screen.getByTestId('format')).toHaveTextContent('json');

    await user.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByTestId('format')).toHaveTextContent('yaml');
    expect((screen.getByLabelText('raw') as HTMLTextAreaElement).value).toContain('title: My API');

    await waitFor(() => expect(screen.getByTestId('title')).toHaveTextContent('My API'), {
      timeout: 2000,
    });
  });
});
