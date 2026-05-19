'use client';

import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { FilterChip } from '@/lib/types/filter';
import { FORM_CHECKBOX_LABEL_CLASS } from '@/lib/utils/form-classes';

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
            <label key={chip.id} className={FORM_CHECKBOX_LABEL_CLASS}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(chip.id)}
                className="rounded border-border-default"
              />
              <span className={isSelected ? 'font-medium text-text-primary' : 'text-text-muted'}>
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
