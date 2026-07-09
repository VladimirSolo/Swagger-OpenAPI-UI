import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/contexts/auth-context';
import { Header } from '@/components/header/header';
import { Footer } from '@/components/footer/footer';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Swagger/OpenAPI UI',
  description: 'Swagger/OpenAPI editor, viewer and REST client in one app',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AntdRegistry>
          <NextIntlClientProvider>
            <AuthProvider>
              <Header />
              <main className="flex flex-1 flex-col">{children}</main>
              <Footer />
            </AuthProvider>
          </NextIntlClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
