'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PILLAR_COLORS, type PillarColorScheme } from '../pillar-colors';

interface PillarDetailProps {
  icon: string;
  title: string;
  description: string;
  colorScheme: PillarColorScheme;
  activities: string[];
  whyItMatters: string;
  achievements: string[];
  relatedPages?: Array<{
    title: string;
    href: string;
    reason: string;
  }>;
}

export default function PillarDetail({
  icon,
  title,
  description,
  colorScheme,
  activities,
  whyItMatters,
  achievements,
  relatedPages = [],
}: PillarDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = PILLAR_COLORS[colorScheme];

  return (
    <div
      className={`
        rounded-xl border-2 p-6
        transition-reveal
        ${colors.border} ${colors.borderHover}
        ${colors.bg} ${colors.bgHover}
        ${isExpanded ? 'shadow-lg' : 'shadow-sm'}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="text-5xl flex-shrink-0">{icon}</span>
        <div className="flex-1">
          <h3 className={`heading-card font-bold ${colors.text} mb-2`}>{title}</h3>
          <p className={`text-sm ${colors.text}`}>{description}</p>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mt-4 bg-white hover:shadow-md ${colors.text}`}
      >
        {isExpanded ? '▲ Weniger anzeigen' : '▼ Mehr erfahren'}
      </Button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* Activities */}
          <div>
            <h4 className={`heading-detail font-bold ${colors.text} mb-3 flex items-center gap-2`}>
              <span className={`w-1 h-4 ${colors.accent} rounded`} />
              Was wir tun
            </h4>
            <ul className={`space-y-2 ${colors.text} text-sm`}>
              {activities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-lg">→</span>
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why It Matters */}
          <div>
            <h4 className={`heading-detail font-bold ${colors.text} mb-3 flex items-center gap-2`}>
              <span className={`w-1 h-4 ${colors.accent} rounded`} />
              Warum das wichtig ist
            </h4>
            <p className={`text-sm ${colors.text} leading-relaxed`}>{whyItMatters}</p>
          </div>

          {/* Achievements */}
          <div>
            <h4 className={`heading-detail font-bold ${colors.text} mb-3 flex items-center gap-2`}>
              <span className={`w-1 h-4 ${colors.accent} rounded`} />
              Was wir erreicht haben
            </h4>
            <ul className={`space-y-2 ${colors.text} text-sm`}>
              {achievements.map((achievement, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span>✓</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Related Pages */}
          {relatedPages.length > 0 && (
            <div>
              <h4 className={`heading-detail font-bold ${colors.text} mb-3 flex items-center gap-2`}>
                <span className={`w-1 h-4 ${colors.accent} rounded`} />
                Mehr erfahren
              </h4>
              <div className="space-y-2">
                {relatedPages.map((page, idx) => (
                  <Link
                    key={idx}
                    href={page.href}
                    className={`
                      block p-3 rounded-lg bg-white
                      hover:shadow-md transition-hover
                      ${colors.ring} focus:outline-none focus:ring-2
                    `}
                  >
                    <div className={`text-sm font-semibold ${colors.text}`}>{page.title}</div>
                    <div className={`text-sm ${colors.text} mt-1`}>{page.reason}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
