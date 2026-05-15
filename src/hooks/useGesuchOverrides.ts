'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createApplication, getApplicationsByFoundation } from '@/lib/api/applications';
import { isActiveApplication, type ApplicationStatusId } from '@/lib/config/application-statuses';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { Foundation } from '@/lib/schemas/foundation';
import { buildAIContext, type FoundationAIContext } from '@/lib/domain/ai-context';

/** Fire-and-forget: ensure a pipeline entry exists for this foundation */
async function ensurePipelineEntry(slug: string) {
  try {
    const data = await getApplicationsByFoundation(slug);
    const active = (data.data as { application: { status: ApplicationStatusId } }[] ?? []).find(
      (row) => isActiveApplication(row.application.status),
    );
    if (!active) {
      await createApplication(slug, 'draft');
    }
  } catch {
    // Non-critical — don't block the save flow
  }
}

interface UseGesuchOverridesReturn {
  overrides: GesuchOverridesData;
  editMode: boolean;
  saving: boolean;
  dirty: boolean;
  loadError: boolean;
  autoDraftError: boolean;
  draftedVariants: string[];
  toggleEditMode: () => void;
  updateField: (patch: GesuchOverridesData) => void;
  save: () => Promise<void>;
  saveIfDirty: () => Promise<void>;
  reset: () => Promise<void>;
  aiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
    fieldDescription?: string;
  }) => Promise<string | null>;
  restoreOverrides: (restored: GesuchOverridesData) => void;
  autoDraft: () => Promise<void>;
  autoDraftLoading: boolean;
}

