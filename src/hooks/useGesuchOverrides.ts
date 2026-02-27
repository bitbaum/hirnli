'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GesuchOverridesData } from '@/lib/db/schema';

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
  }) => Promise<string | null>;
}

function setNestedPath(obj: GesuchOverridesData, path: string, value: string): GesuchOverridesData {
  const parts = path.split('.');
  if (parts.length === 1) return { ...obj, [parts[0]]: value };
  if (parts.length === 2) {
    const [key, subkey] = parts as [keyof GesuchOverridesData, string];
    return { ...obj, [key]: { ...(obj[key] as Record<string, unknown> ?? {}), [subkey]: value } };
  }
  if (parts.length === 3) {
    const [key, mid, subkey] = parts;
    const topVal = (obj[key as keyof GesuchOverridesData] ?? {}) as Record<string, unknown>;
    const midVal = (topVal[mid] ?? {}) as Record<string, unknown>;
    return { ...obj, [key]: { ...topVal, [mid]: { ...midVal, [subkey]: value } } };
  }
  return obj;
}

export function useGesuchOverrides(slug: string): UseGesuchOverridesReturn {
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
    }: {
      instruction: string;
      currentText: string;
      fieldPath: string;
    }): Promise<string | null> => {
      try {
        const res = await fetch('/api/ai/gesuch-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instruction, currentText, context: `Feld: ${fieldPath}` }),
        });
        const result = await res.json();
        return result.success ? result.data.rewritten : null;
      } catch {
        return null;
      }
    },
    []
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
