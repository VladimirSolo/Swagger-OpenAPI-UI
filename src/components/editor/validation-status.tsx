'use client';

import { useTranslations } from 'next-intl';
import { Alert, Flex, Spin, Typography } from 'antd';
import { useSchema } from '@/contexts/schema-context';

export function ValidationStatus() {
  const t = useTranslations('Editor');
  const { rawText, document, error, isValidating } = useSchema();

  if (!rawText.trim()) {
    return (
      <Typography.Text type="secondary" className="text-sm!">
        {t('placeholder')}
      </Typography.Text>
    );
  }

  if (isValidating) {
    return (
      <Flex align="center" gap={8}>
        <Spin size="small" />
        <Typography.Text type="secondary">{t('validating')}</Typography.Text>
      </Flex>
    );
  }

  if (error) {
    return <Alert type="error" showIcon title={error} />;
  }

  if (document) {
    return <Alert type="success" showIcon title={t('valid')} />;
  }

  return null;
}
