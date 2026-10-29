#!/usr/bin/env node
/**
 * Hirnli's account journey, in a real browser against a running production
 * build. The fleet's shared journey does not fit this app: account mail is off
 * on purpose (every existing account is unverified) and people work inside
 * organisations, so this drives Hirnli's own pages instead.
 *
 *   BASE_URL=http://localhost:3000 DATABASE_URL=postgres://… node scripts/auth-journey.mjs
 *
 * Synthetic people only. Screenshots go to browser-smoke-artifacts/.
 */

import { mkdir } from 'node:fs/promises';
import pg from 'pg';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = 'browser-smoke-artifacts';
const run = Date.now().toString(36);
const EMAIL = `journey-${run}@example.test`;
const PASSWORD = `synthetic journey password ${run}`;

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};

async function noSidewaysScroll(page, name) {
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(overflow <= 0, `${name} at ${width}px has no sideways scroll (${overflow}px)`);
    await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
}

const session = (page) => page.evaluate(async () => (await fetch('/api/auth/get-session')).json());

async function signInFrom(origin) {
  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return res.status;
}

await mkdir(OUT, { recursive: true });
await db.connect();
const browser = await chromium.launch(
  process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {},
);
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  // Sign up through the page.
  await page.goto(`${BASE}/registrieren`);
  await noSidewaysScroll(page, 'registrieren');
  await page.getByLabel('Name').fill('Journey Person');
  await page.getByLabel('E-Mail-Adresse').fill(EMAIL);
  await page.getByLabel('Passwort').fill(PASSWORD);
  await page.getByRole('button', { name: 'Konto erstellen' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/registrieren'), { timeout: 20_000 });
  check((await session(page))?.user?.email === EMAIL, 'sign-up signs the person in');

  // Sign out (Hirnli has no button for it yet; the endpoint is the contract).
  const out = await page.evaluate(
    async () =>
      (
        await fetch('/api/auth/sign-out', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: '{}',
        })
      ).status,
  );
  check(out === 200 && (await session(page)) === null, 'sign-out ends the session');

  // A wrong password is refused on the sign-in page; the right one works.
  await page.goto(`${BASE}/anmelden`);
  await noSidewaysScroll(page, 'anmelden');
  await page.getByLabel('E-Mail-Adresse').fill(EMAIL);
  await page.getByLabel('Passwort').fill('not the password');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.getByRole('alert').waitFor({ timeout: 15_000 });
  check(
    new URL(page.url()).pathname === '/anmelden' && (await session(page)) === null,
    'a wrong password is refused',
  );
  await page.getByLabel('Passwort').fill(PASSWORD);
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/anmelden'), { timeout: 20_000 });
  check((await session(page))?.user?.email === EMAIL, 'sign-in with the right password works');

  // Create an organisation and reach its page.
  await page.goto(`${BASE}/organisation-erstellen`);
  await page.locator('input[name="name"]').fill(`Journey Verein ${run}`);
  await page.locator('input[name="legalForm"]').fill('Verein nach Art. 60 ff. ZGB');
  await page.locator('input[name="founded"]').fill('2026');
  await page.locator('input[name="location"]').fill('Zürich');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/o\/[^/]+$/, { timeout: 30_000 });
  const slug = new URL(page.url()).pathname.split('/')[2];
  const reached = await page.goto(`${BASE}/o/${slug}`);
  check(reached?.status() === 200, `the organisation page /o/${slug} opens`);
  await page.screenshot({ path: `${OUT}/organisation-390.png`, fullPage: true });
  const { rows: members } = await db.query(
    `SELECT m.role FROM org_members m JOIN organizations o ON o.id = m.organization_id
     JOIN users u ON u.id = m.user_id WHERE o.slug = $1 AND u.email = $2`,
    [slug, EMAIL],
  );
  check(members[0]?.role === 'owner', 'the creator owns the organisation');

  // A role in the sign-up body is ignored.
  const roleEmail = `role-${run}@example.test`;
  const signedUp = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { origin: BASE, 'content-type': 'application/json' },
    body: JSON.stringify({ email: roleEmail, password: PASSWORD, name: 'Role', role: 'admin' }),
  });
  const { rows: roles } = await db.query('SELECT role FROM users WHERE email = $1', [roleEmail]);
  check(
    signedUp.status !== 200 || roles[0]?.role === 'customer',
    `a role in the sign-up body is ignored (status ${signedUp.status}, role ${roles[0]?.role})`,
  );

  // A tenant host from org_domains passes the origin check; a stranger does not.
  const { rows: hosts } = await db.query('SELECT host FROM org_domains WHERE org_id = $1', [slug]);
  check(hosts.length > 0, 'creating the organisation recorded its host');
  if (hosts[0]) {
    check((await signInFrom(`https://${hosts[0].host}`)) === 200, `${hosts[0].host} may sign in`);
  }
  check((await signInFrom('https://foreign.example.test')) === 403, 'a foreign origin gets 403');
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
  console.error(error);
  await page.screenshot({ path: `${OUT}/failure.png`, fullPage: true }).catch(() => {});
} finally {
  await browser.close();
  await db.end();
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\naccount journey passed');
