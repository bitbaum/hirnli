import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import PlatformPageView from '@/components/platform/PlatformPageView';
import { PLATFORM_CONTENT, type PlatformLocale } from '@/lib/config/platform-content';
import { getRegistryFoundations } from '@/lib/db/foundations-repo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as PlatformLocale;
  const meta = PLATFORM_CONTENT[locale].meta;
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description },
  };
}

export default async function PlattformPage() {
  // This page belongs to no tenant, but the funnel statistics it renders are
  // not tenant-neutral: computeFunnelStats counts fit-score distribution,
  // themes and research depth alongside registry facts like purpose and
  // contact. So it reads the reference tenant explicitly rather than
  // inheriting one from a default — the same numbers as before, but now it is
  // visible in the code that what this page reports is one customer's work.
  // See getRegistryFoundations.
  const [locale, foundations] = await Promise.all([
    getLocale() as Promise<PlatformLocale>,
    getRegistryFoundations(),
  ]);
  return <PlatformPageView locale={locale} foundations={foundations} />;
}
