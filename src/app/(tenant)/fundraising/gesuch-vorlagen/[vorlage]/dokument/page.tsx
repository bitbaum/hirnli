import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTenant } from '@/lib/tenant/resolve';
import { resolveTypeLabel } from '@/lib/config/foundations';
import {
  TEMPLATE_TYPES,
  resolveTemplateLabels,
  resolveTemplateFoundation,
} from '@/lib/config/gesuch-templates';
import { composeGesuchDokument } from '@/lib/domain/gesuch-composer';
import { loadTenantStory } from '@/lib/content/story-engine';
import { loadTenantBudget } from '@/lib/content/budget-engine';
import StoryMissing from '@/components/gesuch/StoryMissing';
import GesuchNotReady from '@/components/gesuch/GesuchNotReady';
import VorlageDokument from '@/components/gesuch/VorlageDokument';

interface Props {
  params: Promise<{ vorlage: string }>;
}

export async function generateStaticParams() {
  return TEMPLATE_TYPES.map((type) => ({ vorlage: type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await getTenant();
  const { vorlage: type } = await params;
  const typeLabel = resolveTypeLabel(type);
  if (typeLabel) {
    return {
      title: `Fördergesuch-Vorlage Typ ${typeLabel.short} — ${typeLabel.long}`,
      description: `Formelle Gesuch-Vorlage für ${typeLabel.long}`,
    };
  }
  const tplLabel = resolveTemplateLabels(tenant)[type];
  if (tplLabel) {
    return {
      title: `Fördergesuch-Vorlage: ${tplLabel.long} — ${tenant.name}`,
      description: tplLabel.desc,
    };
  }
  return { title: 'Vorlage nicht gefunden' };
}

export default async function GesuchVorlageDokumentPage({ params }: Props) {
  const tenant = await getTenant();
  const { vorlage: type } = await params;
  const foundation = resolveTemplateFoundation(type, tenant);

  if (!foundation) {
    notFound();
  }

  const story = await loadTenantStory(tenant);
  const budget = await loadTenantBudget(tenant);
  if (!story) {
    return <StoryMissing tenant={tenant} />;
  }

  const dok = composeGesuchDokument(story, budget, foundation);

  // `ready` is false when the applicant has not written the theme this
  // template argues from, or the funder is too thinly researched. Rendering
  // anyway produced a formal document with a blank argument.
  if (!dok.ready) {
    return (
      <GesuchNotReady
        gesuch={dok}
        tenant={tenant}
        backHref={`/fundraising/gesuch-vorlagen/${type}`}
        backLabel="Zur Vorlage"
      />
    );
  }
  const typeLabel = resolveTypeLabel(type);
  const tplLabel = resolveTemplateLabels(tenant)[type];
  const bannerTitle = typeLabel
    ? `VORLAGE — Typ ${typeLabel.short}: ${typeLabel.long}`
    : `VORLAGE — ${tplLabel?.long ?? type}`;

  return (
    <VorlageDokument
      dok={dok}
      bannerTitle={bannerTitle}
      bannerNote={
        <>
          Platzhalterfelder wie <span className="font-mono">[Name der Stiftung]</span> vor dem
          Versand ersetzen.
        </>
      }
      interaktiveHref={`/fundraising/gesuch-vorlagen/${type}`}
    />
  );
}
