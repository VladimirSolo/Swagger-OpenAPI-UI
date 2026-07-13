import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import messages from '@/i18n/locales/en.json';
import AboutPage from './page';

describe('AboutPage', () => {
  it('renders the course, project, technologies, team and resources sections', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <AboutPage />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'About', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'RS School Course' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'rs.school' })).toHaveAttribute(
      'href',
      'https://rs.school/',
    );
    expect(screen.getByRole('heading', { name: 'About the Project' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Technologies Used' })).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByText('Vladimir Solodkov')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /VladimirSolo/ })).toHaveAttribute(
      'href',
      'https://github.com/VladimirSolo',
    );
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute(
      'href',
      'https://github.com/VladimirSolo/Swagger-OpenAPI-UI',
    );
  });
});
