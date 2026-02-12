'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    border: 'border-emerald-200',
    borderHover: 'hover:border-emerald-400',
    bg: 'bg-emerald-50',
    bgHover: 'hover:bg-emerald-100',
    text: 'text-emerald-800',
    textLight: 'text-emerald-700',
    accent: 'bg-emerald-500',
    ring: 'focus:ring-emerald-500',
  },
  blue: {
    border: 'border-blue-200',
    borderHover: 'hover:border-blue-400',
    bg: 'bg-blue-50',
    bgHover: 'hover:bg-blue-100',
    text: 'text-blue-800',
    textLight: 'text-blue-700',
    accent: 'bg-blue-500',
    ring: 'focus:ring-blue-500',
  },
  violet: {
    border: 'border-violet-200',
    borderHover: 'hover:border-violet-400',
    bg: 'bg-violet-50',
    bgHover: 'hover:bg-violet-100',
    text: 'text-violet-800',
    textLight: 'text-violet-700',
    accent: 'bg-violet-500',
    ring: 'focus:ring-violet-500',
  },
  amber: {
    border: 'border-amber-200',
    borderHover: 'hover:border-amber-400',
    bg: 'bg-amber-50',
    bgHover: 'hover:bg-amber-100',
    text: 'text-amber-800',
    textLight: 'text-amber-700',
    accent: 'bg-amber-500',
    ring: 'focus:ring-amber-500',
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
        transition-all duration-300
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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          mt-4 w-full py-2 px-4 rounded-lg
          text-sm font-semibold
          transition-all duration-200
          ${colors.text} bg-white
          hover:shadow-md
          ${colors.ring} focus:outline-none focus:ring-2
        `}
      >
        {isExpanded ? '▲ Weniger anzeigen' : '▼ Mehr erfahren'}
      </button>

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
                      hover:shadow-md transition-all duration-200
                      ${colors.ring} focus:outline-none focus:ring-2
                    `}
                  >
                    <div className={`text-sm font-semibold ${colors.text}`}>{page.title}</div>
                    <div className={`text-xs ${colors.textLight} mt-1`}>{page.reason}</div>
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
