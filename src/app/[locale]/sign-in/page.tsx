'use client';

import { useTranslations } from 'next-intl';
import { Flex, Typography } from 'antd';

export default function SignInPage() {
  const t = useTranslations('SignIn');

  return (
    <Flex vertical justify="center" flex={1} className="mx-auto w-full max-w-md px-6 py-16">
      <Typography.Title level={1} className="text-2xl!">
        {t('title')}
      </Typography.Title>
    </Flex>
  );
}
