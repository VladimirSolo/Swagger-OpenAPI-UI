'use client';

import type { ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';
import { usePrefersDarkMode } from '@/hooks/use-prefers-dark-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDark = usePrefersDarkMode();

  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      {children}
    </ConfigProvider>
  );
}
