'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface PillarDetailProps {
  icon: string;
  title: string;
  description: string;
  colorScheme: 'emerald' | 'blue' | 'violet' | 'amber';
  activities: string[];
  whyItMatters: string;
  achievements: string[];
  relatedPages?: Array<{
    title: string;
    href: string;
    reason: string;
  }>;
}

const colorConfig = {
  emerald: {
    border: 'border-success/20',
    borderHover: 'hover:border-success',
    bg: 'bg-success/10',
    bgHover: 'hover:bg-success/15',
    text: 'text-success',
    textLight: 'text-success',
    accent: 'bg-success',
    ring: 'focus:ring-success',
  },
  blue: {
    border: 'border-primary/20',
    borderHover: 'hover:border-primary',
    bg: 'bg-primary/10',
    bgHover: 'hover:bg-primary/15',
    text: 'text-primary',
    textLight: 'text-primary',
    accent: 'bg-primary',
    ring: 'focus:ring-primary',
  },
  violet: {
    border: 'border-pillar-vision/20',
    borderHover: 'hover:border-pillar-vision/60',
    bg: 'bg-pillar-vision/10',
    bgHover: 'hover:bg-pillar-vision/15',
    text: 'text-pillar-vision',
    textLight: 'text-pillar-vision',
    accent: 'bg-pillar-vision',
    ring: 'focus:ring-pillar-vision',
  },
  amber: {
    border: 'border-warning/20',
    borderHover: 'hover:border-warning',
    bg: 'bg-warning/10',
    bgHover: 'hover:bg-warning/15',
    text: 'text-warning',
    textLight: 'text-warning',
    accent: 'bg-warning',
    ring: 'focus:ring-warning',
  },
};

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
  const colors = colorConfig[colorScheme];

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
          <h3 className={`text-lg font-bold ${colors.text} mb-2`}>{title}</h3>
          <p className={`text-sm ${colors.textLight}`}>{description}</p>
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
            <h4 className={`text-sm font-bold ${colors.text} mb-3 flex items-center gap-2`}>
              <span className={`w-1 h-4 ${colors.accent} rounded`} />
              Was wir tun
            </h4>
            <ul className={`space-y-2 ${colors.textLight} text-sm`}>
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
            <h4 className={`text-sm font-bold ${colors.text} mb-3 flex items-center gap-2`}>
              <span className={`w-1 h-4 ${colors.accent} rounded`} />
              Warum das wichtig ist
            </h4>
            <p className={`text-sm ${colors.textLight} leading-relaxed`}>{whyItMatters}</p>
          </div>

          {/* Achievements */}
          <div>
            <h4 className={`text-sm font-bold ${colors.text} mb-3 flex items-center gap-2`}>
              <span className={`w-1 h-4 ${colors.accent} rounded`} />
              Was wir erreicht haben
            </h4>
            <ul className={`space-y-2 ${colors.textLight} text-sm`}>
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
              <h4 className={`text-sm font-bold ${colors.text} mb-3 flex items-center gap-2`}>
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
                    <div className={`text-sm ${colors.textLight} mt-1`}>{page.reason}</div>
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
