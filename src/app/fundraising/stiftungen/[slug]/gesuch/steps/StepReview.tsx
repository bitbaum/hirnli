import type { RefObject } from 'react';
import Link from 'next/link';
import type { WhySection, TrackRecord, CompetencySection, Project, Evidence, CoreFacts } from '@/lib/schemas/story';
import type { ThemeKey } from '@/lib/config/stories';
import type { GesuchOverridesData } from '@/lib/db/schema';
import GesuchEditPanel from '@/components/gesuch/GesuchEditPanel';
import GesuchWhySection from '@/components/gesuch/GesuchWhySection';
import GesuchHowSection from '@/components/gesuch/GesuchHowSection';
import GesuchProjectsSection from '@/components/gesuch/GesuchProjectsSection';
import GesuchEvidenceSection from '@/components/gesuch/GesuchEvidenceSection';
import GesuchContactSection from '@/components/gesuch/GesuchContactSection';
import GesuchProcessSection from '@/components/gesuch/GesuchProcessSection';

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
  onPrev,
  onNext,
}: StepReviewProps) {
  return (
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

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 print:hidden">
        <button
          type="button"
          onClick={onPrev}
          className="text-sm text-text-muted hover:text-primary"
        >
          ← Fokus ändern
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Weiter — Einreichen →
        </button>
      </div>
    </div>
  );
}
