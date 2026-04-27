'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SovereigntyPillarProps {
  icon: string;
  title: string;
  description: string;
  colorScheme: 'emerald' | 'blue' | 'violet' | 'amber';
  relatedPages?: Array<{
    title: string;
    href: string;
    reason: string;
  }>;
  achievements?: string[];
}

const colorConfig = {
  emerald: {
    border: 'border-success/20 hover:border-success',
    bg: 'bg-success/10 hover:bg-success/15',
    text: 'text-success',
    textLight: 'text-success',
    gradient: 'from-success to-success',
    ring: 'focus:ring-success',
  },
  blue: {
    border: 'border-primary/20 hover:border-primary',
    bg: 'bg-primary/10 hover:bg-primary/15',
    text: 'text-primary',
    textLight: 'text-primary',
    gradient: 'from-primary to-primary',
    ring: 'focus:ring-primary',
  },
  violet: {
    border: 'border-pillar-vision/20 hover:border-pillar-vision/60',
    bg: 'bg-pillar-vision/10 hover:bg-pillar-vision/15',
    text: 'text-pillar-vision',
    textLight: 'text-pillar-vision',
    gradient: 'from-pillar-vision to-pillar-vision',
    ring: 'focus:ring-pillar-vision',
  },
  amber: {
    border: 'border-warning/20 hover:border-warning',
    bg: 'bg-warning/10 hover:bg-warning/15',
    text: 'text-warning',
    textLight: 'text-warning',
    gradient: 'from-warning to-warning',
    ring: 'focus:ring-warning',
  },
};

export default function SovereigntyPillar({
  icon,
  title,
  description,
  colorScheme,
  relatedPages = [],
  achievements = [],
}: SovereigntyPillarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = colorConfig[colorScheme];

  return (
    <div
      className={`
        group relative rounded-xl border-2 p-5 text-center
        transition-all duration-300 cursor-pointer
        ${colors.border} ${colors.bg}
        transform hover:scale-105 hover:shadow-lg
      `}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
      aria-expanded={isExpanded}
    >
      {/* Icon & Title */}
      <span className="mb-2 block text-3xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <h3 className={`text-sm font-bold ${colors.text}`}>{title}</h3>
      <p className={`mt-1 text-sm ${colors.textLight}`}>{description}</p>

      {/* Expand indicator */}
      <div className={`mt-3 text-xs ${colors.textLight} flex items-center justify-center gap-1`}>
        <span>{isExpanded ? '▲' : '▼'}</span>
        <span>{isExpanded ? 'Weniger' : 'Mehr'}</span>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-current/20 text-left space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Achievements */}
          {achievements.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>Was wir erreicht haben:</h4>
              <ul className={`text-sm ${colors.textLight} space-y-1`}>
                {achievements.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>✓</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related pages */}
          {relatedPages.length > 0 && (
            <div>
              <h4 className={`text-sm font-semibold ${colors.text} mb-2`}>Mehr erfahren:</h4>
              <div className="space-y-2">
                {relatedPages.map((page, idx) => (
                  <Link
                    key={idx}
                    href={page.href}
                    className={`
                      block p-2 rounded-lg bg-white/50 hover:bg-white
                      transition-colors duration-200
                      ${colors.ring} focus:outline-none focus:ring-2
                    `}
                  >
                    <div className={`text-sm font-semibold ${colors.text}`}>{page.title}</div>
                    <div className={`text-sm ${colors.textLight} mt-0.5`}>{page.reason}</div>
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
