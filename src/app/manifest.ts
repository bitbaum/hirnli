import type { MetadataRoute } from 'next';

import { PLATFORM_BRAND } from '@/lib/config/platform-brand';

/**
 * The web app manifest. Without it Android and desktop browsers never offer
 * "Install app", so the site could only be pinned as a bookmark. The PNGs in
 * public/app-icons/ are rasterised from public/favicon.ico (the platform icon) (192, 512, and a maskable 512
 * with the icon inside the 80% safe zone); regenerate them when it changes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PLATFORM_BRAND.name} — ${PLATFORM_BRAND.tagline}`,
    short_name: PLATFORM_BRAND.name,
    description:
      'Die Fundraising-Plattform: Projektdaten aufbereiten, passende Stiftungen finden, Gesuche erstellen.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/app-icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/app-icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
