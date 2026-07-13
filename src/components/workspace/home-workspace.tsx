'use client';

import { Flex } from 'antd';
import { SchemaProvider } from '@/contexts/schema-context';
import { SchemaEditor } from '@/components/editor/schema-editor';
import { FormatToggle } from '@/components/editor/format-toggle';
import { SaveSchemaButton } from '@/components/editor/save-schema-button';
import { ValidationStatus } from '@/components/editor/validation-status';
import { EndpointList } from '@/components/viewer/endpoint-list';
import { SplitLayout } from '@/components/workspace/split-layout';

export function HomeWorkspace({ initialText }: { initialText: string }) {
  return (
    <SchemaProvider initialText={initialText}>
      <SplitLayout
        editor={
          <Flex vertical flex={1} gap={12} className="min-h-0">
            <Flex justify="space-between" align="center">
              <FormatToggle />
              <SaveSchemaButton />
            </Flex>
            <ValidationStatus />
            <SchemaEditor />
          </Flex>
        }
        viewer={<EndpointList />}
      />
    </SchemaProvider>
  );
}
