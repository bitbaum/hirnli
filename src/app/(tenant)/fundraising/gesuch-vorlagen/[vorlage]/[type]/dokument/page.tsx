import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTenant } from '@/lib/tenant/resolve';
import { resolveTypeLabel } from '@/lib/config/foundations';
import { getSchwerpunktTemplate, getSchwerpunktStaticParams } from '@/lib/config/gesuch-templates';
import { SCHWERPUNKTE, isSchwerpunktId } from '@/lib/config/schwerpunkte';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import {
  AnschreibenSection,
  ProjektbeschriebSection,
  BudgetSection,
  KurzportraitSection,
} from '@/components/gesuch/sections';
import { VorlageBanner, PrintTipBanner } from '@/components/gesuch/GesuchDocumentBanners';

interface Props {
  params: Promise<{ vorlage: string; type: string }>;
}

export async function generateStaticParams() {
  return getSchwerpunktStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant();
  const { vorlage: schwerpunkt, type } = await params;
  const sp = isSchwerpunktId(schwerpunkt) ? SCHWERPUNKTE[schwerpunkt] : undefined;
  const typeLabel = resolveTypeLabel(type);
  if (!sp || !typeLabel) return { title: 'Vorlage nicht gefunden' };

  return {
    title: `F\u00F6rdergesuch: ${sp.shortLabel} \u00D7 Typ ${typeLabel.short} \u2014 ${tenant.name}`,
    description: `Formelles Gesuch-Dokument \u2014 ${sp.label} f\u00FCr ${typeLabel.long}`,
  };
}

export default async function SchwerpunktGesuchDokumentPage({ params }: Props) {
  const tenant = await getTenant();
  const { vorlage: schwerpunkt, type } = await params;
  if (!isSchwerpunktId(schwerpunkt)) notFound();
  const foundation = getSchwerpunktTemplate(schwerpunkt, type);
  if (!foundation) notFound();

  const sp = SCHWERPUNKTE[schwerpunkt];
  const typeLabel = resolveTypeLabel(type);
  if (!typeLabel) notFound();
  const dok = composeGesuchDokument(tenant, foundation, schwerpunkt);

  const bannerTitle = `VORLAGE \u2014 ${sp.shortLabel} \u00D7 Typ ${typeLabel.short}: ${typeLabel.long}`;

  return (
    <div className="gesuch-dokument mx-auto max-w-3xl">
      {/* VORLAGE banner + print bar */}
      <div className="mb-8 space-y-3 print:hidden">
        <VorlageBanner title={bannerTitle}>
          Schwerpunkt: <strong>{sp.label}</strong> | Platzhalterfelder vor dem Versand ersetzen.
        </VorlageBanner>
        <PrintTipBanner>
          <Link
            href={`/fundraising/gesuch-vorlagen/${schwerpunkt}/${type}`}
            className="text-primary hover:underline"
          >
            Interaktive Seite
          </Link>
          <Link href="/fundraising/gesuch-vorlagen" className="text-primary hover:underline">
            Alle Vorlagen
          </Link>
        </PrintTipBanner>
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
