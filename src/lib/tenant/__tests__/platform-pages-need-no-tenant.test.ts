/**
 * The platform's own pages must render on a host that is not a tenant.
 *
 * `getTenant()` sends an unresolved host to the marketing page, which is right
 * for anything a TENANT renders. The root layout is not that: it wraps the
 * platform pages too — `/registrieren`, `/anmelden`, `/plattform` — and the
 * platform host is deliberately absent from `org_domains`.
 *
 * The bug this pins was close to invisible. `generateMetadata` called
 * `getTenant()`, so the page body streamed first and the response committed
 * 200 with the real HTML; the redirect only reached the client afterwards
 * inside the RSC stream. `curl https://hirnli.orangecat.ch/registrieren`
 * returned 200 WITH the sign-up form, every status check stayed green, and no
 * browser could show the page — sign-up was unreachable from the product's own
 * front door for as long as that was true.
 *
 * So this asserts at the IMPORT. A test that only checked the redirect helper
 * would still pass while a caller went around it, and a test that fetched the
 * page would have to be a browser to see the failure at all.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootLayout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf-8');
const resolveSource = readFileSync(join(process.cwd(), 'src/lib/tenant/resolve.ts'), 'utf-8');

/**
 * Comments legitimately NAME the redirecting accessor to explain why it is not
 * used here, and the first draft of this test failed on its own prose. Assert
 * against code only.
 */
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const layoutCode = stripComments(rootLayout);

describe('the root layout resolves its tenant without redirecting', () => {
  it('imports the nullable accessor, not the redirecting one', () => {
    expect(rootLayout).toMatch(
      /import \{[^}]*\bgetTenantOrNull\b[^}]*\} from '@\/lib\/tenant\/resolve'/,
    );
  });

  it('does not import getTenant or getCurrentOrgId', () => {
    // Word-boundary on both sides so `getTenantOrNull` does not satisfy it.
    expect(layoutCode).not.toMatch(/\bgetTenant\b(?!OrNull)/);
    expect(layoutCode).not.toMatch(/\bgetCurrentOrgId\b/);
  });

  it('guards every use of the tenant it got back', () => {
    // `tenant` is nullable here, so each read must be optional or inside the
    // truthy branch of the ternary that picks the platform title.
    const unguarded = [...layoutCode.matchAll(/(?<![?.\w])tenant\.\w+/g)]
      .filter((m) => {
        const line = layoutCode.slice(0, m.index).split('\n').pop() ?? '';
        return !line.includes('?');
      })
      .map((m) => m[0]);
    expect(unguarded).toEqual([]);
  });
});

describe('resolve.ts keeps both answers available', () => {
  it('exports a nullable accessor that does not redirect', () => {
    expect(resolveSource).toMatch(/export const getTenantOrNull/);
  });

  it('still redirects for tenant pages via getCurrentOrgId', () => {
    expect(resolveSource).toMatch(
      /export const getCurrentOrgId[\s\S]{0,240}redirect\(PLATFORM_BRAND\.marketingPath\)/,
    );
  });
});
