import { load } from 'js-yaml';

export type SchemaFormat = 'json' | 'yaml';

export function detectFormat(text: string): SchemaFormat | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    JSON.parse(trimmed);
    return 'json';
  } catch {}

  try {
    const parsed = load(trimmed);
    if (parsed !== null && typeof parsed === 'object') {
      return 'yaml';
    }
  } catch {}

  return null;
}
