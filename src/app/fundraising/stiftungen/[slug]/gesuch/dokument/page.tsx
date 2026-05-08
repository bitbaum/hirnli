import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { getFoundationBySlug } from '@/lib/domain/foundation-helpers';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import { loadGesuchOverrides, applyGesuchOverrides } from '@/lib/domain/apply-overrides';
import { isSchwerpunktId } from '@/lib/config/schwerpunkte';
import AnschreibenSection from '@/components/gesuch/AnschreibenSection';
import ProjektbeschriebSection from '@/components/gesuch/ProjektbeschriebSection';
import BudgetSection from '@/components/gesuch/BudgetSection';
import KurzportraitSection from '@/components/gesuch/KurzportraitSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ schwerpunkt?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: `Fördergesuch — ${ORG_PROFILE.name} an ${foundation.name}`,
    description: `Formelles Fördergesuch von ${ORG_PROFILE.name} an ${foundation.name}`,
  };
}

export default async function GesuchDokumentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { schwerpunkt: schwerpunktParam } = await searchParams;
  const foundation = getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const schwerpunktId = schwerpunktParam && isSchwerpunktId(schwerpunktParam)
    ? schwerpunktParam
    : undefined;

  const baseDok = composeGesuchDokument(foundation, schwerpunktId);
  const overrides = await loadGesuchOverrides(slug, schwerpunktId ?? 'auto');
  const dok = applyGesuchOverrides(baseDok, overrides);

  if (!dok.ready) {
    return (
      <div className="gesuch-dokument mx-auto max-w-3xl py-12 text-center">
        <h1 className="mb-4 heading-section">
          Gesuch-Dokument für {dok.foundation.name}
        </h1>
        <p className="mb-6 text-text-light">{dok.readyReason}</p>
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
      <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-text-light print:hidden">
        <strong>Tipp:</strong> Drücken Sie Cmd+P (Mac) oder Ctrl+P (Windows/Linux) für eine saubere A4-PDF-Ausgabe,
        oder öffnen Sie das PDF direkt.
        <div className="mt-2 flex justify-center gap-4">
          <a
            href={`/api/pdf/gesuch/${slug}${schwerpunktId ? `?schwerpunkt=${schwerpunktId}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            PDF öffnen
          </a>
          <Link href={`/fundraising/stiftungen/${slug}/gesuch`} className="text-primary hover:underline">
            Interaktive Seite
          </Link>
          <Link href={`/fundraising/stiftungen/${slug}`} className="text-primary hover:underline">
            Stiftungsdetail
          </Link>
        </div>
      </div>

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
