/**
 * Attach an existing account to one or more organisations.
 *
 *   npx tsx scripts/grant-org-membership.ts <email> <slug> [slug…] [--role owner]
 *
 * Why a script and not a seed row: a membership references a user id, and the
 * user does not exist until that person registers and chooses their own
 * password. Pre-creating the account here would mean inventing a credential for
 * somebody else — so registration stays theirs, and this grants access after.
 *
 * Idempotent: re-running promotes the role if it changed and otherwise does
 * nothing, so it is safe to run before you are sure whether it already ran.
 */

import { and, eq } from 'drizzle-orm';
import { db } from '../src/lib/db/client';
import { member, organization, user } from '../src/lib/db/auth-schema';
import { ORG_ROLES, type OrgRole } from '../src/lib/auth/roles';

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const roleIdx = args.findIndex((a) => a === '--role');
  let role: OrgRole = 'owner';
  if (roleIdx !== -1) {
    const raw = args[roleIdx + 1];
    if (!raw || !(ORG_ROLES as readonly string[]).includes(raw)) {
      throw new Error(`--role must be one of: ${ORG_ROLES.join(', ')}`);
    }
    role = raw as OrgRole;
    args.splice(roleIdx, 2);
  }
  const [email, ...slugs] = args;
  if (!email || slugs.length === 0) {
    throw new Error(
      'usage: grant-org-membership.ts <email> <slug> [slug…] [--role member|admin|owner]',
    );
  }
  return { email, slugs, role };
}

async function main() {
  const { email, slugs, role } = parseArgs(process.argv);

  const [account] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!account) {
    // Not worth a stack trace: the usual cause is simply that the person has
    // not registered yet.
    console.error(`No account for ${email}. Ask them to register first, then re-run this.`);
    process.exit(1);
  }

  for (const slug of slugs) {
    const [org] = await db.select().from(organization).where(eq(organization.slug, slug)).limit(1);
    if (!org) {
      console.error(`  x ${slug}: no such organisation`);
      continue;
    }

    const [existing] = await db
      .select()
      .from(member)
      .where(and(eq(member.organizationId, org.id), eq(member.userId, account.id)))
      .limit(1);

    if (existing) {
      if (existing.role === role) {
        console.log(`  - ${slug}: already ${role}`);
      } else {
        await db.update(member).set({ role }).where(eq(member.id, existing.id));
        console.log(`  ^ ${slug}: ${existing.role} -> ${role}`);
      }
      continue;
    }

    await db.insert(member).values({
      id: `mem_${crypto.randomUUID()}`,
      organizationId: org.id,
      userId: account.id,
      role,
      createdAt: new Date(),
    });
    console.log(`  + ${slug}: added as ${role}`);
  }

  console.log(`\n${email} -> /o/${slugs[0]}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
