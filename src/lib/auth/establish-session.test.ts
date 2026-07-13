import { beforeEach, describe, expect, it, vi } from 'vitest';
import { establishSession } from './establish-session';

describe('establishSession', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('posts the id token to the session endpoint', async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 200 }));

    await establishSession('token-123');

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'token-123' }),
    });
  });

  it('throws when the server rejects the token', async () => {
    vi.mocked(global.fetch).mockResolvedValue(new Response(null, { status: 401 }));

    await expect(establishSession('bad-token')).rejects.toThrow('Failed to establish session');
  });
});
