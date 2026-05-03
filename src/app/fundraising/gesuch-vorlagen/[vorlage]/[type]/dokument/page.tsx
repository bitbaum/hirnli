import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { resolveTypeLabel } from '@/lib/config/foundations';
import { getSchwerpunktTemplate, getSchwerpunktStaticParams } from '@/lib/config/gesuch-templates';
import { SCHWERPUNKTE, type SchwerpunktId } from '@/lib/config/schwerpunkte';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import AnschreibenSection from '@/components/gesuch/AnschreibenSection';
import ProjektbeschriebSection from '@/components/gesuch/ProjektbeschriebSection';
import BudgetSection from '@/components/gesuch/BudgetSection';
import KurzportraitSection from '@/components/gesuch/KurzportraitSection';

interface Props {
  params: Promise<{ vorlage: string; type: string }>;
}

export async function generateStaticParams() {
  return getSchwerpunktStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vorlage: schwerpunkt, type } = await params;
  const sp = SCHWERPUNKTE[schwerpunkt as SchwerpunktId];
  const typeLabel = resolveTypeLabel(type);
  if (!sp || !typeLabel) return { title: 'Vorlage nicht gefunden' };

  return {
    title: `F\u00F6rdergesuch: ${sp.shortLabel} \u00D7 Typ ${typeLabel.short} \u2014 ${ORG_PROFILE.name}`,
    description: `Formelles Gesuch-Dokument \u2014 ${sp.label} f\u00FCr ${typeLabel.long}`,
  };
}

export default async function SchwerpunktGesuchDokumentPage({ params }: Props) {
  const { vorlage: schwerpunkt, type } = await params;
  const foundation = getSchwerpunktTemplate(schwerpunkt, type);

  if (!foundation) {
    notFound();
  }

  const sp = SCHWERPUNKTE[schwerpunkt as SchwerpunktId];
  const typeLabel = resolveTypeLabel(type);
  const dok = composeGesuchDokument(foundation, schwerpunkt as SchwerpunktId);

  const bannerTitle = `VORLAGE \u2014 ${sp.shortLabel} \u00D7 Typ ${typeLabel.short}: ${typeLabel.long}`;

  return (
    <div className="gesuch-dokument mx-auto max-w-3xl">
      {/* VORLAGE banner + print bar */}
      <div className="mb-8 space-y-3 print:hidden">
        <div className="rounded-lg border-2 border-warning bg-warning-bg p-4 text-center">
          <p className="text-sm font-semibold text-warning">
            {bannerTitle}
          </p>
          <p className="mt-1 text-sm text-text-light">
            Schwerpunkt: <strong>{sp.label}</strong> |
            Platzhalterfelder vor dem Versand ersetzen.
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-text-light">
          <strong>Tipp:</strong> Drücken Sie Cmd+P (Mac) oder Ctrl+P (Windows/Linux) für eine saubere A4-PDF-Ausgabe.
          <div className="mt-2 flex justify-center gap-4">
            <Link href={`/fundraising/gesuch-vorlagen/${schwerpunkt}/${type}`} className="text-primary hover:underline">
              Interaktive Seite
            </Link>
            <Link href="/fundraising/gesuch-vorlagen" className="text-primary hover:underline">
              Alle Vorlagen
            </Link>
          </div>
        </div>
      </div>

      <AnschreibenSection dok={dok} />
      <ProjektbeschriebSection dok={dok} />
      <BudgetSection dok={dok} />
      <KurzportraitSection dok={dok} />

      {/* Back link — hidden in print */}
      <div className="pb-12 text-center print:hidden">
        <Link
          href={`/fundraising/gesuch-vorlagen/${schwerpunkt}/${type}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; Zurück zur interaktiven Vorlage
        </Link>
      </div>
    </div>
  );
}
