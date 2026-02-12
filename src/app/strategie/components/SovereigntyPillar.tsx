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
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-800',
    textLight: 'text-emerald-700',
    gradient: 'from-emerald-500 to-emerald-600',
    ring: 'focus:ring-emerald-500',
  },
  blue: {
    border: 'border-blue-200 hover:border-blue-400',
    bg: 'bg-blue-50 hover:bg-blue-100',
    text: 'text-blue-800',
    textLight: 'text-blue-700',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'focus:ring-blue-500',
  },
  violet: {
    border: 'border-violet-200 hover:border-violet-400',
    bg: 'bg-violet-50 hover:bg-violet-100',
    text: 'text-violet-800',
    textLight: 'text-violet-700',
    gradient: 'from-violet-500 to-violet-600',
    ring: 'focus:ring-violet-500',
  },
  amber: {
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-800',
    textLight: 'text-amber-700',
    gradient: 'from-amber-500 to-amber-600',
    ring: 'focus:ring-amber-500',
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
      <p className={`mt-1 text-xs ${colors.textLight}`}>{description}</p>

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
              <h4 className={`text-xs font-semibold ${colors.text} mb-2`}>Was wir erreicht haben:</h4>
              <ul className={`text-xs ${colors.textLight} space-y-1`}>
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
              <h4 className={`text-xs font-semibold ${colors.text} mb-2`}>Mehr erfahren:</h4>
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
                    <div className={`text-xs font-semibold ${colors.text}`}>{page.title}</div>
                    <div className={`text-xs ${colors.textLight} mt-0.5`}>{page.reason}</div>
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
