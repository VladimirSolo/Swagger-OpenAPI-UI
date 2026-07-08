'use client';

import { Select } from 'antd';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      aria-label="Language"
      value={locale}
      size="small"
      onChange={(value) => {
        router.replace(pathname, { locale: value });
      }}
      options={routing.locales.map((availableLocale) => ({
        value: availableLocale,
        label: availableLocale.toUpperCase(),
      }))}
      className="w-20"
    />
  );
}
