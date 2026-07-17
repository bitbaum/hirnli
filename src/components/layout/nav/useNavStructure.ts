'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  buildNavStructure,
  type NavItem,
  type NavItemConfig,
  type NavLink,
  type NavLinkConfig,
} from '@/lib/config/nav';

/**
 * Resolves the structural nav config (msg keys + interpolation values) into
 * fully localized NavItems. Menu components render the resolved shape and
 * stay locale-agnostic; strings live only in messages/{locale}.json.
 */
export function useNavStructure(stiftungenCount: number): NavItem[] {
  const t = useTranslations('nav');

  return useMemo(() => {
    const NAV_STRUCTURE = buildNavStructure(stiftungenCount);
    const link = (l: NavLinkConfig): NavLink => ({
      text: t(`${l.msg}.label`, l.values),
      desc: l.hasDesc ? t(`${l.msg}.desc`, l.values) : undefined,
      href: l.href,
      external: l.external,
      highlight: l.highlight,
    });

    const item = (i: NavItemConfig): NavItem => ({
      text: t(`${i.msg}.label`),
      href: i.href,
      icon: i.icon,
      mega: i.mega,
      children: i.children?.map(link),
      sections: i.sections?.map((s) => ({
        title: t(`${s.msg}.label`),
        items: s.items.map(link),
      })),
    });

    return NAV_STRUCTURE.items.map(item);
  }, [t, stiftungenCount]);
}
