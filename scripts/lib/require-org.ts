/**
 * Which tenant is this script writing for? Answer explicitly or don't run.
 *
 * The ingestion scripts each wrote the literal `'revamp-it'`, and every
 * tenant-scoped column carried `default('revamp-it')` to match. With one
 * customer that is invisible. With two it means a script run for evig files its
 * rows under Revamp-IT, and afterwards nothing distinguishes them — the
 * attribution is not wrong in a recoverable way, it is simply gone.
 *
 * A default is the wrong shape for this. "Whose data is this?" has no sensible
 * fallback, so an unanswered question must stop the run rather than be answered
 * on the operator's behalf.
 */

/**
 * The org id to write, from `--org <id>` or `HIRNLI_ORG_ID`.
 *
 * Throws when absent. That is the feature: a script that cannot say whose data
 * it is producing should not produce any.
 */
export function requireOrgId(argv: string[] = process.argv): string {
  const flagIndex = argv.indexOf('--org');
  const fromFlag = flagIndex !== -1 ? argv[flagIndex + 1] : undefined;
  const orgId = (fromFlag ?? process.env.HIRNLI_ORG_ID ?? '').trim();

  if (!orgId) {
    throw new Error(
      'No organisation given. Pass --org <id> or set HIRNLI_ORG_ID.\n' +
        'There is deliberately no default: an unattributed row is indistinguishable\n' +
        "from the first tenant's, and that cannot be undone after the fact.",
    );
  }
  if (orgId.startsWith('-')) {
    // `--org --dry-run` would otherwise file every row under "--dry-run".
    throw new Error(`"${orgId}" looks like a flag, not an organisation id.`);
  }
  return orgId;
}
