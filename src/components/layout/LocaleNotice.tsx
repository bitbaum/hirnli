'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

/** Routes whose content is fully localized — no notice needed there */
const LOCALIZED_ROUTES = ['/plattform'];

/**
 * Shown when the UI locale ≠ German on pages whose CONTENT is still
 * German-only (tenant content, Tier 3 in the i18n plan). Honest signal
 * instead of a half-translated page.
 */
export function LocaleNotice() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common');

  if (locale === 'de') return null;
  if (LOCALIZED_ROUTES.some((r) => pathname.startsWith(r))) return null;

  return (
    <div className="border-b border-border-subtle bg-surface-raised px-4 py-2 text-center text-xs text-text-secondary">
      {t('contentNotice')}
    </div>
  );
}
