'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GesuchOverridesData } from '@/lib/db/schema';

export interface FoundationContext {
  name: string;
  purpose?: string;
  type?: string;
  themes?: string[];
  fitScore?: number;
}

interface UseGesuchOverridesReturn {
  overrides: GesuchOverridesData;
  editMode: boolean;
  saving: boolean;
  dirty: boolean;
  toggleEditMode: () => void;
  updateField: (patch: GesuchOverridesData) => void;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  aiRewrite: (params: {
    instruction: string;
    currentText: string;
    fieldPath: string;
    fieldDescription?: string;
  }) => Promise<string | null>;
}

export function useGesuchOverrides(
  slug: string,
  foundationContext?: FoundationContext,
): UseGesuchOverridesReturn {
  const [overrides, setOverrides] = useState<GesuchOverridesData>({});
  const [savedOverrides, setSavedOverrides] = useState<GesuchOverridesData>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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
      return next;
    });
    setDirty(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/gesuch-overrides/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrides),
      });
      const result = await res.json();
      if (result.success) {
        setSavedOverrides(overrides);
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }, [slug, overrides]);

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
      try {
        const res = await fetch('/api/ai/gesuch-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction,
            currentText,
            fieldPath,
            fieldDescription,
            foundationName: foundationContext?.name,
            foundationPurpose: foundationContext?.purpose,
            foundationType: foundationContext?.type,
            foundationThemes: foundationContext?.themes,
            foundationFitScore: foundationContext?.fitScore,
          }),
        });
        const result = await res.json();
        if (!result.success) return null;
        return result.data.rewritten;
      } catch {
        return null;
      }
    },
    [foundationContext],
  );

  return {
    overrides,
    editMode,
    saving,
    dirty,
    toggleEditMode,
    updateField,
    save,
    reset,
    aiRewrite,
  };
}
