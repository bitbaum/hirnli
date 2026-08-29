import type { ThemeId } from '@/lib/schemas/foundation';
import { THEMES } from '@/lib/config/foundations';
import { themeStyle } from '@/lib/utils/theme';

interface ThemeBadgeListProps {
  themeIds: ThemeId[];
  size?: 'sm' | 'md';
  /** "detailed" renders icon + label + description in a vertical list (used in FitAnalysis) */
  variant?: 'inline' | 'detailed';
}

export default function ThemeBadgeList({
  themeIds,
  size = 'md',
  variant = 'inline',
}: ThemeBadgeListProps) {
  if (variant === 'detailed') {
    return (
      <>
        {themeIds.map((themeId) => {
          const theme = THEMES[themeId];
          if (!theme) return null;
          return (
            <div key={themeId} className="flex items-center gap-2">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm"
                style={{ backgroundColor: themeStyle(theme.color).backgroundColor }}
              >
                {theme.icon}
              </span>
              <div>
                <span className="heading-detail">{theme.label}</span>
                <span className="block text-sm text-text-muted">{theme.description}</span>
              </div>
            </div>
          );
        })}
      </>
    );
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  return (
    <>
      {themeIds.map((themeId) => {
        const theme = THEMES[themeId];
        if (!theme) return null;
        return (
          <span
            key={themeId}
            className={`inline-flex items-center gap-1 rounded-full ${sizeClasses}`}
            style={themeStyle(theme.color)}
          >
            {theme.icon} {theme.label}
          </span>
        );
      })}
    </>
  );
}
