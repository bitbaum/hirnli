// ---------------------------------------------------------------------------
// InsightCard — small helper for management insights section
// ---------------------------------------------------------------------------

export function InsightCard({
  variant,
  title,
  text,
}: {
  variant: 'success' | 'warning' | 'info';
  title: string;
  text: string;
}) {
  const colors = {
    success: 'border-l-4 border-l-success bg-success-bg/30',
    warning: 'border-l-4 border-l-warning bg-warning-bg/30',
    info: 'border-l-4 border-l-primary bg-primary/5',
  };

  return (
    <div className={`rounded-lg p-4 ${colors[variant]}`}>
      <h4 className="mb-1 heading-detail">{title}</h4>
      <p className="text-sm text-text-light">{text}</p>
    </div>
  );
}
