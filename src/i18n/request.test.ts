import { describe, expect, it, vi } from 'vitest';
import enMessages from './locales/en.json';
import ruMessages from './locales/ru.json';

vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}));

const getRequestConfigFn = (await import('./request')).default;

describe('i18n request config', () => {
  it('uses the requested locale when it is supported', async () => {
    const config = await getRequestConfigFn({
      requestLocale: Promise.resolve('ru'),
    } as never);

    expect(config.locale).toBe('ru');
    expect(config.messages).toEqual(ruMessages);
  });

  it('falls back to the default locale when the requested one is unsupported', async () => {
    const config = await getRequestConfigFn({
      requestLocale: Promise.resolve('fr'),
    } as never);

    expect(config.locale).toBe('en');
    expect(config.messages).toEqual(enMessages);
  });

  it('falls back to the default locale when no locale is requested', async () => {
    const config = await getRequestConfigFn({
      requestLocale: Promise.resolve(undefined),
    } as never);

    expect(config.locale).toBe('en');
  });
});
