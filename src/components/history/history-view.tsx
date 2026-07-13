'use client';

import { useTranslations } from 'next-intl';
import { Flex, Tag, Typography } from 'antd';
import { Link } from '@/i18n/navigation';

export type SerializedHistoryEntry = {
  id: string;
  method: string;
  url: string;
  status: number | null;
  timestamp: string;
};

export function HistoryView({ entries }: { entries: SerializedHistoryEntry[] }) {
  const t = useTranslations('History');

  if (entries.length === 0) {
    return (
      <Flex vertical gap={16} className="mx-auto! w-full max-w-3xl px-6 py-16">
        <Typography.Title level={1} className="text-2xl!">
          {t('title')}
        </Typography.Title>
        <Typography.Text type="secondary">{t('empty')}</Typography.Text>
        <Link href="/">
          <Typography.Text className="text-blue-600! dark:text-blue-400!">
            {t('emptyLink')}
          </Typography.Text>
        </Link>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={16} className="mx-auto! w-full max-w-4xl px-6 py-16">
      <Typography.Title level={1} className="text-2xl!">
        {t('title')}
      </Typography.Title>
      <Flex vertical gap={0}>
        {entries.map((entry) => (
          <Link key={entry.id} href={`/history/${entry.id}`}>
            <Flex
              align="center"
              gap={12}
              className="border-b border-zinc-200 py-3 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              <Typography.Text type="secondary" className="w-44! shrink-0! text-xs!">
                {new Date(entry.timestamp).toLocaleString()}
              </Typography.Text>
              <Tag color="blue">{entry.method}</Tag>
              <Typography.Text code className="min-w-0! flex-1! truncate!">
                {entry.url}
              </Typography.Text>
              <Tag color={entry.status && entry.status < 400 ? 'green' : 'red'}>
                {entry.status ?? t('noResponse')}
              </Tag>
            </Flex>
          </Link>
        ))}
      </Flex>
    </Flex>
  );
}
