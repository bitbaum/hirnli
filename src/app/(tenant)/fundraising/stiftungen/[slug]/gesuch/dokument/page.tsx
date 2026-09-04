import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTenant } from '@/lib/tenant/resolve';
import { getFoundationBySlug } from '@/lib/db/foundations-repo';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import { loadGesuchOverrides, applyGesuchOverrides } from '@/lib/domain/apply-overrides';
import { isSchwerpunktId } from '@/lib/config/schwerpunkte';
import {
  AnschreibenSection,
  ProjektbeschriebSection,
  BudgetSection,
  KurzportraitSection,
} from '@/components/gesuch/sections';
import { PrintTipBanner } from '@/components/gesuch/GesuchDocumentBanners';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ schwerpunkt?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant();
  const { slug } = await params;
  const foundation = await getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: `Fördergesuch — ${tenant.name} an ${foundation.name}`,
    description: `Formelles Fördergesuch von ${tenant.name} an ${foundation.name}`,
  };
}

export default async function GesuchDokumentPage({ params, searchParams }: Props) {
  const tenant = await getTenant();
  const { slug } = await params;
  const { schwerpunkt: schwerpunktParam } = await searchParams;
  const foundation = await getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const schwerpunktId =
    schwerpunktParam && isSchwerpunktId(schwerpunktParam) ? schwerpunktParam : undefined;

  const baseDok = composeGesuchDokument(tenant, foundation, schwerpunktId);
  const overrides = await loadGesuchOverrides(slug, schwerpunktId ?? 'auto');
  const dok = applyGesuchOverrides(baseDok, overrides);

  if (!dok.ready) {
    return (
      <div className="gesuch-dokument mx-auto max-w-3xl py-12 text-center">
        <h1 className="mb-4 heading-section">Gesuch-Dokument für {dok.foundation.name}</h1>
        <p className="mb-6 text-text-secondary">{dok.readyReason}</p>
        <Link
          href={`/fundraising/stiftungen/${slug}`}
          className="text-sm text-primary hover:underline"
        >
          Zurück zur Stiftungsseite
        </Link>
      </div>
    );
  }

  return (
    <div className="gesuch-dokument mx-auto max-w-3xl">
      {/* Print instructions bar */}
      <PrintTipBanner className="mb-8 print:hidden" suffix=", oder öffnen Sie das PDF direkt.">
        <a
          href={`/api/pdf/gesuch/${slug}${schwerpunktId ? `?schwerpunkt=${schwerpunktId}` : ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          PDF öffnen
        </a>
        <Link
          href={`/fundraising/stiftungen/${slug}/gesuch`}
          className="text-primary hover:underline"
        >
          Interaktive Seite
        </Link>
        <Link href={`/fundraising/stiftungen/${slug}`} className="text-primary hover:underline">
          Stiftungsdetail
        </Link>
      </PrintTipBanner>

      <AnschreibenSection dok={dok} />
      <ProjektbeschriebSection dok={dok} />
      <BudgetSection dok={dok} />
      <KurzportraitSection dok={dok} />

      {/* Back link — hidden in print */}
      <div className="pb-12 text-center print:hidden">
        <Link
          href={`/fundraising/stiftungen/${slug}/gesuch`}
          className="text-sm text-primary hover:underline"
        >
          &larr; Zurück zur interaktiven Gesuch-Seite
        </Link>
      </div>
    </div>
  );
}
