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
  // This page belongs to no tenant, so it reads the register without any
  // tenant's assessments (see getRegistryFoundations) and shows only register
  // facts — priorities and Gesuch counts are a tenant's work, not the product's.
  const [locale, foundations] = await Promise.all([
    getLocale() as Promise<PlatformLocale>,
    getRegistryFoundations(),
  ]);
  return <PlatformPageView locale={locale} foundations={foundations} />;
}
