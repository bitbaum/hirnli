/**
 * Site-wide Open Graph image (1200×630) — what a shared link shows in
 * WhatsApp/Slack/LinkedIn/email previews. First impression happens HERE,
 * before anyone opens the site.
 *
 * All content from the request's tenant plus SHARED_ORG_NUMBERS — no hardcoded
 * stats. Colors mirror the globals.css brand tokens (OG images can't read
 * CSS vars, so the two hex values are intentional duplicates of
 * --color-revamp-green / --color-grey-dark).
 */

import { ImageResponse } from 'next/og';
import { getTenant } from '@/lib/tenant/resolve';
import { PLATFORM_BRAND } from '@/lib/config/platform-brand';
import { SHARED_ORG_NUMBERS } from '@/lib/config/shared-org-numbers.generated';

// `alt` is a static export and cannot await a tenant. It is the accessibility
// text for the preview image, not a claim about who published it, so it says
// what the image is rather than naming the wrong organisation.
export const alt = 'Transparentes Fundraising';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const GREEN = '#2ECC71';
const DARK = '#111827';

export default async function OpenGraphImage() {
  // The link preview is the first impression, and every tenant's link showed
  // the first tenant's name and founding year.
  const tenant = await getTenant();

  const stats = [
    `Gemeinnützig seit ${tenant.founded}`,
    // Plain "CO2": the OG default font has no U+2082 subscript glyph
    `${SHARED_ORG_NUMBERS.CO2_SAVED_PER_LAPTOP} kg CO2 pro Gerät gespart`,
    `${SHARED_ORG_NUMBERS.REUSE_RATE}% Reuse-Rate`,
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: DARK,
        backgroundImage: `radial-gradient(circle at 85% 15%, rgba(46, 204, 113, 0.18), transparent 55%)`,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: GREEN,
          }}
        />
        <div style={{ fontSize: 30, color: GREEN, fontWeight: 700 }}>{PLATFORM_BRAND.name}</div>
        <div style={{ fontSize: 30, color: '#9CA3AF' }}>{PLATFORM_BRAND.tagline}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 92, fontWeight: 800, color: '#F9FAFB', lineHeight: 1.05 }}>
          {tenant.name}
        </div>
        <div style={{ fontSize: 40, color: '#D1D5DB', maxWidth: 980 }}>
          Transparentes Fundraising — alle Zahlen belegbar, jede Quelle nachvollziehbar.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {stats.map((s) => (
          <div
            key={s}
            style={{
              display: 'flex',
              fontSize: 26,
              color: '#E5E7EB',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              padding: '14px 28px',
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
