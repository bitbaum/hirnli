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
}

export default function SchwerpunktSelector({
  active,
  foundationThemes,
  onSelect,
  disabled = false,
}: SchwerpunktSelectorProps) {
  const themeSet = new Set(foundationThemes);

  return (
    <div
      className={`mb-8 flex flex-wrap items-center justify-center gap-2 print:hidden transition-opacity ${disabled ? 'pointer-events-none opacity-40' : ''}`}
      title={disabled ? 'Schwerpunkt-Auswahl während der Bearbeitung gesperrt — erst speichern, dann wechseln' : undefined}
    >
      {/* Auto pill */}
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
          active === null
            ? 'bg-grey-dark text-white shadow-sm'
            : 'border border-border text-text-muted hover:border-grey-dark hover:text-grey-dark'
        }`}
      >
        Auto
      </button>

      {/* Schwerpunkt pills */}
      {SCHWERPUNKT_IDS.map((id) => {
        const sp = SCHWERPUNKTE[id];
        const hasOverlap = sp.themeIds.some((t) => themeSet.has(t));
        const isActive = active === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(isActive ? null : id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isActive
                ? 'text-white shadow-sm'
                : hasOverlap
                  ? 'border-2 text-grey-dark hover:shadow-sm'
                  : 'border border-border text-text-muted hover:border-grey-dark hover:text-grey-dark'
            }`}
            style={
              isActive
                ? { backgroundColor: sp.color }
                : hasOverlap
                  ? { borderColor: sp.color }
                  : undefined
            }
          >
            {sp.icon} {sp.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
