/**
 * Locale configuration — SSOT for the product's languages.
 *
 * Strategy: cookie-based locale (no URL prefixes yet). The tenant site's
 * canonical URLs stay unchanged; the locale is a presentation preference
 * persisted in a cookie. URL-prefixed locales (/de /fr /en) become worth
 * their migration cost only when non-German SEO for tenant sites matters —
 * see docs/HIRNLI-REPLATFORM-PLAN.md §4.
 */

export const LOCALES = ['de', 'fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'de';

/** Cookie the LanguageToggle writes and i18n/request.ts reads */
export const LOCALE_COOKIE = 'locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  de: 'Deutsch',
  fr: 'Français',
  en: 'English',
};

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}
