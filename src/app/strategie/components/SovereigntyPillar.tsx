'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PILLAR_COLORS, type PillarColorScheme } from '../pillar-colors';

interface SovereigntyPillarProps {
  icon: string;
  title: string;
  description: string;
  colorScheme: PillarColorScheme;
  relatedPages?: Array<{
    title: string;
    href: string;
    reason: string;
  }>;
  achievements?: string[];
}

export default function SovereigntyPillar({
  icon,
  title,
  description,
  colorScheme,
  relatedPages = [],
  achievements = [],
}: SovereigntyPillarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = PILLAR_COLORS[colorScheme];

  return (
    <div
      className={`
        group relative rounded-xl border-2 p-5 text-center
        transition-reveal cursor-pointer
        ${colors.border} ${colors.borderHover} ${colors.bg} ${colors.bgHover}
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
      <h3 className={`heading-detail font-bold ${colors.text}`}>{title}</h3>
      <p className={`mt-1 text-sm ${colors.text}`}>{description}</p>

      {/* Expand indicator */}
      <div className={`mt-3 text-xs ${colors.text} flex items-center justify-center gap-1`}>
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
              <h4 className={`heading-detail ${colors.text} mb-2`}>Was wir erreicht haben:</h4>
              <ul className={`text-sm ${colors.text} space-y-1`}>
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
              <h4 className={`heading-detail ${colors.text} mb-2`}>Mehr erfahren:</h4>
              <div className="space-y-2">
                {relatedPages.map((page, idx) => (
                  <Link
                    key={idx}
                    href={page.href}
                    className={`
                      block p-2 rounded-lg bg-white/50 hover:bg-white
                      transition-standard
                      ${colors.ring} focus:outline-none focus:ring-2
                    `}
                  >
                    <div className={`heading-detail ${colors.text}`}>{page.title}</div>
                    <div className={`text-sm ${colors.text} mt-0.5`}>{page.reason}</div>
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
