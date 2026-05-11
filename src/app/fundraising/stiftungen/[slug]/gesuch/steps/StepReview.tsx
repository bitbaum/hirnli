'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import Link from 'next/link';
import type { WhySection, TrackRecord, CompetencySection, Project, Evidence, CoreFacts } from '@/lib/schemas/story';
import type { ThemeKey } from '@/lib/config/stories';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { AnschreibenText } from '../GesuchPageClient';
import GesuchEditPanel from '@/components/gesuch/GesuchEditPanel';
import OverrideHistory from '@/components/gesuch/OverrideHistory';
import GesuchReadinessChecklist from '@/components/gesuch/GesuchReadinessChecklist';
import type { GesuchReadiness } from '@/lib/domain/gesuch-readiness';
import {
  GesuchWhySection,
  GesuchHowSection,
  GesuchProjectsSection,
  GesuchEvidenceSection,
  GesuchContactSection,
} from '@/components/gesuch/sections';
import GesuchProcessSection from '@/components/gesuch/GesuchProcessSection';
import SchwerpunktSelector from '@/components/gesuch/SchwerpunktSelector';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId } from '@/lib/schemas/foundation';
import type { FoundationAIContext } from '@/lib/domain/ai-context';
import Badge from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface StepReviewProps {
  slug: string;
  foundationName: string;
  why: WhySection | undefined;
  secondaryThemeRelevance?: { theme: ThemeKey; label: string; connection: string }[];
  trackRecord: TrackRecord;
  competencies: CompetencySection[];
  projects: Project[];
  evidence: Evidence[];
  organization: CoreFacts;
  // Edit state
  editMode: boolean;
  overrides: GesuchOverridesData;
  hasOverrides: boolean;
  saving: boolean;
  dirty: boolean;
  generated: {
    foundationBridge?: string;
    why?: WhySection;
    trackRecord: TrackRecord;
    anschreiben: AnschreibenText;
  };
  editPanelRef: RefObject<HTMLDivElement | null>;
  onToggleEdit: () => void;
  onUpdateField: (patch: GesuchOverridesData) => void;
  onSave: () => Promise<void>;
  onSaveIfDirty: () => Promise<void>;
  onReset: () => Promise<void>;
  onAiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
    fieldDescription?: string;
  }) => Promise<string | null>;
  onRestoreOverrides: (overrides: GesuchOverridesData) => void;
  onAutoDraft: () => Promise<void>;
  autoDraftLoading: boolean;
  readiness: GesuchReadiness;
  // Variant switching
  activeSchwerpunkt: SchwerpunktId | null;
  foundationThemes: ThemeId[];
  draftedVariants: string[];
  onSelectSchwerpunkt: (id: SchwerpunktId | null) => void;
  // AI prompt context
  foundationContext?: FoundationAIContext;
  schwerpunktLabel?: string;
  // Navigation
  onPrev: () => void;
  onNext: () => void;
}

export default function StepReview({
  slug,
  foundationName,
  why,
  secondaryThemeRelevance,
  trackRecord,
  competencies,
  projects,
  evidence,
  organization,
  editMode,
  overrides,
  hasOverrides,
  saving,
  dirty,
  generated,
  editPanelRef,
  onToggleEdit,
  onUpdateField,
  onSave,
  onSaveIfDirty,
  onReset,
  onAiRewrite,
  onRestoreOverrides,
  onAutoDraft,
  autoDraftLoading,
  readiness,
  activeSchwerpunkt,
  foundationThemes,
  draftedVariants,
  onSelectSchwerpunkt,
  foundationContext,
  schwerpunktLabel,
  onPrev,
  onNext,
}: StepReviewProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <div className="space-y-12">
      {/* Compact variant tabs */}
      <SchwerpunktSelector
        active={activeSchwerpunkt}
        foundationThemes={foundationThemes}
        onSelect={async (id) => {
          await onSaveIfDirty();
          onSelectSchwerpunkt(id);
        }}
        disabled={editMode}
        compact
        draftedVariants={draftedVariants}
      />

      {/* Auto-draft CTA — shown when no overrides exist yet */}
      {!hasOverrides && !autoDraftLoading && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 print:hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="heading-detail">Automatischer KI-Entwurf</p>
              <p className="mt-0.5 text-sm text-text-muted">
                Verbindungssatz und Anschreiben werden auf {foundationName} massgeschneidert.
              </p>
            </div>
            <Button variant="soft" onClick={onAutoDraft}>
              KI-Entwurf erstellen
            </Button>
          </div>
        </div>
      )}
      {autoDraftLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5 print:hidden">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-grey-dark">KI-Entwurf wird erstellt…</span>
        </div>
      )}

      {/* Edit toggle toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-light px-4 py-3 print:hidden">
        <div className="flex items-center gap-2">
          {hasOverrides && (
            <Badge variant="primary" className="py-1">Angepasst</Badge>
          )}
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary"
          >
            HTML-Vorschau
          </Link>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:border-primary/40 hover:text-primary"
          >
            Versionshistorie
          </button>
        </div>
        <button
          type="button"
          onClick={onToggleEdit}
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
            foundationName={foundationName}
            overrides={overrides}
            foundationContext={foundationContext}
            schwerpunktLabel={schwerpunktLabel}
            generated={generated}
            saving={saving}
            dirty={dirty}
            onUpdate={onUpdateField}
            onSave={onSave}
            onSaveIfDirty={onSaveIfDirty}
            onReset={onReset}
            onAiRewrite={onAiRewrite}
          />
        </div>
      )}

      {/* Gesuch content */}
      {why && (
        <GesuchWhySection
          why={why}
          secondaryThemeRelevance={secondaryThemeRelevance}
        />
      )}

      <GesuchProcessSection />

      <GesuchHowSection
        trackRecord={trackRecord}
        competencies={competencies}
      />

      <GesuchProjectsSection projects={projects} />
      <GesuchEvidenceSection evidence={evidence} />

      <GesuchContactSection
        foundationName={foundationName}
        organization={organization}
      />

      {/* Readiness checklist */}
      <GesuchReadinessChecklist readiness={readiness} />

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 print:hidden">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-text-muted hover:text-primary"
        >
          ← Fokus ändern
        </button>
        <Button variant="soft" size="lg" onClick={onNext}>
          Weiter — Einreichen →
        </Button>
      </div>

      {/* Override version history drawer */}
      <OverrideHistory
        slug={slug}
        variantKey={activeSchwerpunkt ?? 'auto'}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={onRestoreOverrides}
      />
    </div>
  );
}
