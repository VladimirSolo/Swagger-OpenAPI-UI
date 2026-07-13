import { describe, expect, it } from 'vitest';
import { isBlockedTarget } from './ssrf-guard';

describe('isBlockedTarget', () => {
  it('allows normal public https/http URLs', () => {
    expect(isBlockedTarget(new URL('https://api.example.com/pets'))).toBe(false);
    expect(isBlockedTarget(new URL('http://api.example.com/pets'))).toBe(false);
  });

  it('blocks localhost and loopback addresses', () => {
    expect(isBlockedTarget(new URL('http://localhost:3000/x'))).toBe(true);
    expect(isBlockedTarget(new URL('http://127.0.0.1/x'))).toBe(true);
    expect(isBlockedTarget(new URL('http://sub.localhost/x'))).toBe(true);
  });

  it('blocks private IPv4 ranges', () => {
    expect(isBlockedTarget(new URL('http://10.0.0.5/x'))).toBe(true);
    expect(isBlockedTarget(new URL('http://192.168.1.1/x'))).toBe(true);
    expect(isBlockedTarget(new URL('http://172.16.0.1/x'))).toBe(true);
    expect(isBlockedTarget(new URL('http://172.31.255.255/x'))).toBe(true);
    expect(isBlockedTarget(new URL('http://172.32.0.1/x'))).toBe(false);
  });

  it('blocks the cloud metadata address', () => {
    expect(isBlockedTarget(new URL('http://169.254.169.254/latest/meta-data'))).toBe(true);
  });

  it('blocks non-http(s) protocols', () => {
    expect(isBlockedTarget(new URL('file:///etc/passwd'))).toBe(true);
    expect(isBlockedTarget(new URL('ftp://example.com/x'))).toBe(true);
  });
});
