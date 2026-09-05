import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllFoundations, getFoundationBySlug } from '@/lib/db/foundations-repo';
import {
  generateFitNarrative,
  generateThemeAlignments,
  generateApproachSteps,
  getApplicationReadiness,
} from '@/lib/domain/foundation-contextualization';
import { findSimilarFoundations } from '@/lib/domain/foundation-recommendations';
import { hasGesuchPage } from '@/lib/domain/foundation-helpers';
import MobileFoundationActions from '@/components/foundation/MobileFoundationActions';
import FoundationHeader from '@/components/foundation/FoundationHeader';
import FoundationSidebar from '@/components/foundation/FoundationSidebar';
import SimilarFoundations from '@/components/foundation/SimilarFoundations';
import FoundationDetailTabs from './FoundationDetailTabs';
import { getTenant } from '@/lib/tenant/resolve';

// Must be dynamic: the root layout reads the locale cookie (next-intl), so no
// route can be statically prerendered — an SSG attempt here 500s at request
// time with DYNAMIC_SERVER_USAGE. Per-request cost is one cached DB read.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = await getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: foundation.name,
    description: foundation.tagline,
  };
}

export default async function FoundationDetailPage({ params }: Props) {
  const tenant = await getTenant();
  const { slug } = await params;
  const [foundation, allFoundations] = await Promise.all([
    getFoundationBySlug(slug),
    getAllFoundations(),
  ]);

  if (!foundation) {
    notFound();
  }

  // Compute contextualization data (pure functions, no I/O)
  const fitNarrative = generateFitNarrative(tenant, foundation);
  const themeAlignments = generateThemeAlignments(foundation);
  const approachSteps = generateApproachSteps(foundation);
  const readiness = getApplicationReadiness(foundation);
  const similar = findSimilarFoundations(foundation, allFoundations, 5);

  const gesuchReady = hasGesuchPage(foundation);

  return (
    <div>
      <FoundationHeader foundation={foundation} />

      {/* Whose words these are. An applicant reads "they fund youth projects"
          and acts on it, so the difference between the foundation saying so and
          us having researched it is not a footnote. */}
      {foundation.funderConfirmed && (
        <p className="mb-4 rounded-lg border border-border-default bg-surface-raised px-4 py-2 text-sm text-text-secondary">
          Diese Angaben stammen von der Stiftung selbst und wurden von ihr bestätigt.
        </p>
      )}

      {/* Mobile quick actions — visible below lg where sidebar is hidden */}
      <MobileFoundationActions
        foundationId={foundation.slug}
        foundationName={foundation.name}
        gesuchReady={gesuchReady}
        priorityLevel={foundation.priority}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <FoundationDetailTabs
            foundation={foundation}
            fitNarrative={fitNarrative}
            themeAlignments={themeAlignments}
            approachSteps={approachSteps}
            readiness={readiness}
          />
        </div>
        <aside className="space-y-4">
          <FoundationSidebar foundation={foundation} />
          <SimilarFoundations similar={similar} />
        </aside>
      </div>
    </div>
  );
}
