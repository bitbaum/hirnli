'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId, Foundation } from '@/lib/schemas/foundation';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import { extractPurposeCore } from '@/lib/domain/bridge-composer';
import { buildDynamicOpening } from '@/lib/domain/anschreiben-composer';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { useGesuchOverrides } from '@/hooks/useGesuchOverrides';
import StepIndicator from '@/components/gesuch/StepIndicator';
import GesuchStatusWidget from '@/components/gesuch/GesuchStatusWidget';
import SchwerpunktSelector from '@/components/gesuch/SchwerpunktSelector';
import GesuchHeroSection from '@/components/gesuch/GesuchHeroSection';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';
import GesuchProcessSection from '@/components/gesuch/GesuchProcessSection';
import GesuchEditPanel from '@/components/gesuch/GesuchEditPanel';
import GesuchSubmitSection from '@/components/gesuch/GesuchSubmitSection';
import type { SubmissionInfo } from '@/components/gesuch/GesuchSubmitSection';

interface GesuchPageClientProps {
  slug: string;
  foundationThemes: ThemeId[];
  variants: Record<string, ComposedGesuch>;
  primaryColors: Record<string, string>;
  submissionInfo: SubmissionInfo;
  foundationData: Foundation;
  shareToken?: string;
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
}: GesuchPageClientProps) {
  const [step, setStep] = useState<1 | 2 | 3>(initStep);
  const [activeSchwerpunkt, setActiveSchwerpunkt] = useState<SchwerpunktId | null>(null);
  const [copied, setCopied] = useState(false);
  const editPanelRef = useRef<HTMLDivElement>(null);

  const navigateStep = useCallback((n: 1 | 2 | 3) => {
    setStep(n);
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(n));
    window.history.replaceState(null, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const variantKey = activeSchwerpunkt ?? 'auto';
  const gesuch = variants[variantKey];
  const primaryColor = primaryColors[variantKey] ?? '#3498DB';
  const activeGesuch = gesuch ?? variants['auto'];
  const activeColor = gesuch ? primaryColor : primaryColors['auto'] ?? '#3498DB';

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
  } = useGesuchOverrides(slug, foundationData);

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

  async function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/gesuch/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Step 1: Fokus wählen ──────────────────────────────────────────────────
  const step1 = (
    <div className="space-y-8">
      {/* Foundation overview card */}
      <div className="rounded-xl border border-border bg-bg-light p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Stiftung</p>
            <h2 className="mt-1 text-xl font-bold text-grey-dark">{activeGesuch.foundation.name}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-bg px-2.5 py-0.5 text-xs font-medium text-text-muted">
              Typ {activeGesuch.foundation.type}
            </span>
            {foundationData.fitScore != null && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Fit {foundationData.fitScore}/10
              </span>
            )}
          </div>
        </div>
        {heroDescription && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{heroDescription}</p>
        )}
        {foundationData.tagline && (
          <p className="mt-2 text-sm italic text-text-muted">„{foundationData.tagline}"</p>
        )}
      </div>

      {/* Schwerpunkt selector */}
      <div>
        <h3 className="mb-3 text-base font-semibold text-grey-dark">Welcher Schwerpunkt passt am besten?</h3>
        <SchwerpunktSelector
          active={activeSchwerpunkt}
          foundationThemes={foundationThemes}
          onSelect={setActiveSchwerpunkt}
          disabled={false}
        />
      </div>

      {/* Bridge preview */}
      {foundationBridge && (
        <div className="rounded-lg border-l-4 border-primary bg-primary/5 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Partnerschafts-Brücke</p>
          <p className="text-sm text-text leading-relaxed">
            {foundationBridge.split(/\.\s+/).slice(0, 2).join('. ') + (foundationBridge.includes('. ') ? '.' : '')}
          </p>
        </div>
      )}

      {/* Weiter CTA */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigateStep(2)}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Weiter — Entwurf prüfen →
        </button>
      </div>
    </div>
  );

  // ─── Step 2: Entwurf prüfen & anpassen ────────────────────────────────────
  const step2 = (
    <div className="space-y-12">
      {/* Edit toggle toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-light px-4 py-3 print:hidden">
        <div className="flex items-center gap-2">
          {hasOverrides && (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              Angepasst
            </span>
          )}
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary"
          >
            👁 HTML-Vorschau
          </Link>
        </div>
        <button
          type="button"
          onClick={handleToggleEdit}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
            editMode
              ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
              : 'border border-border text-text-muted hover:border-primary/40 hover:text-primary'
          }`}
        >
          {editMode ? '✓ Bearbeitung beenden' : '✏ Anpassen'}
        </button>
      </div>

      {/* Edit panel (expandable) */}
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

      {/* Gesuch content */}
      {why && (
        <GesuchWhySection
          why={why}
          secondaryThemeRelevance={activeGesuch.secondaryThemeRelevance}
        />
      )}

      <GesuchProcessSection />

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

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 print:hidden">
        <button
          type="button"
          onClick={() => navigateStep(1)}
          className="text-sm text-text-muted hover:text-primary"
        >
          ← Fokus ändern
        </button>
        <button
          type="button"
          onClick={() => navigateStep(3)}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Weiter — Einreichen →
        </button>
      </div>
    </div>
  );

  // ─── Step 3: Einreichen ────────────────────────────────────────────────────
  const step3 = (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Output formats */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-grey-dark">Dokument erstellen</h3>

          {/* Full PDF */}
          <div className="rounded-xl border border-border bg-bg-light p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-grey-dark text-sm">Vollständiges Gesuch (PDF)</p>
                <p className="mt-0.5 text-xs text-text-muted">4 Seiten — Anschreiben, Projektbeschrieb, Budget, Kurzportrait</p>
              </div>
              <span className="text-xl">📄</span>
            </div>
            <a
              href={`/api/pdf/gesuch/${slug}${activeSchwerpunkt ? `?schwerpunkt=${activeSchwerpunkt}` : ''}`}
              download
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-grey-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-grey-dark/90 transition-colors"
            >
              Herunterladen
            </a>
          </div>

          {/* One-pager PDF */}
          <div className="rounded-xl border border-border bg-bg-light p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-grey-dark text-sm">Kurzübersicht (1 Seite)</p>
                <p className="mt-0.5 text-xs text-text-muted">Concept Note — häufig als Ersteinreichung gefordert</p>
              </div>
              <span className="text-xl">📋</span>
            </div>
            <a
              href={`/api/pdf/gesuch/${slug}/onepager${activeSchwerpunkt ? `?schwerpunkt=${activeSchwerpunkt}` : ''}`}
              download
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:border-primary/40 hover:text-primary transition-colors"
            >
              Herunterladen
            </a>
          </div>

          {/* Shareable link */}
          <div className="rounded-xl border border-border bg-bg-light p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-grey-dark text-sm">Öffentlicher Link</p>
                <p className="mt-0.5 text-xs text-text-muted">Lesbare Landing Page — direkt an Stiftungs-Programme schicken</p>
              </div>
              <span className="text-xl">🔗</span>
            </div>
            {shareToken ? (
              <button
                type="button"
                onClick={copyShareLink}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-text hover:border-primary/40 hover:text-primary transition-colors"
              >
                {copied ? '✓ Link kopiert!' : 'Link kopieren'}
              </button>
            ) : (
              <p className="mt-3 text-xs text-text-muted">
                Setze <code className="rounded bg-bg px-1 py-0.5 font-mono">SHARE_SECRET</code> in den Umgebungsvariablen, um Links zu aktivieren.
              </p>
            )}
          </div>

          {/* Secondary: HTML preview */}
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="block text-center text-sm text-text-muted hover:text-primary hover:underline"
          >
            HTML-Vorschau öffnen →
          </Link>
        </div>

        {/* Right: Pipeline + Submission */}
        <div className="space-y-6">
          {/* Pipeline widget */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-grey-dark">Pipeline-Status</h3>
            <GesuchStatusWidget slug={slug} responseTime={foundationData.responseTime} />
          </div>

          {/* Submit info */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-grey-dark">Einreichung</h3>
            <GesuchSubmitSection info={{ ...submissionInfo, emailBody }} />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 border-t border-border pt-6 print:hidden">
        <button
          type="button"
          onClick={() => navigateStep(2)}
          className="text-sm text-text-muted hover:text-primary"
        >
          ← Entwurf bearbeiten
        </button>
        <Link
          href={`/fundraising/stiftungen/${slug}`}
          className="ml-auto text-sm text-primary hover:underline"
        >
          ← Zurück zur Stiftungsseite
        </Link>
      </div>
    </div>
  );

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

        {/* Step content */}
        {step === 1 && step1}
        {step === 2 && step2}
        {step === 3 && step3}
      </div>
    </div>
  );
}
