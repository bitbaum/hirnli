'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId } from '@/lib/schemas/foundation';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';
import { useGesuchOverrides } from '@/hooks/useGesuchOverrides';
import SchwerpunktSelector from '@/components/gesuch/SchwerpunktSelector';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';
import GesuchEditPanel from '@/components/gesuch/GesuchEditPanel';
import GesuchSubmitSection from '@/components/gesuch/GesuchSubmitSection';
import type { SubmissionInfo } from '@/components/gesuch/GesuchSubmitSection';

interface GesuchPageClientProps {
  slug: string;
  foundationThemes: ThemeId[];
  variants: Record<string, ComposedGesuch>;
  primaryColors: Record<string, string>;
  submissionInfo: SubmissionInfo;
}

export default function GesuchPageClient({
  slug,
  foundationThemes,
  variants,
  primaryColors,
  submissionInfo,
}: GesuchPageClientProps) {
  const [activeSchwerpunkt, setActiveSchwerpunkt] = useState<SchwerpunktId | null>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  const variantKey = activeSchwerpunkt ?? 'auto';
  const gesuch = variants[variantKey];
  const primaryColor = primaryColors[variantKey] ?? '#3498DB';
  const activeGesuch = gesuch ?? variants['auto'];
  const activeColor = gesuch ? primaryColor : primaryColors['auto'] ?? '#3498DB';

  const foundationContext = activeGesuch?.ready
    ? {
        name: activeGesuch.foundation.name,
        purpose: activeGesuch.foundation.purposeSummary
          ? extractPurposeCore(activeGesuch.foundation.purposeSummary)
          : undefined,
        type: activeGesuch.foundation.type,
        themes: activeGesuch.themes.all.map((t) => t.label),
        fitScore: undefined as number | undefined,
      }
    : undefined;

  const {
    overrides,
    editMode,
    saving,
    dirty,
    toggleEditMode,
    updateField,
    save,
    saveIfDirty,
    reset,
    aiRewrite,
  } = useGesuchOverrides(slug, foundationContext);

  if (!activeGesuch || !activeGesuch.ready) return null;

  // Merge overrides on top of generated content
  const foundationBridge = overrides.foundationBridge ?? activeGesuch.foundationBridge;
  const why = activeGesuch.story.why
    ? {
        ...activeGesuch.story.why,
        headline: overrides.why?.headline ?? activeGesuch.story.why.headline,
        hook: overrides.why?.hook ?? activeGesuch.story.why.hook,
        problem: overrides.why?.problem ?? activeGesuch.story.why.problem,
        solution: overrides.why?.solution ?? activeGesuch.story.why.solution,
      }
    : activeGesuch.story.why;

  const trackRecord = {
    ...activeGesuch.story.how.track_record,
    headline: overrides.how?.trackRecord?.headline ?? activeGesuch.story.how.track_record.headline,
    text: overrides.how?.trackRecord?.text ?? activeGesuch.story.how.track_record.text,
  };

  const heroDescription = activeGesuch.foundation.purposeSummary
    ? extractPurposeCore(activeGesuch.foundation.purposeSummary)
    : '';

  const handleToggleEdit = () => {
    const wasOff = !editMode;
    toggleEditMode();
    if (wasOff) {
      setTimeout(() => {
        editPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="gesuch-page">
      <GesuchHeroSection
        subtitle="Partnerschaftsvorschlag"
        foundationName={activeGesuch.foundation.name}
        description={heroDescription}
        foundationBridge={foundationBridge}
        themes={activeGesuch.themes.all}
        primaryColor={activeColor}
      />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 md:px-0">
        {/* Top action toolbar — discoverable without scrolling to bottom */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-light px-4 py-3 print:hidden">
          <div className="flex items-center gap-3">
            <a
              href={`/api/pdf/gesuch/${slug}`}
              download
              className="flex items-center gap-1.5 rounded-lg bg-grey-dark px-4 py-2 text-sm font-semibold text-white hover:bg-grey-dark/90"
            >
              📄 PDF herunterladen
            </a>
            <Link
              href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary"
            >
              👁 HTML-Vorschau
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {hasOverrides && (
              <span className="text-xs text-primary">✏️ Angepasste Version</span>
            )}
            <button
              type="button"
              onClick={handleToggleEdit}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                editMode
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                  : 'border border-border text-text-muted hover:border-primary/40 hover:text-primary'
              }`}
            >
              {editMode ? '✓ Bearbeitung beenden' : '✏️ Anpassen'}
            </button>
          </div>
        </div>

        <GesuchSubmitSection info={submissionInfo} />

        <SchwerpunktSelector
          active={activeSchwerpunkt}
          foundationThemes={foundationThemes}
          onSelect={setActiveSchwerpunkt}
          disabled={editMode}
        />

        {/* Edit panel */}
        {editMode && (
          <div ref={editPanelRef}>
            <GesuchEditPanel
              foundationName={activeGesuch.foundation.name}
              overrides={overrides}
              generated={{
                foundationBridge: activeGesuch.foundationBridge,
                why: activeGesuch.story.why ?? undefined,
                trackRecord: activeGesuch.story.how.track_record,
              }}
              saving={saving}
              dirty={dirty}
              onUpdate={updateField}
              onSave={save}
              onSaveIfDirty={saveIfDirty}
              onReset={reset}
              onAiRewrite={aiRewrite}
            />
          </div>
        )}

        {why && (
          <GesuchWhySection
            why={why}
            secondaryThemeRelevance={activeGesuch.secondaryThemeRelevance}
          />
        )}

        <GesuchHowSection
          trackRecord={trackRecord}
          competencies={activeGesuch.story.how.competencies}
        />

        <GesuchProjectsSection projects={activeGesuch.story.projects} />
        <GesuchEvidenceSection evidence={activeGesuch.story.evidence} />

        <GesuchContactSection
          foundationName={activeGesuch.foundation.name}
          organization={activeGesuch.organization}
        />

        {/* Bottom nav */}
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-border pt-6 print:hidden">
          <button
            type="button"
            onClick={handleToggleEdit}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
              editMode
                ? 'bg-primary/10 text-primary'
                : 'bg-bg-light text-text-muted hover:text-primary'
            }`}
          >
            {editMode ? 'Bearbeitung beenden' : '✏️ Anpassen'}
          </button>
          <Link
            href={`/fundraising/stiftungen/${slug}`}
            className="text-sm text-primary hover:underline"
          >
            &larr; Zurück zur Stiftungsseite
          </Link>
        </div>
      </div>
    </div>
  );
}
