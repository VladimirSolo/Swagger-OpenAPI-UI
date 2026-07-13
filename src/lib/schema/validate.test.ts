import { describe, expect, it } from 'vitest';
import { validateSchema } from './validate';

const validOpenApi = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Test API', version: '1.0.0' },
  paths: {
    '/ping': {
      get: {
        responses: { '200': { description: 'ok' } },
      },
    },
  },
});

describe('validateSchema', () => {
  it('accepts a valid OpenAPI document', async () => {
    const result = await validateSchema(validOpenApi, 'json');

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.document.info.title).toBe('Test API');
    }
  });

  it('accepts a valid OpenAPI document in YAML', async () => {
    const yaml = [
      'openapi: 3.0.0',
      'info:',
      '  title: Test API',
      '  version: 1.0.0',
      'paths:',
      '  /ping:',
      '    get:',
      '      responses:',
      "        '200':",
      '          description: ok',
      '',
    ].join('\n');

    const result = await validateSchema(yaml, 'yaml');

    expect(result.valid).toBe(true);
  });

  it('rejects malformed JSON', async () => {
    const result = await validateSchema('{not valid json', 'json');

    expect(result.valid).toBe(false);
  });

  it('rejects a syntactically valid but incomplete OpenAPI document with a friendly message', async () => {
    const result = await validateSchema(JSON.stringify({ openapi: '3.0.0' }), 'json');

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).not.toContain('[object Object]');
      expect(result.error).toContain("'info'");
    }
  });

  it('rejects a non-object schema', async () => {
    const result = await validateSchema('"just a string"', 'json');

    expect(result.valid).toBe(false);
  });
});
