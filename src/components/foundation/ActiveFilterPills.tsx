'use client';

import FilterPill from '@/components/ui/FilterPill';
import { DEFAULT_FILTERS } from '@/lib/domain/foundation-filter';
import { TRUST_CONFIG } from '@/lib/config/trust-levels';
import type { FoundationFilters } from '@/lib/domain/foundation-filter';
import type { SchwerpunktId } from '@/lib/config/schwerpunkte';
import type { TrustLevel } from '@/lib/config/trust-levels';
import type { QualityTier } from '@/lib/schemas/foundation';

interface ActiveFilterPillsProps {
  filters: FoundationFilters;
  hasActiveFilters: boolean;
  setSchwerpunkt: (id: SchwerpunktId | null) => void;
  toggleTheme: (t: string) => void;
  toggleStatus: (id: string) => void;
  toggleType: (id: string) => void;
  toggleFit: (value: number) => void;
  togglePriorityLevel: (level: number) => void;
  toggleHideNoApplication: () => void;
  toggleHideOperative: () => void;
  toggleHideNetworks: () => void;
  toggleRequireEmail: () => void;
  toggleRequirePhone: () => void;
  toggleRequireAddress: () => void;
  toggleRequireDataGaps: () => void;
  toggleTrustLevel: (level: TrustLevel) => void;
  setMinTier: (tier: QualityTier) => void;
  resetFilters: () => void;
}

export default function ActiveFilterPills({
  filters,
  hasActiveFilters,
  setSchwerpunkt,
  toggleTheme,
  toggleStatus,
  toggleType,
  toggleFit,
  togglePriorityLevel,
  toggleHideNoApplication,
  toggleHideOperative,
  toggleHideNetworks,
  toggleRequireEmail,
  toggleRequirePhone,
  toggleRequireAddress,
  toggleRequireDataGaps,
  toggleTrustLevel,
  setMinTier,
  resetFilters,
}: ActiveFilterPillsProps) {
  if (!hasActiveFilters) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {filters.schwerpunkt && (
        <FilterPill label={`SP: ${filters.schwerpunkt}`} onRemove={() => setSchwerpunkt(null)} />
      )}
      {filters.themes.map((t) => (
        <FilterPill key={t} label={t} onRemove={() => toggleTheme(t)} />
      ))}
      {filters.statuses.map((s) => (
        <FilterPill key={s} label={s} onRemove={() => toggleStatus(s)} />
      ))}
      {filters.types.map((t) => (
        <FilterPill key={t} label={t} onRemove={() => toggleType(t)} />
      ))}
      {filters.fit.map((f) => (
        <FilterPill key={f} label={`Fit ${f}`} onRemove={() => toggleFit(f)} />
      ))}
      {filters.priorityLevels.map((pl) => (
        <FilterPill key={`pl-${pl}`} label={`P${pl}`} onRemove={() => togglePriorityLevel(pl)} />
      ))}
      {filters.hideNoApplication && (
        <FilterPill label="Nur mit Bewerbungsweg" onRemove={toggleHideNoApplication} />
      )}
      {filters.hideOperative && (
        <FilterPill label="Ohne Operative" onRemove={toggleHideOperative} />
      )}
      {filters.hideNetworks && (
        <FilterPill label="Ohne Netzwerke" onRemove={toggleHideNetworks} />
      )}
      {filters.requireEmail && (
        <FilterPill label="E-Mail" onRemove={toggleRequireEmail} />
      )}
      {filters.requirePhone && (
        <FilterPill label="Telefon" onRemove={toggleRequirePhone} />
      )}
      {filters.requireAddress && (
        <FilterPill label="Adresse" onRemove={toggleRequireAddress} />
      )}
      {filters.requireDataGaps && (
        <FilterPill label="Lücken füllen" onRemove={toggleRequireDataGaps} />
      )}
      {filters.trustLevels.map((level) => (
        <FilterPill key={level} label={TRUST_CONFIG[level].label} onRemove={() => toggleTrustLevel(level)} />
      ))}
      {filters.minTier !== DEFAULT_FILTERS.minTier && (
        <FilterPill label={`Min: ${filters.minTier}`} onRemove={() => setMinTier(DEFAULT_FILTERS.minTier)} />
      )}
      <button onClick={resetFilters} className="text-sm text-text-muted hover:text-primary">
        Alle zurücksetzen
      </button>
    </div>
  );
}
