'use client';

import Link from 'next/link';
import { useId } from 'react';
import type { NavItem } from '@/lib/config/nav';
import { isActive } from './nav-utils';

export default function MobileAccordion({
  item,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const panelId = useId();
  const hasChildren = !!(item.children || item.sections);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href || '#'}
          className="flex min-h-11 items-center py-2 text-sm font-medium text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={onNavigate}
        >
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.text}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center">
        {item.href ? (
          <Link
            href={item.href}
            className="flex min-h-11 flex-1 items-center py-2 text-sm font-medium text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={onNavigate}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.text}
          </Link>
        ) : (
          <span className="flex min-h-11 flex-1 items-center py-2 text-sm font-medium text-grey-dark">
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.text}
          </span>
        )}
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="flex min-h-11 min-w-11 items-center justify-center rounded text-text-muted hover:text-grey-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`${item.text} ${expanded ? 'zuklappen' : 'aufklappen'}`}
        >
          <span
            className={`text-xs transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          >
            ▸
          </span>
        </button>
      </div>

      <div
        id={panelId}
        role="region"
        aria-label={item.text}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="ml-4 space-y-1 pb-2">
            {item.children?.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={`block min-h-11 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive(child.href, pathname)
                      ? 'font-medium text-primary'
                      : 'text-text-light'
                  }`}
                  onClick={onNavigate}
                >
                  {child.text}
                </Link>
              </li>
            ))}
            {item.sections?.map((section) => (
              <li key={section.title} className="mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.title}
                </span>
                <ul className="mt-1 space-y-1">
                  {section.items
                    .filter((l) => !l.external)
                    .map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`block min-h-11 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isActive(link.href, pathname)
                              ? 'font-medium text-primary'
                              : 'text-text-light'
                          }`}
                          onClick={onNavigate}
                        >
                          {link.text}
                          {link.desc && (
                            <span className="block text-sm text-text-muted">
                              {link.desc}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
