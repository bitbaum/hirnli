/**
 * Make an existing account the owner of an existing organisation.
 *
 * ── WHY THIS EXISTS ──────────────────────────────────────────────────────────
 * `provisionOrganization` creates the organisation and its owner membership in
 * one transaction, so anything created through the product is fine. The gap is
 * organisations that predate that: both current customers were created before
 * membership was, so they have zero members — and an organisation with no
 * members has nobody who could invite the first one. The account area is
 * unreachable for them until somebody breaks the cycle from outside.
 *
 * ── WHY NOT A CLAIM BUTTON ───────────────────────────────────────────────────
 * The obvious self-serve version — "if your signed-in email matches the address
 * on the organisation's profile, claim it" — is unsafe here. Better Auth runs
 * with `requireEmailVerification: false`, so an address proves nothing: whoever
 * registers it first would take the organisation. Kivvi, which has the same
 * model and the same lack of verification, also has no claim flow and does this
 * out of band. So this is deliberate, not a shortcut.
 *
 * ── SAFETY ───────────────────────────────────────────────────────────────────
 * Idempotent, and refuses rather than guesses: it will not create the account,
 * will not invent an organisation, and will not silently change an existing
 * membership's role. Run it after the person has registered themselves.
 *
 *   pnpm tsx scripts/attach-owner.ts <email> <org-slug> [<org-slug>…]
 */

import { query } from './lib/db';

interface UserRow {
  id: string;
  email: string;
}
interface OrgRow {
  id: string;
  slug: string;
  name: string;
}
interface MemberRow {
  id: string;
  role: string;
}

async function main() {
  const [email, ...slugs] = process.argv.slice(2);

  if (!email || slugs.length === 0) {
    console.error('usage: pnpm tsx scripts/attach-owner.ts <email> <org-slug> [<org-slug>…]');
    process.exit(2);
  }

  const users = await query<UserRow>('select id, email from users where lower(email) = lower($1)', [
    email,
  ]);
  const user = users[0];
  if (!user) {
    // Creating the account here would mean choosing somebody's password, which
    // is not a thing a script should do on their behalf.
    console.error(`No account for ${email}. Register at /registrieren first, then run this again.`);
    process.exit(1);
  }

  let changed = 0;

  for (const slug of slugs) {
    const orgs = await query<OrgRow>('select id, slug, name from organizations where slug = $1', [
      slug,
    ]);
    const org = orgs[0];
    if (!org) {
      console.error(`  ${slug}: no such organisation — skipped`);
      continue;
    }

    const existing = await query<MemberRow>(
      'select id, role from org_members where organization_id = $1 and user_id = $2',
      [org.id, user.id],
    );

    if (existing[0]) {
      // Not upgraded silently: a membership that already says "member" was set
      // by someone, and overriding it from a script would be invisible.
      console.log(`  ${slug}: already a member (${existing[0].role}) — unchanged`);
      continue;
    }

    await query(
      `insert into org_members (id, organization_id, user_id, role, created_at)
       values ($1, $2, $3, 'owner', now())`,
      [`mem_${org.slug}_${user.id.slice(0, 8)}`, org.id, user.id],
    );
    console.log(`  ${slug}: ${user.email} is now owner of ${org.name}`);
    changed++;
  }

  console.log(changed > 0 ? `\n${changed} membership(s) created.` : '\nNothing to do.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
