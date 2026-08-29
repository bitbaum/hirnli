'use client';

import { SCHWERPUNKTE, SCHWERPUNKT_IDS } from '@/lib/config/schwerpunkte';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { ThemeId } from '@/lib/schemas/foundation';

interface SchwerpunktSelectorProps {
  /** Which Schwerpunkt is currently selected (null = auto/default) */
  active: SchwerpunktId | null;
  /** Foundation's theme IDs — matching Schwerpunkte get a highlight */
  foundationThemes: ThemeId[];
  onSelect: (id: SchwerpunktId | null) => void;
  /** When true, pills are visually dimmed and non-interactive (e.g. during edit mode) */
  disabled?: boolean;
  /** Compact mode for Steps 2/3 — smaller pills, inline */
  compact?: boolean;
  /** Variant keys that have been drafted — show green dot badge */
  draftedVariants?: string[];
}

export default function SchwerpunktSelector({
  active,
  foundationThemes,
  onSelect,
  disabled = false,
  compact = false,
  draftedVariants = [],
}: SchwerpunktSelectorProps) {
  const themeSet = new Set(foundationThemes);
  const draftedSet = new Set(draftedVariants);

  const pillSize = compact ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';
  const gapClass = compact ? 'gap-1.5' : 'gap-2';
  const marginClass = compact ? 'mb-4' : 'mb-8';

  return (
    <div
      className={`${marginClass} flex flex-wrap items-center justify-center ${gapClass} print:hidden transition-opacity ${disabled ? 'pointer-events-none opacity-40' : ''}`}
      title={
        disabled
          ? 'Schwerpunkt-Auswahl während der Bearbeitung gesperrt — erst speichern, dann wechseln'
          : undefined
      }
    >
      {/* Auto pill */}
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full ${pillSize} font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          active === null
            ? 'bg-grey-dark text-white shadow-sm'
            : 'border border-border-default text-text-muted hover:border-grey-dark hover:text-text-primary'
        }`}
      >
        Auto{draftedSet.has('auto') && <span className="ml-1 text-success">●</span>}
      </button>

      {/* Schwerpunkt pills */}
      {SCHWERPUNKT_IDS.map((id) => {
        const sp = SCHWERPUNKTE[id];
        const hasOverlap = sp.themeIds.some((t) => themeSet.has(t));
        const isActive = active === id;
        const isDrafted = draftedSet.has(id);

        return (
          <button
            key={id}
            onClick={() => onSelect(isActive ? null : id)}
            className={`rounded-full ${pillSize} font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isActive
                ? 'text-white shadow-sm'
                : hasOverlap
                  ? 'border-2 text-text-primary hover:shadow-sm'
                  : 'border border-border-default text-text-muted hover:border-grey-dark hover:text-text-primary'
            }`}
            style={
              isActive
                ? { backgroundColor: sp.color }
                : hasOverlap
                  ? { borderColor: sp.color }
                  : undefined
            }
          >
            {compact ? sp.shortLabel : `${sp.icon} ${sp.shortLabel}`}
            {isDrafted && <span className="ml-1 text-success">●</span>}
          </button>
        );
      })}
    </div>
  );
}
