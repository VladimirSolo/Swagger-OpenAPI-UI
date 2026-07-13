'use client';

import { useTranslations } from 'next-intl';
import { Flex, Tag, Typography } from 'antd';
import { useSchema } from '@/contexts/schema-context';
import { extractEndpoints } from '@/lib/schema/endpoints';

const METHOD_COLORS: Record<string, string> = {
  get: 'blue',
  post: 'green',
  put: 'orange',
  patch: 'orange',
  delete: 'red',
  options: 'purple',
  head: 'default',
  trace: 'default',
};

export function EndpointList() {
  const t = useTranslations('Viewer');
  const { document } = useSchema();

  if (!document) {
    return (
      <Typography.Text type="secondary" className="text-sm!">
        {t('empty')}
      </Typography.Text>
    );
  }

  const endpoints = extractEndpoints(document);

  return (
    <Flex vertical flex={1} gap={4} className="min-h-0 overflow-auto">
      <Typography.Title level={4} className="mb-2!">
        {t('title')}
      </Typography.Title>
      {endpoints.map((endpoint) => (
        <Flex
          key={`${endpoint.method}-${endpoint.path}`}
          align="center"
          gap={8}
          className="border-b border-zinc-200 py-2 dark:border-zinc-800"
        >
          <Tag color={METHOD_COLORS[endpoint.method] ?? 'default'}>
            {endpoint.method.toUpperCase()}
          </Tag>
          <Typography.Text code>{endpoint.path}</Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
}
