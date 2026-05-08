export const NAV_LINK_BASE =
  'flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-success/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

export const NAV_ITEM_BASE =
  'group/link block rounded-lg border-l-3 px-3 py-2.5 text-sm transition-all hover:border-l-revamp-green hover:bg-gradient-to-r hover:from-success/5 hover:to-primary/5 hover:pl-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export function activeClasses(active: boolean) {
  return active
    ? 'gradient-nav-active text-primary'
    : 'text-grey-dark';
}

export function isActive(href: string | undefined, pathname: string): boolean {
  if (!href || href === '#' || href.startsWith('http')) return false;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
