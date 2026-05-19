/**
 * ProgressBar — SSOT for all progress/percentage bar displays
 *
 * Replaces 5+ duplicate inline progress bar patterns across the codebase.
 */

const SIZE_CLASSES = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3',
} as const;

interface ProgressBarProps {
  /** Percentage (0-100) */
  percent: number;
  /** Bar height */
  size?: keyof typeof SIZE_CLASSES;
  /** Fill color class (default: bg-primary) */
  color?: string;
  /** Track color class (default: bg-surface-raised) */
  trackColor?: string;
  /** Accessible label */
  label?: string;
}

export default function ProgressBar({
  percent,
  size = 'sm',
  color = 'bg-primary',
  trackColor = 'bg-surface-raised',
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={`w-full overflow-hidden rounded-full ${trackColor} ${SIZE_CLASSES[size]}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
