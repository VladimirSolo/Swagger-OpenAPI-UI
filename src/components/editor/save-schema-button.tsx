'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, message } from 'antd';
import { useAuth } from '@/contexts/auth-context';
import { useSchema } from '@/contexts/schema-context';

export function SaveSchemaButton() {
  const t = useTranslations('Editor');
  const { user } = useAuth();
  const { rawText, format, document } = useSchema();
  const [isSaving, setIsSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  if (!user) return null;

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch('/api/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawText, format }),
      });
      if (!response.ok) throw new Error('Failed to save schema');
      messageApi.success(t('saveSuccess'));
    } catch {
      messageApi.error(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      {contextHolder}
      <Button onClick={handleSave} loading={isSaving} disabled={!document}>
        {t('save')}
      </Button>
    </>
  );
}
