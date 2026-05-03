'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { FilterChip } from '@/lib/types/filter';

interface CheckboxFilterGroupProps {
  title: string;
  chips: FilterChip[];
  selected: readonly string[];
  onToggle: (id: string) => void;
  defaultOpen?: boolean;
}

export default function CheckboxFilterGroup({
  title,
  chips,
  selected,
  onToggle,
  defaultOpen,
}: CheckboxFilterGroupProps) {
  return (
    <CollapsibleSection title={title} defaultOpen={defaultOpen} count={selected.length || undefined}>
      <div className="space-y-1.5">
        {chips.map((chip) => {
          const isSelected = selected.includes(chip.id);
          return (
            <label key={chip.id} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(chip.id)}
                className="rounded border-border"
              />
              <span className={isSelected ? 'font-medium text-grey-dark' : 'text-text-muted'}>
                {chip.icon && <span className="mr-1">{chip.icon}</span>}
                {chip.label}
              </span>
            </label>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}
