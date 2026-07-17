'use client';

/**
 * Pagination — numbered pages with ellipsis, mobile-first (44px targets,
 * compact on small screens: Prev/Next + current position always visible).
 */

interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
}

/** Visible page numbers: 1 … (p-1) p (p+1) … last */
function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, page - 1, page, page + 1, pageCount - 1, pageCount]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) items.push('gap');
    items.push(p);
    prev = p;
  }
  return items;
}

const BTN =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40';

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Seiten" className="mt-6 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Vorherige Seite"
        className={`${BTN} border-border-default bg-surface-base text-text-primary hover:bg-surface-raised`}
      >
        ←
      </button>

      {/* Numbered pages: desktop/tablet */}
      <div className="hidden items-center gap-1.5 sm:flex">
        {pageItems(page, pageCount).map((item, i) =>
          item === 'gap' ? (
            <span key={`gap-${i}`} className="px-1 text-text-muted" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`${BTN} ${
                item === page
                  ? 'border-primary bg-primary font-semibold text-white'
                  : 'border-border-default bg-surface-base text-text-primary hover:bg-surface-raised'
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      {/* Compact position: mobile */}
      <span className="px-2 text-sm tabular-nums text-text-secondary sm:hidden">
        {page} / {pageCount}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Nächste Seite"
        className={`${BTN} border-border-default bg-surface-base text-text-primary hover:bg-surface-raised`}
      >
        →
      </button>
    </nav>
  );
}
