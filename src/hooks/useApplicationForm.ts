'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Application, FoundationRow } from '@/lib/db/schema';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import { getApplication, patchApplication, deleteApplication } from '@/lib/api/applications';
import { NET_ERR_DELETE, API_ERR_NOT_FOUND, API_ERR_SAVE, API_ERR_DELETE } from '@/lib/utils/errors';
import { normalizeDateInput } from '@/lib/utils/format';

export interface ApplicationFormFields {
  status: ApplicationStatusId;
  requestedAmount: string;
  awardedAmount: string;
  priorityLevel: string;
  assignedTo: string;
  projectFocus: string;
  customizationNotes: string;
  contactDate: string;
  submissionDate: string;
  decisionExpected: string;
  decisionDate: string;
  rejectionReason: string;
  successFactors: string;
}

const EMPTY_FIELDS: ApplicationFormFields = {
  status: 'prospect',
  requestedAmount: '',
  awardedAmount: '',
  priorityLevel: '',
  assignedTo: '',
  projectFocus: '',
  customizationNotes: '',
  contactDate: '',
  submissionDate: '',
  decisionExpected: '',
  decisionDate: '',
  rejectionReason: '',
  successFactors: '',
};

export function initFieldsFromApplication(app: Application): ApplicationFormFields {
  return {
    status: app.status,
    requestedAmount: app.requestedAmount?.toString() ?? '',
    awardedAmount: app.awardedAmount?.toString() ?? '',
    priorityLevel: app.priorityLevel?.toString() ?? '',
    assignedTo: app.assignedTo ?? '',
    projectFocus: app.projectFocus ?? '',
    customizationNotes: app.customizationNotes ?? '',
    contactDate: normalizeDateInput(app.contactDate),
    submissionDate: normalizeDateInput(app.submissionDate),
    decisionExpected: normalizeDateInput(app.decisionExpected),
    decisionDate: normalizeDateInput(app.decisionDate),
    rejectionReason: app.rejectionReason ?? '',
    successFactors: app.successFactors ?? '',
  };
}

export function buildPatchPayload(fields: ApplicationFormFields) {
  return {
    status: fields.status,
    requestedAmount: fields.requestedAmount ? Number(fields.requestedAmount) : null,
    awardedAmount: fields.awardedAmount ? Number(fields.awardedAmount) : null,
    priorityLevel: fields.priorityLevel ? Number(fields.priorityLevel) : null,
    assignedTo: fields.assignedTo || null,
    projectFocus: fields.projectFocus || null,
    customizationNotes: fields.customizationNotes || null,
    contactDate: fields.contactDate || null,
    submissionDate: fields.submissionDate || null,
    decisionExpected: fields.decisionExpected || null,
    decisionDate: fields.decisionDate || null,
    rejectionReason: fields.rejectionReason || null,
    successFactors: fields.successFactors || null,
  };
}

export function useApplicationForm(id: string) {
  const router = useRouter();
  const [foundation, setFoundation] = useState<FoundationRow | null>(null);
  const [fields, setFields] = useState<ApplicationFormFields>(EMPTY_FIELDS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchApplication() {
      try {
        setIsLoading(true);
        const result = await getApplication(id);
        if (cancelled) return;
        if (result.success) {
          const d = result.data as { foundation: FoundationRow; application: Application };
          setFoundation(d.foundation);
          setFields(initFieldsFromApplication(d.application));
        } else {
          setError(result.error || API_ERR_NOT_FOUND);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchApplication();
    return () => { cancelled = true; };
  }, [id]);

  const updateField = useCallback(<K extends keyof ApplicationFormFields>(
    key: K,
    value: ApplicationFormFields[K],
  ) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await patchApplication(id, buildPatchPayload(fields));
      if (result.success) {
        setFoundation((result.data as { foundation: FoundationRow }).foundation);
      } else {
        setSaveError(result.error || API_ERR_SAVE);
      }
    } finally {
      setIsSaving(false);
    }
  }, [id, fields]);

  const confirmDelete = useCallback(() => setDeleteConfirm(true), []);
  const cancelDelete = useCallback(() => setDeleteConfirm(false), []);

  const executeDelete = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await deleteApplication(id);
      if (result.success) {
        router.push('/fundraising/applications');
      } else {
        setDeleteError(result.error ?? API_ERR_DELETE);
        setIsDeleting(false);
      }
    } catch {
      setDeleteError(NET_ERR_DELETE);
      setIsDeleting(false);
    }
  }, [id, router]);

  return {
    foundation,
    fields,
    updateField,
    isLoading,
    error,
    isSaving,
    saveError,
    save,
    isDeleting,
    deleteConfirm,
    deleteError,
    confirmDelete,
    cancelDelete,
    executeDelete,
  };
}