export function useGesuchOverrides(
  slug: string,
  foundation?: Foundation,
  variantKey: string = 'auto',
  schwerpunktLabel?: string,
): UseGesuchOverridesReturn {
  const [overrides, setOverrides] = useState<GesuchOverridesData>({});
  const [, setSavedOverrides] = useState<GesuchOverridesData>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [draftedVariants, setDraftedVariants] = useState<string[]>([]);
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;
  const pipelineChecked = useRef(false);

  const [needsAutoDraft, setNeedsAutoDraft] = useState(false);
  const autoTriggeredVariants = useRef(new Set<string>());

  // Fetch drafted variants list on mount
  useEffect(() => {
    fetch(`/api/gesuch-overrides/${slug}/variants`)
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setDraftedVariants(result.data ?? []);
      })
      .catch((err) => console.warn('variants fetch failed (display-only):', err));
  }, [slug]);

  // Load overrides for current variant — auto-draft if none exist
  useEffect(() => {
    setOverrides({});
    setSavedOverrides({});
    setDirty(false);
    setLoadError(false);

    const url = `/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`;
    fetch(url)
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const saved = result.data.overrides as GesuchOverridesData;
          setOverrides(saved);
          setSavedOverrides(saved);
        } else if (result.success) {
          if (foundation && !autoTriggeredVariants.current.has(variantKey)) {
            autoTriggeredVariants.current.add(variantKey);
            setNeedsAutoDraft(true);
          }
        } else {
          setLoadError(true);
        }
      })
      .catch(() => setLoadError(true));
  }, [slug, variantKey, foundation]);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => !prev);
  }, []);

  const updateField = useCallback((patch: GesuchOverridesData) => {
    setOverrides((prev) => {
      const next = { ...prev, ...patch };
      if (patch.why) next.why = { ...prev.why, ...patch.why };
      if (patch.how) {
        next.how = {
          ...prev.how,
          trackRecord:
            patch.how.trackRecord !== undefined
              ? { ...(prev.how?.trackRecord ?? {}), ...patch.how.trackRecord }
              : prev.how?.trackRecord,
        };
      }
      if (patch.anschreiben) next.anschreiben = { ...prev.anschreiben, ...patch.anschreiben };
      return next;
    });
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    const current = overridesRef.current;
    const url = `/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`;
    setSaving(true);
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      });
      const result = await res.json();
      if (result.success) {
        setSavedOverrides(current);
        setDirty(false);
        // Update drafted variants list
        setDraftedVariants((prev) =>
          prev.includes(variantKey) ? prev : [...prev, variantKey]
        );
        if (!pipelineChecked.current) {
          pipelineChecked.current = true;
          ensurePipelineEntry(slug);
        }
      } else {
        throw new Error('save-failed');
      }
    } finally {
      setSaving(false);
    }
  }, [slug, variantKey]);

  const saveIfDirty = useCallback(async () => {
    if (dirty) {
      try { await save(); } catch { /* silent */ }
    }
  }, [dirty, save]);

  const reset = useCallback(async () => {
    const url = `/api/gesuch-overrides/${slug}?variant=${encodeURIComponent(variantKey)}`;
    setSaving(true);
    try {
      await fetch(url, { method: 'DELETE' });
      setOverrides({});
      setSavedOverrides({});
      setDirty(false);
      setDraftedVariants((prev) => prev.filter((v) => v !== variantKey));
    } finally {
      setSaving(false);
    }
  }, [slug, variantKey]);

  const aiRewrite = useCallback(
    async ({
      instruction,
      currentText,
      fieldPath,
      fieldDescription,
    }: {
      instruction: string;
      currentText: string;
      fieldPath: string;
      fieldDescription?: string;
    }): Promise<string | null> => {
      const foundationContext: FoundationAIContext | undefined = foundation
        ? buildAIContext(foundation)
        : undefined;

      try {
        const res = await fetch('/api/ai/gesuch-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction,
            currentText,
            fieldPath,
            fieldDescription,
            foundationContext,
          }),
        });
        const result = await res.json();
        if (!result.success) return null;
        return result.data.rewritten;
      } catch {
        return null;
      }
    },
    [foundation],
  );

  const [autoDraftLoading, setAutoDraftLoading] = useState(false);
  const [autoDraftError, setAutoDraftError] = useState(false);

  const autoDraft = useCallback(async () => {
    if (!foundation) return;
    setAutoDraftLoading(true);
    setAutoDraftError(false);
    try {
      const name = foundation.name;
      const purposeHint = foundation.purposeSummary
        ? `Stiftungszweck: ${foundation.purposeSummary}`
        : '';
      const granteesHint = foundation.pastGrantees?.length
        ? `Bisherige Empfänger: ${foundation.pastGrantees.slice(0, 5).join(', ')}.`
        : '';
      const notesHint = foundation.researchNotes
        ? `Strategische Einschätzung: ${foundation.researchNotes}`
        : '';
      const angleHint = schwerpunktLabel
        ? `Schwerpunkt dieses Gesuchs: ${schwerpunktLabel}. Fokussiere auf diesen Aspekt unserer Arbeit.`
        : '';
      const context = [purposeHint, granteesHint, notesHint, angleHint].filter(Boolean).join('\n');

      const [bridgeResult, openingResult, alignResult, whyResult, howResult] =
        await Promise.all([
          aiRewrite({
            instruction: `Schreibe einen prägnanten Verbindungssatz (2-3 Sätze), der erklärt, warum ${name} und unsere Organisation zusammenpassen. Beziehe dich konkret auf den Stiftungszweck und unsere Fähigkeiten — kein generisches "wir passen gut zusammen".\n${context}`,
            currentText: 'Verbindungssatz wird erstellt...',
            fieldPath: 'foundationBridge',
            fieldDescription: 'Verbindungssatz zwischen Stiftung und Organisation — erklärt die spezifische Passung',
          }),
          aiRewrite({
            instruction: `Schreibe eine professionelle Anschreiben-Eröffnung (2-3 Sätze) für ein Fördergesuch an ${name}. Zeige, dass wir die Stiftung kennen — referenziere ihren Zweck oder ihre bisherigen Förderungen.\n${context}`,
            currentText: 'Eröffnung wird erstellt...',
            fieldPath: 'anschreiben.opening',
            fieldDescription: 'Eröffnungsabsatz des Anschreibens — erster Eindruck, zeigt Recherche',
          }),
          aiRewrite({
            instruction: `Beschreibe in 2-4 Sätzen, wie unsere Arbeitsbereiche mit den Förderzielen von ${name} übereinstimmen. Nenne konkrete Überschneidungen, nicht abstrakte Gemeinsamkeiten.\n${context}`,
            currentText: 'Thematische Übereinstimmung wird erstellt...',
            fieldPath: 'anschreiben.themeAlignment',
            fieldDescription: 'Thematische Übereinstimmung im Anschreiben — zeigt konkrete Schnittmengen',
          }),
          aiRewrite({
            instruction: `Schreibe einen "Warum"-Absatz (3-5 Sätze) für ein Fördergesuch an ${name}. Beschreibe das Problem, das wir lösen, aus der Perspektive dessen, was dieser Stiftung wichtig ist. Nicht generisch — formuliere so, dass ${name} sich angesprochen fühlt.\n${context}`,
            currentText: 'Problem-Lösung wird erstellt...',
            fieldPath: 'why.problem',
            fieldDescription: 'Problemdarstellung — warum unsere Arbeit nötig ist, aus Sicht der Stiftung',
          }),
          aiRewrite({
            instruction: `Schreibe einen "Wie wir arbeiten"-Absatz (3-5 Sätze) für ein Fördergesuch an ${name}. Hebe die Kompetenzen und Erfahrungen hervor, die für diese Stiftung besonders relevant sind. Konkrete Zahlen und Beispiele.\n${context}`,
            currentText: 'Track Record wird erstellt...',
            fieldPath: 'how.trackRecord.text',
            fieldDescription: 'Track Record — unsere relevante Erfahrung für diese spezifische Stiftung',
          }),
        ]);

      if (bridgeResult) updateField({ foundationBridge: bridgeResult });
      if (openingResult) updateField({ anschreiben: { opening: openingResult } });
      if (alignResult) updateField({ anschreiben: { themeAlignment: alignResult } });
      if (whyResult) updateField({ why: { problem: whyResult } });
      if (howResult) updateField({ how: { trackRecord: { text: howResult } } });

      try {
        await save();
      } catch {
        setAutoDraftError(true);
      }
    } finally {
      setAutoDraftLoading(false);
    }
  }, [foundation, schwerpunktLabel, aiRewrite, updateField, save]);

  // Auto-trigger AI personalization on first visit to each variant
  useEffect(() => {
    if (needsAutoDraft) {
      setNeedsAutoDraft(false);
      autoDraft();
    }
  }, [needsAutoDraft, autoDraft]);

  const restoreOverrides = useCallback((restored: GesuchOverridesData) => {
    setOverrides(restored);
    setSavedOverrides(restored);
    setDirty(false);
  }, []);

  return {
    overrides,
    editMode,
    saving,
    dirty,
    loadError,
    autoDraftError,
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
  };
}
