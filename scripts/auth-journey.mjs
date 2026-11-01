#!/usr/bin/env node
/**
 * Hirnli's account journey, in a real browser against a running production
 * build. People work inside organisations, so this drives Hirnli's own pages
 * instead of the fleet's shared journey.
 *
 * It first checks that the sign-in and sign-up screens offer every way in the
 * env switches on, read from the same env the server has (AccountKit's
 * signInMethods): email and password and a passkey always; the sign-in link
 * only with account mail (RESEND_API_KEY); "Weiter mit OrangeCat" with
 * ORANGECAT_OAUTH_*; the shared sign-in with SIGNIN_*. CI sets synthetic OIDC
 * clients so both buttons are asserted; nothing is clicked through.
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

/**
 * Click "Abmelden", land on /anmelden, and prove the sign-out stuck.
 *
 * A session that comes back is the failure to catch: Kivvi's journey found a
 * prefetch that started before the sign-out and answered after it, writing the
 * session cookie back (kivvi #201). So this waits for the network to go quiet,
 * reloads, and asks the server again — and a signed-in-only page must still
 * send the person to the sign-in page.
 */
async function signOutWithButton(where) {
  const button = page.getByRole('button', { name: 'Abmelden', exact: true });
  check(await button.isVisible(), `the ${where} shows an Abmelden button`);
  await page.screenshot({ path: `${OUT}/signout-${where.replace(/\s+/g, '-')}-390.png` });
  await button.click();
  await page.waitForURL((url) => url.pathname === '/anmelden', { timeout: 20_000 });
  check((await session(page)) === null, `Abmelden in the ${where} ends the session`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1_500);
  await page.reload();
  check((await session(page)) === null, `after a reload the person is still signed out (${where})`);
  const cookies = (await page.context().cookies()).filter((c) => /session_token/.test(c.name));
  check(cookies.length === 0, `no session cookie is left in the browser (${where})`);
  await page.goto(`${BASE}/start`);
  check(
    new URL(page.url()).pathname === '/anmelden',
    `a signed-in-only page sends the person to sign in (${where})`,
  );
  check(
    (await page.getByRole('button', { name: 'Abmelden', exact: true }).count()) === 0,
    `the signed-out nav offers no Abmelden (${where})`,
  );
}

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

const { authLabelsFor, signInMethods } = await import('@bitbaum/accountkit/auth');
const labels = authLabelsFor('de');
const mailKey = (process.env.RESEND_API_KEY ?? '').trim();
const expected = signInMethods(
  process.env,
  Boolean(mailKey) && !mailKey.startsWith('re_placeholder'),
);
const shows = (name) =>
  page
    .getByRole('button', { name, exact: true })
    .first()
    .isVisible({ timeout: 10_000 })
    .catch(() => false);
const submit = () =>
  page
    .locator('form')
    .filter({ has: page.locator('#acct-password') })
    .locator('button[type="submit"]');

try {
  // Every way in this deployment switches on is offered, and nothing else.
  for (const path of ['/anmelden', '/registrieren']) {
    await page.goto(`${BASE}${path}`);
    await page.locator('#acct-email').waitFor({ state: 'visible', timeout: 20_000 });
    check(await page.locator('#acct-password').isVisible(), `${path} offers email and password`);
    for (const [on, name] of [
      [expected.orangecat, labels.withOrangecat],
      [expected.signin, labels.withSignin],
    ]) {
      check((await shows(name)) === on, `${path} ${on ? 'shows' : 'hides'} «${name}»`);
    }
  }
  await page.goto(`${BASE}/anmelden`);
  check(await shows(labels.withPasskey), '/anmelden offers a passkey');
  check(
    (await shows(labels.withLink)) === expected.magicLink,
    `/anmelden ${expected.magicLink ? 'offers' : 'hides'} the sign-in link (account mail ${expected.magicLink ? 'on' : 'off'})`,
  );

  // Sign up through the page.
  await page.goto(`${BASE}/registrieren`);
  await noSidewaysScroll(page, 'registrieren');
  await page.locator('#acct-email').fill(EMAIL);
  await page.locator('#acct-password').fill(PASSWORD);
  await submit().click();
  await page.waitForURL((url) => !url.pathname.startsWith('/registrieren'), { timeout: 20_000 });
  check((await session(page))?.user?.email === EMAIL, 'sign-up signs the person in');

  // Sign out with the button in the platform nav, and stay signed out.
  await signOutWithButton('platform nav');

  // A wrong password is refused on the sign-in page; the right one works.
  await page.goto(`${BASE}/anmelden`);
  await noSidewaysScroll(page, 'anmelden');
  await page.locator('#acct-email').fill(EMAIL);
  await page.locator('#acct-password').fill('not the password');
  await submit().click();
  await page.getByRole('alert').waitFor({ timeout: 15_000 });
  check(
    new URL(page.url()).pathname === '/anmelden' && (await session(page)) === null,
    'a wrong password is refused',
  );
  await page.locator('#acct-password').fill(PASSWORD);
  await submit().click();
  await page.waitForURL((url) => !url.pathname.startsWith('/anmelden'), { timeout: 20_000 });
  check((await session(page))?.user?.email === EMAIL, 'sign-in with the right password works');

  // The account page offers passkeys and the second factor.
  await page.goto(`${BASE}/konto`);
  for (const title of [labels.account.passkeys, labels.account.twoFactor]) {
    check(
      await page
        .getByRole('heading', { name: title, exact: true })
        .isVisible({ timeout: 15_000 })
        .catch(() => false),
      `/konto offers «${title}»`,
    );
  }
  await noSidewaysScroll(page, 'konto');

  // Create an organisation and reach its page.
  await page.goto(`${BASE}/organisation-erstellen`);
  await page.locator('input[name="name"]').fill(`Journey Verein ${run}`);
  await page.locator('input[name="legalForm"]').fill('Verein nach Art. 60 ff. ZGB');
  await page.locator('input[name="founded"]').fill('2026');
  await page.locator('input[name="location"]').fill('Zürich');
  await page.getByRole('button', { name: 'Organisation erstellen' }).click();
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

  // Sign out with the button in the organisation header, too.
  await signOutWithButton('organisation header');

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
