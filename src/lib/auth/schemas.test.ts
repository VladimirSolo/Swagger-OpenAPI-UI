import { describe, expect, it } from 'vitest';
import { signInSchema, signUpSchema } from './schemas';

describe('signInSchema / signUpSchema', () => {
  it('accepts a valid email and strong password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: 'Abc123!@' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'Abc123!@' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('email');
  });

  it.each([
    ['short1!', 'passwordLength'],
    ['12345678!', 'passwordLetter'],
    ['abcdefgh!', 'passwordDigit'],
    ['abcdefg1', 'passwordSpecial'],
  ])('rejects password %s with message %s', (password, expectedMessage) => {
    const result = signUpSchema.safeParse({ email: 'user@example.com', password });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain(expectedMessage);
  });

  it('accepts unicode letters and digits in the password', () => {
    const result = signUpSchema.safeParse({ email: 'user@example.com', password: 'Пароль123!' });
    expect(result.success).toBe(true);
  });
});
