import { describe, expect, it } from 'vitest';
import { detectFormat } from './format';

describe('detectFormat', () => {
  it('detects JSON', () => {
    expect(detectFormat('{"a": 1}')).toBe('json');
    expect(detectFormat('[1, 2, 3]')).toBe('json');
  });

  it('detects YAML', () => {
    expect(detectFormat('a: 1\nb: 2\n')).toBe('yaml');
    expect(detectFormat('- one\n- two\n')).toBe('yaml');
  });

  it('returns null for empty input', () => {
    expect(detectFormat('')).toBeNull();
    expect(detectFormat('   ')).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(detectFormat('{not valid: [')).toBeNull();
  });

  it('returns null for a plain scalar (not an object)', () => {
    expect(detectFormat('just some text')).toBeNull();
  });
});
