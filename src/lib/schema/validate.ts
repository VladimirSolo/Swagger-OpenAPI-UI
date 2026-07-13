import SwaggerParser from '@apidevtools/swagger-parser';
import { load } from 'js-yaml';
import type { OpenAPI } from 'openapi-types';
import type { SchemaFormat } from './format';

export type ValidationResult =
  { valid: true; document: OpenAPI.Document } | { valid: false; error: string };

export async function validateSchema(
  text: string,
  format: SchemaFormat,
): Promise<ValidationResult> {
  let parsed: unknown;
  try {
    parsed = format === 'json' ? JSON.parse(text) : load(text);
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to parse schema',
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Schema must be a JSON/YAML object' };
  }

  try {
    const document = await SwaggerParser.validate(parsed as OpenAPI.Document);
    return { valid: true, document };
  } catch (error) {
    return { valid: false, error: toFriendlyMessage(error) };
  }
}

function toFriendlyMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Invalid OpenAPI/Swagger schema';

  if (/is not a valid .*API definition/i.test(message)) {
    return "Missing required OpenAPI/Swagger fields, such as 'info' or 'paths'";
  }

  return message;
}
