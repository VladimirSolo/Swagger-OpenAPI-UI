'use client';

import { useTranslations } from 'next-intl';
import { Descriptions, Flex, Tag, Typography } from 'antd';
import { Link } from '@/i18n/navigation';

export type SerializedHistoryDetail = {
  id: string;
  method: string;
  url: string;
  status: number | null;
  durationMs: number;
  requestSize: number;
  responseSize: number;
  error: string | null;
  timestamp: string;
};

export function HistoryDetail({ entry }: { entry: SerializedHistoryDetail }) {
  const t = useTranslations('History');

  return (
    <Flex vertical gap={16} className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link href="/history">
        <Typography.Text className="text-blue-600! dark:text-blue-400!">
          {t('backLink')}
        </Typography.Text>
      </Link>
      <Typography.Title level={1} className="text-2xl!">
        {t('detailTitle')}
      </Typography.Title>

      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label={t('fieldMethod')}>
          <Tag color="blue">{entry.method}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('fieldUrl')}>
          <Typography.Text code>{entry.url}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={t('fieldStatus')}>
          {entry.status ? (
            <Tag color={entry.status < 400 ? 'green' : 'red'}>{entry.status}</Tag>
          ) : (
            <Tag color="red">{t('noResponse')}</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('fieldDuration')}>{entry.durationMs} ms</Descriptions.Item>
        <Descriptions.Item label={t('fieldTimestamp')}>
          {new Date(entry.timestamp).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label={t('fieldRequestSize')}>{entry.requestSize} B</Descriptions.Item>
        <Descriptions.Item label={t('fieldResponseSize')}>{entry.responseSize} B</Descriptions.Item>
        {entry.error && (
          <Descriptions.Item label={t('fieldError')}>
            <Typography.Text type="danger">{entry.error}</Typography.Text>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Flex>
  );
}
