/**
 * Hirnli's sign-in on AccountKit, on its own identity migrations: a person
 * from before the move keeps their password and session, workspaces still run
 * on the organization plugin, and a tenant host stored as a row passes the
 * origin check while a stranger's does not. No production data.
 */

import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { hashPassword } from 'better-auth/crypto';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';

const SITE = 'https://hirnli.example.test';
const TENANT = 'https://tenant.example.test';
const state = vi.hoisted(() => {
  // Better Auth reads NODE_ENV once, at import, and skips its origin check
  // under "test" (or TEST, which Vitest sets) — which would let the last
  // test pass for the wrong reason.
  Object.assign(process.env, { NODE_ENV: 'development' });
  delete process.env.TEST;
  return { db: undefined as unknown };
});

vi.mock('@/lib/db/client', () => ({
  db: new Proxy({}, { get: (_, prop) => Reflect.get(state.db as object, prop) }),
}));

/** A migration as written, minus the box's ownership lines (no such role here). */
const migration = async (file: string) =>
  (await readFile(`src/lib/db/migrations/${file}`, 'utf8')).replace(
    /^ALTER TABLE .* OWNER TO .*;$/gm,
    '',
  );

const PASSWORD = 'synthetic existing password';
let pg: PGlite;

beforeAll(async () => {
  Object.assign(process.env, {
    BETTER_AUTH_URL: SITE,
    DATABASE_URL: 'postgres://synthetic',
    BETTER_AUTH_SECRET: 'synthetic-hirnli-auth-secret-at-least-32-chars',
  });
  pg = new PGlite();
  await pg.exec(await migration('0008_identity.sql'));
  // The columns 0017 adds, and the table 0016 adds, without the fundraising
  // tables they hang off.
  await pg.exec(`ALTER TABLE organizations ADD COLUMN kind text NOT NULL DEFAULT 'seeker';
    ALTER TABLE organizations ADD COLUMN foundation_id text;
    CREATE TABLE org_domains (host text PRIMARY KEY, org_id text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now());
    INSERT INTO org_domains (host, org_id) VALUES ('tenant.example.test', 'synthetic');`);
  await pg.exec(await migration('0018_accountkit_identity.sql'));
  // A person who signed up before the move, with Better Auth's own hash format.
  await pg.exec(
    `INSERT INTO users (id, name, email, email_verified) VALUES ('before', 'Before', 'before@example.test', false)`,
  );
  await pg.query(
    `INSERT INTO accounts (id, account_id, provider_id, user_id, password)
       VALUES ('before-credential', 'before', 'credential', 'before', $1)`,
    [await hashPassword(PASSWORD)],
  );
  state.db = drizzle(pg, { schema: await import('@/lib/db/schema') });
});

afterAll(async () => pg?.close());

const cookieOf = (response: Response) =>
  response.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');

async function call(path: string, body?: unknown, cookie = '', origin = SITE) {
  const { GET, POST } = await import('@/lib/auth/server');
  const request = new Request(`${SITE}/api/auth${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { origin, cookie, 'content-type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return body ? POST(request) : GET(request);
}

test('a person from before the move signs in with their password, under the same cookie name', async () => {
  expect(
    (await call('/sign-in/email', { email: 'before@example.test', password: 'wrong' })).status,
  ).toBe(401);
  const signedIn = await call('/sign-in/email', {
    email: 'before@example.test',
    password: PASSWORD,
  });
  expect(signedIn.status).toBe(200);
  const cookie = cookieOf(signedIn);
  expect(cookie).toMatch(/^better-auth\.session_token=/);
  const { getAuth } = await import('@/lib/auth/server');
  const session = await getAuth().api.getSession({ headers: new Headers({ cookie }) });
  expect(session?.user.id).toBe('before');
});

test('workspaces still run on the organization plugin, and sign-up never sets a role', async () => {
  const signedUp = await call('/sign-up/email', {
    email: 'owner@example.test',
    password: 'synthetic owner password',
    name: '',
    role: 'admin',
  });
  expect(signedUp.status).toBe(200);
  const cookie = cookieOf(signedUp);
  expect(
    (await call('/organization/create', { name: 'Synthetic', slug: 'synthetic' }, cookie)).status,
  ).toBe(200);
  expect(
    (
      (await (await call('/organization/list', undefined, cookie)).json()) as { slug: string }[]
    ).map((o) => o.slug),
  ).toEqual(['synthetic']);
  const { rows } = await pg.query(`SELECT role FROM users WHERE email = 'owner@example.test'`);
  expect(rows).toEqual([{ role: 'customer' }]);
  const members = await pg.query(`SELECT role FROM org_members`);
  expect(members.rows).toEqual([{ role: 'owner' }]);
});

test('a tenant host stored as a row passes the origin check; a stranger does not', async () => {
  const body = { email: 'before@example.test', password: PASSWORD };
  expect((await call('/sign-in/email', body, '', TENANT)).status).toBe(200);
  expect((await call('/sign-in/email', body, '', 'https://foreign.example.test')).status).toBe(403);
});
