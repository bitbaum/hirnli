'use client';

/**
 * Switching organisation is a NAVIGATION, not a state change.
 *
 * The obvious implementation calls `setActiveOrganization()` and re-renders.
 * That writes the choice into the session, which every tab shares — so
 * switching to evig here would silently move a Revamp-IT tab you left open,
 * and the next thing you saved there would land on the wrong customer.
 *
 * Rendering plain links to `/o/<slug>` keeps the choice in the URL: two tabs,
 * two organisations, no interference. It also means middle-click and
 * "open in new tab" do the obviously right thing, which a button cannot.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Org = { id: string; slug: string; name: string; role: string };

export function OrgSwitcher({
  current,
  organizations,
}: {
  current: { slug: string; name: string };
  organizations: Org[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Keep the reader on the same page in the other organisation where the route
  // shape allows it, rather than always dropping them at that org's root.
  const suffix = pathname.replace(/^\/o\/[^/]+/, '');
  const others = organizations.filter((o) => o.slug !== current.slug);

  if (others.length === 0) {
    return <span className="font-semibold text-text-primary">{current.name}</span>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-text-primary hover:bg-surface-raised"
      >
        {current.name}
        <span aria-hidden="true" className="text-text-muted">
          ▾
        </span>
      </button>

      {open && (
        <ul
          role="menu"
          className="absolute left-0 top-full z-40 mt-1 min-w-56 overflow-hidden rounded-lg border border-border-default bg-surface-base shadow-lg"
        >
          {others.map((o) => (
            <li key={o.id} role="none">
              <Link
                role="menuitem"
                href={`/o/${o.slug}${suffix}`}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-between gap-4 px-4 hover:bg-surface-raised hover:no-underline"
              >
                <span className="text-text-primary">{o.name}</span>
                <span className="text-xs text-text-muted">{o.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
