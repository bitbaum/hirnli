import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import PlatformPageView from '@/components/platform/PlatformPageView';
import { PLATFORM_CONTENT, type PlatformLocale } from '@/lib/config/platform-content';
import { getAllFoundations } from '@/lib/db/foundations-repo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as PlatformLocale;
  const meta = PLATFORM_CONTENT[locale].meta;
  return { title: meta.title, description: meta.description, openGraph: { title: meta.title, description: meta.description } };
}

export default async function PlattformPage() {
  const [locale, foundations] = await Promise.all([
    getLocale() as Promise<PlatformLocale>,
    getAllFoundations(),
  ]);
  return <PlatformPageView locale={locale} foundations={foundations} />;
}
