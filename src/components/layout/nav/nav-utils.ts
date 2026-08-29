export const NAV_LINK_BASE =
  'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

export const NAV_ITEM_BASE =
  'group/link block rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface-raised hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export function activeClasses(active: boolean) {
  return active ? 'bg-surface-raised text-text-primary font-semibold' : '';
}

export function isActive(href: string | undefined, pathname: string): boolean {
  if (!href || href === '#' || href.startsWith('http')) return false;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}
