import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/logout', () => {
  it('clears the session cookie', async () => {
    const response = await POST();

    expect(await response.json()).toEqual({ success: true });
    const cookie = response.cookies.get('session');
    expect(cookie?.value).toBe('');
    expect(cookie?.maxAge).toBe(0);
  });
});
