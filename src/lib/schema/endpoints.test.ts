import { describe, expect, it } from 'vitest';
import { extractEndpoints } from './endpoints';
import type { OpenAPI } from 'openapi-types';

describe('extractEndpoints', () => {
  it('flattens paths into method+path pairs', () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {
        '/pets': {
          get: { responses: {} },
          post: { responses: {} },
        },
        '/pets/{id}': {
          get: { responses: {} },
          delete: { responses: {} },
        },
      },
    } as unknown as OpenAPI.Document;

    const endpoints = extractEndpoints(document);

    expect(endpoints).toEqual(
      expect.arrayContaining([
        { method: 'get', path: '/pets' },
        { method: 'post', path: '/pets' },
        { method: 'get', path: '/pets/{id}' },
        { method: 'delete', path: '/pets/{id}' },
      ]),
    );
    expect(endpoints).toHaveLength(4);
  });

  it('returns an empty array when there are no paths', () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    } as unknown as OpenAPI.Document;

    expect(extractEndpoints(document)).toEqual([]);
  });
});
