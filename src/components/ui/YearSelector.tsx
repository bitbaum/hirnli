import { Button } from '@/components/ui/Button';

interface YearSelectorProps {
  years: readonly number[];
  selected: number;
  onChange: (year: number) => void;
  className?: string;
}

export default function YearSelector({
  years,
  selected,
  onChange,
  className = '',
}: YearSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-text-muted">Jahr:</span>
      {years.map((year) => (
        <Button
          key={year}
          onClick={() => onChange(year)}
          variant={selected === year ? 'soft' : 'ghost'}
          size="sm"
          className={selected === year ? '' : 'bg-surface-raised text-text-primary hover:bg-border'}
        >
          {year}
        </Button>
      ))}
    </div>
  );
}
