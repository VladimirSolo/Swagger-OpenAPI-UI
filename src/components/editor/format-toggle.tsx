'use client';

import { useTranslations } from 'next-intl';
import { Button } from 'antd';
import { useSchema } from '@/contexts/schema-context';

export function FormatToggle() {
  const t = useTranslations('Editor');
  const { format, toggleFormat } = useSchema();

  return (
    <Button onClick={toggleFormat} disabled={!format}>
      {format === 'json' ? t('switchToYaml') : t('switchToJson')}
    </Button>
  );
}
