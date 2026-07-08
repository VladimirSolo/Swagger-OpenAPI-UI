import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import messages from '@/i18n/locales/en.json';
import Home from './page';

describe('Home', () => {
  it('renders the starting point heading', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Home />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
