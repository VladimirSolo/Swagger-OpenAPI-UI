'use client';

import { useTranslations } from 'next-intl';
import { Flex, Typography } from 'antd';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <Flex component="footer" className="border-t border-zinc-200 py-6 dark:border-zinc-800">
      <Flex align="center" justify="space-between" flex={1} className="mx-auto! max-w-6xl px-6">
        <Typography.Text type="secondary" className="text-sm!">
          &copy; {new Date().getFullYear()} Swagger/OpenAPI UI. {t('rights')}
        </Typography.Text>
        <Link href="/about">
          <Typography.Text type="secondary" className="text-sm! hover:underline">
            {t('about')}
          </Typography.Text>
        </Link>
      </Flex>
    </Flex>
  );
}
