interface YearSelectorProps {
  years: readonly number[];
  selected: number;
  onChange: (year: number) => void;
  className?: string;
}

export default function YearSelector({ years, selected, onChange, className = '' }: YearSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-text-muted">Jahr:</span>
      {years.map((year) => (
        <button
          key={year}
          onClick={() => onChange(year)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            selected === year
              ? 'bg-primary text-white'
              : 'bg-grey-light text-grey-dark hover:bg-border'
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
