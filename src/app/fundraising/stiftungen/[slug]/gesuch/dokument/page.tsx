import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { getFoundationBySlug, generateGesuchParams } from '@/lib/domain/foundation-helpers';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import AnschreibenSection from '@/components/gesuch/AnschreibenSection';
import ProjektbeschriebSection from '@/components/gesuch/ProjektbeschriebSection';
import BudgetSection from '@/components/gesuch/BudgetSection';
import KurzportraitSection from '@/components/gesuch/KurzportraitSection';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generateGesuchParams();
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

export default async function GesuchDokumentPage({ params }: Props) {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const dok = composeGesuchDokument(foundation);

  if (!dok.ready) {
    return (
      <div className="gesuch-dokument mx-auto max-w-3xl py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-grey-dark">
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
        oder laden Sie direkt das PDF herunter.
        <div className="mt-2 flex justify-center gap-4">
          <a
            href={`/api/pdf/gesuch/${slug}`}
            download
            className="font-semibold text-primary hover:underline"
          >
            PDF herunterladen
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
