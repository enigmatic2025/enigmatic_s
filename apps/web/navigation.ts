import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Single source of truth for supported locales
export const locales = ['en', 'vi', 'zh-TW', 'es', 'de', 'ja', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
    locales,
    defaultLocale: 'en',
    localePrefix: 'always'
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
