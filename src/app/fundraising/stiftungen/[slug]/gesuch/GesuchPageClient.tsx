'use client';

import { useState, useRef, useCallback } from 'react';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId, Foundation } from '@/lib/schemas/foundation';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';
import { buildDynamicOpening } from '@/lib/domain/anschreiben-composer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { useGesuchOverrides } from '@/hooks/useGesuchOverrides';
import { SCHWERPUNKTE } from '@/lib/config/schwerpunkte';
import { buildAIContext } from '@/lib/domain/ai-context';
import { DEFAULT_THEME_COLOR } from '@/lib/config/chart-colors';
import { useMemo } from 'react';
import { computeGesuchReadiness } from '@/lib/domain/gesuch-readiness';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import StepIndicator from '@/components/gesuch/StepIndicator';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import type { SubmissionInfo } from '@/components/gesuch/GesuchSubmitSection';
import StepFocus from './steps/StepFocus';
import StepReview from './steps/StepReview';
import StepSubmit from './steps/StepSubmit';

export interface AnschreibenText {
  subject: string;
  opening: string;
  closing: string;
  themeAlignment: string;
}

interface GesuchPageClientProps {
  slug: string;
  foundationThemes: ThemeId[];
  variants: Record<string, ComposedGesuch>;
  primaryColors: Record<string, string>;
  submissionInfo: SubmissionInfo;
  foundationData: Foundation;
  shareToken?: string;
  generatedAnschreiben: AnschreibenText;
}

function initStep(): 1 | 2 | 3 {
  if (typeof window === 'undefined') return 1;
  const param = new URLSearchParams(window.location.search).get('step');
  const n = parseInt(param ?? '1', 10);
  return (n === 2 || n === 3 ? n : 1) as 1 | 2 | 3;
}

export default function GesuchPageClient({
  slug,
  foundationThemes,
  variants,
  primaryColors,
  submissionInfo,
  foundationData,
  shareToken,
  generatedAnschreiben,
}: GesuchPageClientProps) {
  const [step, setStep] = useState<1 | 2 | 3>(initStep);
  const [activeSchwerpunkt, setActiveSchwerpunkt] = useState<SchwerpunktId | null>(null);
  const editPanelRef = useRef<HTMLDivElement>(null);

  const variantKey = activeSchwerpunkt ?? 'auto';
  const schwerpunktLabel = activeSchwerpunkt ? SCHWERPUNKTE[activeSchwerpunkt]?.label : undefined;
  const gesuch = variants[variantKey];
  const primaryColor = primaryColors[variantKey] ?? DEFAULT_THEME_COLOR;
  const activeGesuch = gesuch ?? variants['auto'];
  const activeColor = gesuch ? primaryColor : primaryColors['auto'] ?? DEFAULT_THEME_COLOR;

  const {
    overrides,
    editMode,
    saving,
    dirty,
    loadError,
    draftedVariants,
    toggleEditMode,
    updateField,
    save,
    saveIfDirty,
    reset,
    aiRewrite,
    restoreOverrides,
    autoDraft,
    autoDraftLoading,
    autoDraftError,
  } = useGesuchOverrides(slug, foundationData, variantKey, schwerpunktLabel);

  const foundationContext = useMemo(
    () => foundationData ? buildAIContext(foundationData) : undefined,
    [foundationData],
  );

  // Auto-save dirty changes before navigating away from the edit step
  const navigateStep = useCallback(async (n: 1 | 2 | 3) => {
    await saveIfDirty();
    setStep(n);
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(n));
    window.history.replaceState(null, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [saveIfDirty]);

  if (!activeGesuch || !activeGesuch.ready) {
    return <LoadingState label="Gesuch wird geladen..." className="py-20" />;
  }

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

  const hasOverrides = Object.keys(overrides).length > 0;

  const emailBody = (() => {
    const primaryThemeLabel = activeGesuch.themes.all[0]?.label ?? '';
    const opening = buildDynamicOpening(foundationData, primaryThemeLabel);
    return `${opening}\n\nIm Anhang finden Sie unser vollständiges Gesuch als PDF.\n\nFür Rückfragen stehen wir Ihnen gerne zur Verfügung:\n${ORG_PROFILE.name} · ${ORG_PROFILE.email}`;
  })();

  const handleToggleEdit = () => {
    const wasOff = !editMode;
    toggleEditMode();
    if (wasOff) {
      setTimeout(() => {
        editPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

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

      <div className="mx-auto max-w-4xl px-4 py-8 md:px-0">
        {/* Step indicator — always visible */}
        <div className="mb-10 flex justify-center">
          <StepIndicator currentStep={step} onNavigate={navigateStep} />
        </div>

        {loadError && (
          <ErrorAlert className="mb-6">
            Gespeicherte Anpassungen konnten nicht geladen werden. Bitte Seite neu laden.
          </ErrorAlert>
        )}
        {autoDraftError && (
          <ErrorAlert className="mb-6">
            KI-Entwurf wurde generiert, konnte aber nicht gespeichert werden — bitte manuell speichern.
          </ErrorAlert>
        )}

        {/* Step content */}
        {step === 1 && (
          <StepFocus
            foundationName={activeGesuch.foundation.name}
            foundationType={activeGesuch.foundation.type}
            fitScore={foundationData.fitScore}
            heroDescription={heroDescription}
            tagline={foundationData.tagline}
            foundationBridge={foundationBridge}
            foundationThemes={foundationThemes}
            activeSchwerpunkt={activeSchwerpunkt}
            onSelectSchwerpunkt={setActiveSchwerpunkt}
            onNext={() => navigateStep(2)}
          />
        )}
        {step === 2 && (
          <StepReview
            slug={slug}
            foundationName={activeGesuch.foundation.name}
            why={why}
            secondaryThemeRelevance={activeGesuch.secondaryThemeRelevance}
            trackRecord={trackRecord}
            competencies={activeGesuch.story.how.competencies}
            projects={activeGesuch.story.projects}
            evidence={activeGesuch.story.evidence}
            organization={activeGesuch.organization}
            editMode={editMode}
            overrides={overrides}
            hasOverrides={hasOverrides}
            saving={saving}
            dirty={dirty}
            generated={{
              foundationBridge: activeGesuch.foundationBridge,
              why: activeGesuch.story.why ?? undefined,
              trackRecord: activeGesuch.story.how.track_record,
              anschreiben: generatedAnschreiben,
            }}
            editPanelRef={editPanelRef}
            onToggleEdit={handleToggleEdit}
            onUpdateField={updateField}
            onSave={save}
            onSaveIfDirty={saveIfDirty}
            onReset={reset}
            onAiRewrite={aiRewrite}
            onRestoreOverrides={restoreOverrides}
            onAutoDraft={autoDraft}
            autoDraftLoading={autoDraftLoading}
            readiness={computeGesuchReadiness(activeGesuch, overrides, foundationData)}
            activeSchwerpunkt={activeSchwerpunkt}
            foundationThemes={foundationThemes}
            draftedVariants={draftedVariants}
            onSelectSchwerpunkt={setActiveSchwerpunkt}
            foundationContext={foundationContext}
            schwerpunktLabel={schwerpunktLabel}
            onPrev={() => navigateStep(1)}
            onNext={() => navigateStep(3)}
          />
        )}
        {step === 3 && (
          <StepSubmit
            slug={slug}
            activeSchwerpunkt={activeSchwerpunkt}
            submissionInfo={submissionInfo}
            emailBody={emailBody}
            responseTime={foundationData.responseTime}
            shareToken={shareToken}
            onPrev={() => navigateStep(2)}
          />
        )}
      </div>
    </div>
  );
}
