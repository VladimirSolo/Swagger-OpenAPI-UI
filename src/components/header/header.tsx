'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Flex, Typography } from 'antd';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const t = useTranslations('Header');
  const { user, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <Flex
      component="header"
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'h-14 border-zinc-200 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/90'
          : 'h-20 border-transparent bg-white dark:bg-black'
      }`}
    >
      <Flex
        align="center"
        justify="space-between"
        flex={1}
        className="mx-auto! h-full max-w-6xl px-6"
      >
        <Flex align="center" gap={24}>
          <Link href="/">
            <Typography.Text strong className="text-lg! tracking-tight">
              {t('brand')}
            </Typography.Text>
          </Link>
          <Flex component="nav">
            <Link href="/about">
              <Typography.Text type="secondary" className="text-sm! hover:underline">
                {t('about')}
              </Typography.Text>
            </Link>
          </Flex>
        </Flex>

        <Flex align="center" gap={12}>
          <LanguageSwitcher />

          {!loading &&
            (user ? (
              <>
                <Link href="/history">
                  <Button>{t('history')}</Button>
                </Link>
                <Button type="primary" onClick={handleSignOut}>
                  {t('signOut')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button>{t('signIn')}</Button>
                </Link>
                <Link href="/sign-up">
                  <Button type="primary">{t('signUp')}</Button>
                </Link>
              </>
            ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
