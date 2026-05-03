'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Application, FoundationRow } from '@/lib/db/schema';
import type { ApplicationStatusId } from '@/lib/config/application-statuses';
import { NET_ERR_LOAD, NET_ERR_SAVE, NET_ERR_DELETE } from '@/lib/utils/errors';

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

function formatDate(value: string | null | undefined): string {
  return value ? value.split('T')[0] : '';
}

function initFieldsFromApplication(app: Application): ApplicationFormFields {
  return {
    status: app.status,
    requestedAmount: app.requestedAmount?.toString() ?? '',
    awardedAmount: app.awardedAmount?.toString() ?? '',
    priorityLevel: app.priorityLevel?.toString() ?? '',
    assignedTo: app.assignedTo ?? '',
    projectFocus: app.projectFocus ?? '',
    customizationNotes: app.customizationNotes ?? '',
    contactDate: formatDate(app.contactDate),
    submissionDate: formatDate(app.submissionDate),
    decisionExpected: formatDate(app.decisionExpected),
    decisionDate: formatDate(app.decisionDate),
    rejectionReason: app.rejectionReason ?? '',
    successFactors: app.successFactors ?? '',
  };
}

function buildPatchPayload(fields: ApplicationFormFields) {
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
    async function fetchApplication() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/applications/${id}`);
        const result = await response.json();
        if (result.success) {
          setFoundation(result.data.foundation);
          setFields(initFieldsFromApplication(result.data.application));
        } else {
          setError(result.error || 'Nicht gefunden');
        }
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError(NET_ERR_LOAD);
      } finally {
        setIsLoading(false);
      }
    }
    fetchApplication();
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
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPatchPayload(fields)),
      });
      const result = await response.json();
      if (result.success) {
        setFoundation(result.data.foundation);
      } else {
        setSaveError(result.error || 'Speichern fehlgeschlagen');
      }
    } catch (err) {
      console.error('Failed to save application:', err);
      setSaveError(NET_ERR_SAVE);
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
      const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        router.push('/fundraising/applications');
      } else {
        setDeleteError(result.error ?? 'Löschen fehlgeschlagen');
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
