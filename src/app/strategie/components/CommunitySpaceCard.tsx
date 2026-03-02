'use client';

import { useState } from 'react';

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
        rounded-xl p-6 transition-all duration-300
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
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 py-2 px-4 rounded-lg text-sm font-semibold
            bg-bg-light hover:bg-grey-light text-grey-dark
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {isExpanded ? '▲ Weniger Details' : '▼ Mehr Details'}
        </button>
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
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-blue-900 mb-2">Kapazität</h4>
                <p className="text-sm text-blue-800">{capacity}</p>
              </div>
            )}
            {targetAudience && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-green-900 mb-2">Zielgruppe</h4>
                <p className="text-sm text-green-800">{targetAudience}</p>
              </div>
            )}
          </div>

          {/* SDGs */}
          {sdgs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-grey-dark mb-2">SDG-Beitrag</h4>
              <div className="flex flex-wrap gap-2">
                {sdgs.map((sdg, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gradient-to-br from-blue-600 to-blue-500 text-white text-xs font-semibold rounded-full"
                  >
                    {sdg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Estimated Cost */}
          {estimatedCost && (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-amber-900 mb-1">Geschätzte Kosten</h4>
              <p className="text-lg font-bold text-amber-800">{estimatedCost}</p>
              <p className="text-xs text-amber-700 mt-1">Einmalige Einrichtung + erstes Jahr Betrieb</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
