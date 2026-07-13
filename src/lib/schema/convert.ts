import { dump, load } from 'js-yaml';
import type { SchemaFormat } from './format';

export function convertFormat(text: string, from: SchemaFormat, to: SchemaFormat): string {
  if (from === to) return text;

  const parsed: unknown = from === 'json' ? JSON.parse(text) : load(text);

  return to === 'json' ? JSON.stringify(parsed, null, 2) : dump(parsed);
}
