import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { resolveTypeLabel } from '@/lib/config/foundations';
import { TEMPLATE_TYPES, TEMPLATE_LABELS, getTemplateFoundation } from '@/lib/config/gesuch-templates';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import AnschreibenSection from '@/components/gesuch/AnschreibenSection';
import ProjektbeschriebSection from '@/components/gesuch/ProjektbeschriebSection';
import BudgetSection from '@/components/gesuch/BudgetSection';
import KurzportraitSection from '@/components/gesuch/KurzportraitSection';

interface Props {
  params: Promise<{ vorlage: string }>;
}

export async function generateStaticParams() {
  return TEMPLATE_TYPES.map((type) => ({ vorlage: type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vorlage: type } = await params;
  const typeLabel = resolveTypeLabel(type);
  if (typeLabel) {
    return {
      title: `Fördergesuch-Vorlage Typ ${typeLabel.short} — ${typeLabel.long}`,
      description: `Formelle Gesuch-Vorlage für ${typeLabel.long}`,
    };
  }
  const tplLabel = TEMPLATE_LABELS[type];
  if (tplLabel) {
    return {
      title: `Fördergesuch-Vorlage: ${tplLabel.long} — ${ORG_PROFILE.name}`,
      description: tplLabel.desc,
    };
  }
  return { title: 'Vorlage nicht gefunden' };
}

export default async function GesuchVorlageDokumentPage({ params }: Props) {
  const { vorlage: type } = await params;
  const foundation = getTemplateFoundation(type);

  if (!foundation) {
    notFound();
  }

  const dok = composeGesuchDokument(foundation);
  const typeLabel = resolveTypeLabel(type);
  const tplLabel = TEMPLATE_LABELS[type];
  const bannerTitle = typeLabel
    ? `VORLAGE — Typ ${typeLabel.short}: ${typeLabel.long}`
    : `VORLAGE — ${tplLabel?.long ?? type}`;

  return (
    <div className="gesuch-dokument mx-auto max-w-3xl">
      {/* VORLAGE banner + print bar */}
      <div className="mb-8 space-y-3 print:hidden">
        <div className="rounded-lg border-2 border-warning bg-warning-bg p-4 text-center">
          <p className="text-sm font-semibold text-warning">
            {bannerTitle}
          </p>
          <p className="mt-1 text-sm text-text-light">
            Platzhalterfelder wie <span className="font-mono">[Name der Stiftung]</span> vor dem Versand ersetzen.
          </p>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-text-light">
          <strong>Tipp:</strong> Drücken Sie Cmd+P (Mac) oder Ctrl+P (Windows/Linux) für eine saubere A4-PDF-Ausgabe.
          <div className="mt-2 flex justify-center gap-4">
            <Link href={`/fundraising/gesuch-vorlagen/${type}`} className="text-primary hover:underline">
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
          href={`/fundraising/gesuch-vorlagen/${type}`}
          className="text-sm text-primary hover:underline"
        >
          &larr; Zurück zur interaktiven Vorlage
        </Link>
      </div>
    </div>
  );
}
