'use client';

import { Button } from '@/components/ui/Button';

interface DeleteConfirmBlockProps {
  deleteConfirm: boolean;
  deleteError: string | null;
  isDeleting: boolean;
  confirmDelete: () => void;
  cancelDelete: () => void;
  executeDelete: () => void;
}

export default function DeleteConfirmBlock({
  deleteConfirm,
  deleteError,
  isDeleting,
  confirmDelete,
  cancelDelete,
  executeDelete,
}: DeleteConfirmBlockProps) {
  if (!deleteConfirm) {
    return (
      <Button
        onClick={confirmDelete}
        variant="secondary"
        className="border-danger/20 text-danger hover:bg-danger/10"
      >
        Gesuch löschen
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-2">
      {deleteError ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-danger">{deleteError}</span>
          <Button onClick={cancelDelete} variant="ghost" size="sm">
            Schliessen
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-danger">Wirklich löschen?</span>
          <Button onClick={cancelDelete} variant="ghost" size="sm" disabled={isDeleting}>
            Nein
          </Button>
          <Button onClick={executeDelete} disabled={isDeleting} variant="danger" size="sm">
            {isDeleting ? '...' : 'Ja, löschen'}
          </Button>
        </div>
      )}
    </div>
  );
}
