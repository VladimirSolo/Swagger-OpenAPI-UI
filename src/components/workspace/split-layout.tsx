'use client';

import type { ReactNode } from 'react';
import { Flex } from 'antd';
import { useSplitOrientation } from '@/hooks/use-split-orientation';

export function SplitLayout({ editor, viewer }: { editor: ReactNode; viewer: ReactNode }) {
  const orientation = useSplitOrientation();

  return (
    <Flex
      vertical={orientation === 'vertical'}
      flex={1}
      gap={16}
      className="min-h-0 flex-1 p-4"
      data-testid="split-layout"
      data-orientation={orientation}
    >
      <Flex vertical flex={1} className="min-h-0 min-w-0">
        {editor}
      </Flex>
      <Flex vertical flex={1} className="min-h-0 min-w-0">
        {viewer}
      </Flex>
    </Flex>
  );
}
