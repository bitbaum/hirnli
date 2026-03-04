'use client';

import { themeStyleSolid } from '@/lib/utils/theme';
import type { FilterChip } from '@/lib/types/filter';

interface FilterBarProps {
  label: string;
  chips: FilterChip[];
  selected: string[];
  onToggle: (id: string) => void;
  className?: string;
}

export default function FilterBar({ label, chips, selected, onToggle, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}:</span>
      {chips.map((chip) => {
        const isSelected = selected.includes(chip.id);
        return (
          <button
            key={chip.id}
            onClick={() => onToggle(chip.id)}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-grey-light text-grey-dark hover:bg-border'
            }`}
            style={isSelected && chip.color ? themeStyleSolid(chip.color) : undefined}
          >
            {chip.icon && <span>{chip.icon}</span>}
            {chip.label}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => selected.forEach(onToggle)}
          className="text-xs text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          Alle zurücksetzen
        </button>
      )}
    </div>
  );
}
