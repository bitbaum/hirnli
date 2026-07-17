import { LOCALE_COOKIE, type Locale } from './config';

/**
 * Persist the locale preference (1 year, whole site, SameSite=Lax — a
 * preference, not a credential). Client-side only; callers refresh the
 * router afterwards so server components re-render in the new locale.
 */
export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}
