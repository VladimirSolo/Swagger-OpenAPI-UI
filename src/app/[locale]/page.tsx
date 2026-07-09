'use client';

import { useTranslations } from 'next-intl';
import { Flex, Typography } from 'antd';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      flex={1}
      className="bg-zinc-50 px-16 py-32 dark:bg-black"
    >
      <Typography.Title level={1} className="max-w-md! text-center!">
        {t('title')}
      </Typography.Title>
    </Flex>
  );
}
