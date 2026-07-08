'use client';

import { useTranslations } from 'next-intl';
import { Flex, Typography } from 'antd';

export default function AboutPage() {
  const t = useTranslations('About');

  return (
    <Flex vertical flex={1} className="mx-auto w-full max-w-3xl px-6 py-16">
      <Typography.Title level={1} className="text-2xl!">
        {t('title')}
      </Typography.Title>
    </Flex>
  );
}
