'use client';

import { useState, useMemo, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Foundation } from '@/lib/schemas/foundation';
import { escapeCSV } from '@/lib/utils/csv';
import { getTodayISO } from '@/lib/utils/format';
import { COLUMN_GROUPS, ALL_COLUMNS, DEFAULT_IDS } from './csv-export-columns';

// ---------------------------------------------------------------------------
// Coverage indicator
// ---------------------------------------------------------------------------

function CoverageBar({ percent }: { percent: number }) {
  const filled = Math.round(percent / 20); // 0–5 blocks
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex gap-0.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={`h-2 w-1.5 rounded-sm ${i < filled ? 'bg-primary' : 'bg-bg-light'}`}
          />
        ))}
      </span>
      <span
        className={`w-8 text-right text-xs tabular-nums ${percent < 25 ? 'text-accent' : 'text-text-muted'}`}
        aria-label={`${percent}% Datenvollständigkeit`}
      >
        {percent}%
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Modal component
// ---------------------------------------------------------------------------

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  foundations: Foundation[];
}

export default function CsvExportModal({ isOpen, onClose, foundations }: CsvExportModalProps) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(DEFAULT_IDS));

  // Coverage per column — only computed when modal is open
  const coverage = useMemo(() => {
    if (!isOpen || foundations.length === 0) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const col of ALL_COLUMNS) {
      const filled = foundations.filter((f) => col.getValue(f).trim() !== '').length;
      map.set(col.id, Math.round((filled / foundations.length) * 100));
    }
    return map;
  }, [isOpen, foundations]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(ALL_COLUMNS.map((c) => c.id)));
  }, []);

  const selectNone = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectDefaults = useCallback(() => {
    setSelected(new Set(DEFAULT_IDS));
  }, []);

  const handleExport = useCallback(() => {
    const activeCols = ALL_COLUMNS.filter((c) => selected.has(c.id));
    if (activeCols.length === 0) return;

    const header = activeCols.map((c) => escapeCSV(c.label));
    const rows = foundations.map((f) =>
      activeCols.map((c) => escapeCSV(c.getValue(f))).join(','),
    );

    const csv = '\uFEFF' + [header.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stiftungen-export-${getTodayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  }, [foundations, selected, onClose]);

  const selectedCount = selected.size;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CSV Export" className="max-w-xl">
      {/* Count + quick toggles */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          <span className="font-semibold text-grey-dark">{foundations.length}</span> Stiftungen (aktueller Filter)
        </p>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={selectAll}>Alle</Button>
          <Button variant="ghost" size="sm" onClick={selectNone}>Keine</Button>
          <Button variant="ghost" size="sm" onClick={selectDefaults}>Standard</Button>
        </div>
      </div>

      {/* Column groups */}
      <div className="space-y-4">
        {COLUMN_GROUPS.map((group) => (
          <div key={group.label}>
            <h4 className="mb-1.5 heading-xs-label">
              {group.label}
            </h4>
            <div className="space-y-0.5">
              {group.columns.map((col) => {
                const checked = selected.has(col.id);
                const pct = coverage.get(col.id) ?? 0;
                return (
                  <label
                    key={col.id}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-bg-light"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(col.id)}
                      className="rounded border-border"
                    />
                    <span className={`flex-1 ${checked ? 'font-medium text-grey-dark' : 'text-text-muted'}`}>
                      {col.label}
                    </span>
                    <CoverageBar percent={pct} />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          {selectedCount} {selectedCount === 1 ? 'Spalte' : 'Spalten'} ausgewählt
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={selectedCount === 0}
            onClick={handleExport}
          >
            Herunterladen
          </Button>
        </div>
      </div>
    </Modal>
  );
}
