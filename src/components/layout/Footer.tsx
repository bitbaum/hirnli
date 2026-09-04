import { getTranslations } from 'next-intl/server';
import { BRAND_NAME } from '@/lib/config/nav';
import { getTenant } from '@/lib/tenant/resolve';

export default async function Footer() {
  const t = await getTranslations('footer');
  const currentYear = new Date().getFullYear();
  // Shown on every page of every tenant. It named, and linked to, the first
  // tenant — so one customer's site advertised another customer's domain in
  // its own footer.
  const tenant = await getTenant();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface-raised">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-text-tertiary">
        <p>
          {BRAND_NAME} &copy; {currentYear} &ndash; {t('tagline', { org: tenant.name })}
        </p>
        {tenant.website && (
          <div className="mt-2 flex justify-center gap-4">
            <a
              href={tenant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              {new URL(tenant.website).hostname}
            </a>
          </div>
        )}
      </div>
    </footer>
  );
}
