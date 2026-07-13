'use client';

import Editor from '@monaco-editor/react';
import { useTranslations } from 'next-intl';
import { Flex, Spin } from 'antd';
import { useSchema } from '@/contexts/schema-context';

const MONACO_LANGUAGE: Record<'json' | 'yaml', string> = {
  json: 'json',
  yaml: 'yaml',
};

export function SchemaEditor() {
  const t = useTranslations('Editor');
  const { rawText, format, setRawText } = useSchema();

  return (
    <Flex vertical flex={1} className="min-h-[320px]">
      <Editor
        height="100%"
        language={format ? MONACO_LANGUAGE[format] : 'plaintext'}
        value={rawText}
        onChange={(value) => setRawText(value ?? '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          ariaLabel: t('ariaLabel'),
        }}
        loading={
          <Flex align="center" justify="center" flex={1}>
            <Spin />
          </Flex>
        }
      />
    </Flex>
  );
}
