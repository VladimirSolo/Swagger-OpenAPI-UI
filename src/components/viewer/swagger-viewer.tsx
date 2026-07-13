'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useTranslations } from 'next-intl';
import { Typography } from 'antd';
import { useSchema } from '@/contexts/schema-context';

export function SwaggerViewer() {
  const t = useTranslations('Viewer');
  const { document } = useSchema();

  if (!document) {
    return (
      <Typography.Text type="secondary" className="text-sm!">
        {t('empty')}
      </Typography.Text>
    );
  }

  return (
    <div className="swagger-viewer min-h-0 flex-1 overflow-auto">
      <SwaggerUI
        spec={document}
        requestInterceptor={(req: Record<string, unknown>) => {
          req.url = `/api/proxy?target=${encodeURIComponent(String(req.url))}`;
          return req;
        }}
        requestSnippetsEnabled
        docExpansion="list"
      />
    </div>
  );
}
