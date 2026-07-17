'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/i18n/config';
import { setLocaleCookie } from '@/i18n/set-locale';

/**
 * Language switcher — same interaction weight as ThemeToggle, sits beside it.
 * Globe button → popover with the three locales. Cookie-persisted; the page
 * re-renders in place via router.refresh() (no URL change by design — see
 * i18n/config.ts).
 */
export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const select = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => router.refresh());
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-text-tertiary transition-colors hover:bg-surface-raised hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={t('language')}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t('language')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="text-xs font-semibold uppercase">{locale}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language')}
          className="absolute right-0 top-11 z-modal w-40 overflow-hidden rounded-lg border border-border-default bg-surface-base py-1 shadow-panel"
        >
          {LOCALES.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                onClick={() => select(l)}
                className={`flex min-h-11 w-full items-center justify-between px-3 text-sm transition-colors hover:bg-surface-raised ${
                  l === locale ? 'font-semibold text-text-primary' : 'text-text-secondary'
                }`}
              >
                {LOCALE_LABELS[l]}
                {l === locale && <span aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
