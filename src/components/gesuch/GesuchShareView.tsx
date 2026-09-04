/**
 * GesuchShareView — Read-only layout for shareable foundation landing page
 *
 * Designed for foundation program officers, not internal users.
 * No toolbar, no edit controls, no pipeline, no internal badges.
 *
 * Uses the same section components as the interactive gesuch page.
 */

import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';
import {
  GesuchHeroSection,
  GesuchWhySection,
  GesuchHowSection,
  GesuchProjectsSection,
  GesuchEvidenceSection,
  GesuchContactSection,
} from '@/components/gesuch/sections';

interface GesuchShareViewProps {
  gesuch: ComposedGesuch;
  foundationBridge: string;
  trackRecord: {
    headline: string;
    text: string;
    [key: string]: unknown;
  };
  why: ComposedGesuch['story']['why'] | undefined;
  primaryColor: string;
}

export default function GesuchShareView({
  gesuch,
  foundationBridge,
  trackRecord,
  why,
  primaryColor,
}: GesuchShareViewProps) {
  const heroDescription = gesuch.foundation.purposeSummary
    ? extractPurposeCore(gesuch.foundation.purposeSummary)
    : '';

  return (
    <div>
      <GesuchHeroSection
        orgName={gesuch.tenant.name}
        subtitle={`Partnerschaftsvorschlag von ${gesuch.tenant.name}`}
        foundationName={gesuch.foundation.name}
        description={heroDescription}
        foundationBridge={foundationBridge}
        themes={gesuch.themes.all}
        primaryColor={primaryColor}
      />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 md:px-0">
        {why && (
          <GesuchWhySection why={why} secondaryThemeRelevance={gesuch.secondaryThemeRelevance} />
        )}

        <GesuchHowSection
          trackRecord={trackRecord as Parameters<typeof GesuchHowSection>[0]['trackRecord']}
          competencies={gesuch.story.how.competencies}
        />

        <GesuchProjectsSection projects={gesuch.story.projects} />
        <GesuchEvidenceSection evidence={gesuch.story.evidence} />

        <GesuchContactSection
          orgName={gesuch.tenant.name}
          foundationName={gesuch.foundation.name}
          organization={gesuch.organization}
        />

        {/* Viewer-facing footer note */}
        <div className="border-t border-border-default pt-6 text-center">
          <p className="text-sm text-text-muted">
            Diese Seite wurde von {gesuch.tenant.name} erstellt und ist ausschliesslich für{' '}
            {gesuch.foundation.name} bestimmt.
          </p>
          <a
            href={gesuch.tenant.website}
            className="mt-1 block text-sm text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {gesuch.tenant.website}
          </a>
        </div>
      </div>
    </div>
  );
}
