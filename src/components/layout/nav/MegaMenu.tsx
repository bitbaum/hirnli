'use client';

import Link from 'next/link';
import type { NavItem, NavSection } from '@/lib/config/nav';
import { NAV_LINK_BASE, NAV_ITEM_BASE, activeClasses, isActive } from './nav-utils';
import { useNavDropdown } from './useNavDropdown';

export default function MegaMenu({ item, pathname }: { item: NavItem; pathname: string }) {
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
      <Link
        href={item.href || '#'}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(e) => {
          if (!item.href || item.href === '#') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`${NAV_LINK_BASE} ${activeClasses(isActive(item.href, pathname))}`}
      >
        {item.icon && <span className="text-lg">{item.icon}</span>}
        {item.text}
      </Link>
      <div
        id={menuId}
        role="menu"
        className={`absolute left-1/2 top-full z-50 w-[640px] max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-3 transition-all duration-200 ${
          open
            ? 'visible opacity-100 translate-y-0'
            : 'invisible opacity-0 -translate-y-1'
        }`}
      >
        <div className="overflow-hidden rounded-xl border-2 border-success/20 bg-white shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-revamp-blue via-revamp-green to-revamp-orange"></div>
          <div className="grid grid-cols-2 gap-8 p-8">
            {item.sections?.map((section: NavSection) => (
              <div key={section.title} role="group" aria-label={section.title}>
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-revamp-blue to-revamp-green"></div>
                  <span className="text-sm font-bold uppercase tracking-wider text-revamp-blue">
                    {section.title}
                  </span>
                </div>
                <ul className="space-y-2" role="none">
                  {section.items.map((link) => (
                    <li key={link.href} role="none">
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                          className={`${NAV_ITEM_BASE} border-transparent`}
                        >
                          <span className="font-semibold text-grey-dark group-hover/link:text-revamp-green">
                            {link.text}
                          </span>
                          {link.desc && (
                            <span className="block text-sm text-text-muted">
                              {link.desc}
                            </span>
                          )}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          role="menuitem"
                          className={`${NAV_ITEM_BASE} ${
                            link.highlight
                              ? 'border-l-revamp-orange bg-gradient-to-r from-orange-50 to-yellow-50'
                              : 'border-transparent'
                          } ${
                            isActive(link.href, pathname)
                              ? 'border-l-revamp-blue bg-gradient-to-r from-blue-50 to-emerald-50'
                              : ''
                          }`}
                        >
                          <span
                            className={`font-semibold group-hover/link:text-revamp-green ${
                              link.highlight
                                ? 'text-revamp-orange'
                                : 'text-grey-dark'
                            } ${
                              isActive(link.href, pathname)
                                ? 'text-revamp-blue'
                                : ''
                            }`}
                          >
                            {link.text}
                          </span>
                          {link.desc && (
                            <span className="block text-sm text-text-muted">
                              {link.desc}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
