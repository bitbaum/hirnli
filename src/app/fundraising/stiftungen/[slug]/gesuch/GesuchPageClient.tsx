'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId } from '@/lib/schemas/foundation';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import SchwerpunktSelector from '@/components/gesuch/SchwerpunktSelector';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';

interface GesuchPageClientProps {
  slug: string;
  foundationThemes: ThemeId[];
  /** Pre-computed gesuch variants keyed by 'auto' | SchwerpunktId */
  variants: Record<string, ComposedGesuch>;
  primaryColors: Record<string, string>;
}

export default function GesuchPageClient({
  slug,
  foundationThemes,
  variants,
  primaryColors,
}: GesuchPageClientProps) {
  const [activeSchwerpunkt, setActiveSchwerpunkt] = useState<SchwerpunktId | null>(null);

  const variantKey = activeSchwerpunkt ?? 'auto';
  const gesuch = variants[variantKey];
  const primaryColor = primaryColors[variantKey] ?? '#3498DB';

  // If no variant available for this selection, fall back to auto
  const activeGesuch = gesuch ?? variants['auto'];
  const activeColor = gesuch ? primaryColor : primaryColors['auto'] ?? '#3498DB';

  if (!activeGesuch || !activeGesuch.ready) return null;

  return (
    <div className="gesuch-page">
      <GesuchHeroSection
        subtitle="Partnerschaftsvorschlag"
        foundationName={activeGesuch.foundation.name}
        description={activeGesuch.foundation.purposeSummary ?? ''}
        foundationBridge={activeGesuch.foundationBridge}
        themes={activeGesuch.themes.all}
        primaryColor={activeColor}
      />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 md:px-0">
        <SchwerpunktSelector
          active={activeSchwerpunkt}
          foundationThemes={foundationThemes}
          onSelect={setActiveSchwerpunkt}
        />

        {activeGesuch.story.why && (
          <GesuchWhySection
            why={activeGesuch.story.why}
            secondaryThemeRelevance={activeGesuch.secondaryThemeRelevance}
          />
        )}

        <GesuchHowSection
          trackRecord={activeGesuch.story.how.track_record}
          competencies={activeGesuch.story.how.competencies}
        />

        <GesuchProjectsSection projects={activeGesuch.story.projects} />

        <GesuchEvidenceSection evidence={activeGesuch.story.evidence} />

        <GesuchContactSection
          foundationName={activeGesuch.foundation.name}
          organization={activeGesuch.organization}
        />

        {/* Navigation links */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 print:hidden">
          <a
            href={`/api/pdf/gesuch/${slug}`}
            download
            className="rounded-lg bg-grey-dark px-5 py-3 text-sm font-semibold text-white hover:bg-grey-dark/90"
          >
            PDF herunterladen
          </a>
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="py-3 text-sm text-text-muted hover:text-primary hover:underline"
          >
            HTML-Vorschau
          </Link>
          <Link
            href={`/fundraising/stiftungen/${slug}`}
            className="py-3 text-sm text-primary hover:underline"
          >
            &larr; Zurück zur Stiftungsseite
          </Link>
        </div>
      </div>
    </div>
  );
}
