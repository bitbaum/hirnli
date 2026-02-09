'use client';

interface FilterChip {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

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
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-grey-light text-grey-dark hover:bg-border'
            }`}
            style={
              isSelected && chip.color
                ? { backgroundColor: chip.color, color: 'white' }
                : undefined
            }
          >
            {chip.icon && <span>{chip.icon}</span>}
            {chip.label}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => selected.forEach(onToggle)}
          className="text-xs text-text-muted hover:text-danger"
        >
          Alle zurücksetzen
        </button>
      )}
    </div>
  );
}
