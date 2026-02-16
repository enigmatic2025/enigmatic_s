import { getRequestConfig } from 'next-intl/server';
import { routing } from '../navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate against the single source of truth in navigation.ts
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale;
    }

    try {
        const messages = (await import(`../messages/${locale}.json`)).default;
        return {
            locale,
            messages
        };
    } catch {
        return {
            locale: routing.defaultLocale,
            messages: (await import(`../messages/en.json`)).default
        };
    }
});
