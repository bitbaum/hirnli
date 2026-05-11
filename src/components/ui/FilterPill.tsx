interface Props {
  label: string;
  onRemove: () => void;
}

export default function FilterPill({ label, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-grey-light px-2.5 py-1 text-xs font-medium text-grey-dark">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full hover:bg-border"
        aria-label={`Filter ${label} entfernen`}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
