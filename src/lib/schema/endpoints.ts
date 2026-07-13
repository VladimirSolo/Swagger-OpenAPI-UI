import type { OpenAPI } from 'openapi-types';

export type Endpoint = {
  method: string;
  path: string;
};

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

export function extractEndpoints(document: OpenAPI.Document): Endpoint[] {
  const endpoints: Endpoint[] = [];
  const paths =
    (document as { paths?: Record<string, Record<string, unknown> | undefined> }).paths ?? {};

  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      if (method in pathItem) {
        endpoints.push({ method, path });
      }
    }
  }

  return endpoints;
}
