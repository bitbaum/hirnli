'use client';

import Link from 'next/link';
import type { NavItem } from '@/lib/config/nav';
import { NAV_LINK_BASE, NAV_ITEM_BASE, activeClasses, isActive } from './nav-utils';
import { useNavDropdown } from './useNavDropdown';

export default function Dropdown({ item, pathname }: { item: NavItem; pathname: string }) {
  const { open, setOpen, wrapperRef, menuId, openMenu, scheduleClose, handleBlur, handleKeyDown } =
    useNavDropdown();

  return (
    <li
      ref={wrapperRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
      onBlurCapture={handleBlur}
      onKeyDown={handleKeyDown}
    >
      <button
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={`${NAV_LINK_BASE} ${activeClasses(false)}`}
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.text}
      </button>
      <div
        id={menuId}
        role="menu"
        className={`absolute left-0 top-full z-50 w-72 pt-3 transition-all duration-200 ${
          open
            ? 'visible opacity-100 translate-y-0'
            : 'invisible opacity-0 -translate-y-1'
        }`}
      >
        <div className="overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-revamp-blue to-revamp-green"></div>
          <div className="py-3">
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                className={`${NAV_ITEM_BASE} mx-2 my-1 ${
                  isActive(child.href, pathname)
                    ? 'border-l-revamp-blue bg-gradient-to-r from-blue-50 to-emerald-50'
                    : 'border-transparent'
                }`}
              >
                <span
                  className={`font-semibold group-hover/link:text-revamp-green ${
                    isActive(child.href, pathname)
                      ? 'text-revamp-blue'
                      : 'text-grey-dark'
                  }`}
                >
                  {child.text}
                </span>
                {child.desc && (
                  <span className="mt-0.5 block text-sm text-text-muted">
                    {child.desc}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
