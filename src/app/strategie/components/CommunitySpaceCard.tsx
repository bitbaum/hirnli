'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface CommunitySpaceCardProps {
  icon: string;
  title: string;
  tagline: string;
  description: string;
  type: 'core' | 'expansion';
  activities?: string[];
  capacity?: string;
  targetAudience?: string;
  sdgs?: string[];
  estimatedCost?: string;
}

export default function CommunitySpaceCard({
  icon,
  title,
  tagline,
  description,
  type,
  activities = [],
  capacity,
  targetAudience,
  sdgs = [],
  estimatedCost,
}: CommunitySpaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const borderStyle = type === 'core'
    ? 'border-2 border-primary bg-white shadow-md hover:shadow-xl'
    : 'border border-dashed border-border bg-bg-light/50 hover:bg-bg-light';

  return (
    <div
      className={`
        rounded-xl p-6 transition-reveal
        ${borderStyle}
        ${isExpanded ? 'col-span-full' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <span className="text-5xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-grey-dark">{title}</h3>
              <p className="text-sm text-text-light mt-1">{tagline}</p>
            </div>
            {type === 'core' && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full whitespace-nowrap">
                Kernbereich
              </span>
            )}
          </div>
          <p className="text-sm text-grey-dark mt-3 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      {activities.length > 0 && (
        <Button
          variant="ghost"
          fullWidth
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4"
        >
          {isExpanded ? '▲ Weniger Details' : '▼ Mehr Details'}
        </Button>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-border space-y-6">
          {/* Activities */}
          {activities.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-grey-dark mb-3">
                Was hier passiert:
              </h4>
              <ul className="space-y-2">
                {activities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-grey-dark">
                    <span className="text-primary font-bold mt-0.5">→</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Capacity & Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {capacity && (
              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-primary mb-2">Kapazität</h4>
                <p className="text-sm text-primary">{capacity}</p>
              </div>
            )}
            {targetAudience && (
              <div className="bg-success/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-success mb-2">Zielgruppe</h4>
                <p className="text-sm text-success">{targetAudience}</p>
              </div>
            )}
          </div>

          {/* SDGs */}
          {sdgs.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-grey-dark mb-2">SDG-Beitrag</h4>
              <div className="flex flex-wrap gap-2">
                {sdgs.map((sdg, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full"
                  >
                    {sdg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          {estimatedCost && (
            <div className="bg-warning/10 border-l-4 border-warning rounded-lg p-4">
              <h4 className="text-sm font-semibold text-warning mb-1">Geschätzte Kosten</h4>
              <p className="text-lg font-bold text-warning">{estimatedCost}</p>
              <p className="text-sm text-warning mt-1">Einmalige Einrichtung + erstes Jahr Betrieb</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
