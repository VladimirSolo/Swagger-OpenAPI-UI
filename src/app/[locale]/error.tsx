'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Flex, Result } from 'antd';
import { Link } from '@/i18n/navigation';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ErrorPage');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Flex vertical flex={1} align="center" justify="center" className="px-6 py-16">
      <Result
        status="error"
        title={t('title')}
        subTitle={t('description')}
        extra={[
          <Button key="retry" type="primary" onClick={reset}>
            {t('retry')}
          </Button>,
          <Link key="home" href="/">
            <Button>{t('home')}</Button>
          </Link>,
        ]}
      />
    </Flex>
  );
}
