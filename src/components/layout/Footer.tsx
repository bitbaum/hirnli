import { getTranslations } from 'next-intl/server';
import { BRAND_NAME } from '@/lib/config/nav';
import { ORG_PROFILE } from '@/lib/config/org-profile';

export default async function Footer() {
  const t = await getTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface-raised">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-text-tertiary">
        <p>{BRAND_NAME} &copy; {currentYear} &ndash; {t('tagline', { org: ORG_PROFILE.name })}</p>
        <div className="mt-2 flex justify-center gap-4">
          <a
            href={ORG_PROFILE.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary"
          >
            {ORG_PROFILE.website.replace('https://', '')}
          </a>
        </div>
      </div>
    </footer>
  );
}
