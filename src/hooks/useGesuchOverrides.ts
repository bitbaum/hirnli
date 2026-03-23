'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { Foundation } from '@/lib/schemas/foundation';
import { buildAIContext, type FoundationAIContext } from '@/lib/domain/ai-context';

/** Fire-and-forget: ensure a pipeline entry exists for this foundation */
async function ensurePipelineEntry(slug: string) {
  try {
    const res = await fetch(`/api/applications?foundationId=${slug}`);
    const data = await res.json();
    const active = (data.data ?? []).find(
      (row: { application: { status: string } }) =>
        !['rejected', 'withdrawn'].includes(row.application.status),
    );
    if (!active) {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foundationId: slug, status: 'draft' }),
      });
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
): UseGesuchOverridesReturn {
  const [overrides, setOverrides] = useState<GesuchOverridesData>({});
  const [, setSavedOverrides] = useState<GesuchOverridesData>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;
  const pipelineChecked = useRef(false);

  // Load existing overrides on mount
  useEffect(() => {
    fetch(`/api/gesuch-overrides/${slug}`)
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          setOverrides(result.data.overrides);
          setSavedOverrides(result.data.overrides);
        }
      })
      .catch(() => {});
  }, [slug]);

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
    setSaving(true);
    try {
      const res = await fetch(`/api/gesuch-overrides/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(current),
      });
      const result = await res.json();
      if (result.success) {
        setSavedOverrides(current);
        setDirty(false);
        // Auto-create pipeline entry on first successful save
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
  }, [slug]);

  const saveIfDirty = useCallback(async () => {
    if (dirty) {
      try { await save(); } catch { /* silent — used by blur and navigation */ }
    }
  }, [dirty, save]);

  const reset = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/gesuch-overrides/${slug}`, { method: 'DELETE' });
      setOverrides({});
      setSavedOverrides({});
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [slug]);

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
      // Build richer AI context from full foundation object when available
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

  const autoDraft = useCallback(async () => {
    if (!foundation) return;
    setAutoDraftLoading(true);
    try {
      const purposeHint = foundation.purposeSummary
        ? `Stiftungszweck: ${foundation.purposeSummary}`
        : '';

      // 1. Foundation bridge
      const bridgeResult = await aiRewrite({
        instruction: `Schreibe einen prägnanten Verbindungssatz (2-3 Sätze), der erklärt, warum ${foundation.name} und unsere Organisation zusammenpassen. ${purposeHint}`,
        currentText: 'Verbindungssatz wird erstellt...',
        fieldPath: 'foundationBridge',
        fieldDescription: 'Verbindungssatz zwischen Stiftung und Organisation',
      });
      if (bridgeResult) {
        updateField({ foundationBridge: bridgeResult });
      }

      // 2. Anschreiben opening
      const openingResult = await aiRewrite({
        instruction: `Schreibe eine professionelle Anschreiben-Eröffnung (2-3 Sätze) für ein Fördergesuch an ${foundation.name}. ${purposeHint}`,
        currentText: 'Eröffnung wird erstellt...',
        fieldPath: 'anschreiben.opening',
        fieldDescription: 'Eröffnungsabsatz des Anschreibens',
      });
      if (openingResult) {
        updateField({ anschreiben: { opening: openingResult } });
      }

      // 3. Theme alignment
      const alignResult = await aiRewrite({
        instruction: `Beschreibe in 2-4 Sätzen, wie unsere Arbeitsbereiche mit den Förderzielen von ${foundation.name} übereinstimmen. ${purposeHint}`,
        currentText: 'Thematische Übereinstimmung wird erstellt...',
        fieldPath: 'anschreiben.themeAlignment',
        fieldDescription: 'Thematische Übereinstimmung im Anschreiben',
      });
      if (alignResult) {
        updateField({ anschreiben: { themeAlignment: alignResult } });
      }

      // Save accumulated overrides
      await save();
    } finally {
      setAutoDraftLoading(false);
    }
  }, [foundation, aiRewrite, updateField, save]);

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
