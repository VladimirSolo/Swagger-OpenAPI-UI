import { describe, expect, it } from 'vitest';
import { convertFormat } from './convert';

describe('convertFormat', () => {
  it('converts JSON to YAML without losing data', () => {
    const json = JSON.stringify({ openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } });
    const yaml = convertFormat(json, 'json', 'yaml');

    expect(yaml).toContain('openapi: 3.0.0');
    expect(yaml).toContain('title: Test');
  });

  it('converts YAML to JSON without losing data', () => {
    const yaml = 'openapi: 3.0.0\ninfo:\n  title: Test\n  version: 1.0.0\n';
    const json = convertFormat(yaml, 'yaml', 'json');
    const parsed = JSON.parse(json);

    expect(parsed).toEqual({ openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' } });
  });

  it('round-trips JSON -> YAML -> JSON with the same data', () => {
    const original = { a: 1, b: ['x', 'y'], c: { nested: true, value: null } };
    const json = JSON.stringify(original);
    const yaml = convertFormat(json, 'json', 'yaml');
    const backToJson = convertFormat(yaml, 'yaml', 'json');

    expect(JSON.parse(backToJson)).toEqual(original);
  });

  it('returns the input unchanged when from and to are the same', () => {
    const json = '{"a":1}';
    expect(convertFormat(json, 'json', 'json')).toBe(json);
  });
});
