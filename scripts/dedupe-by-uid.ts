/**
 * Mass-deduplicate foundations sharing the same UID.
 *
 * UID is the Swiss commercial-register unique identifier — two active
 * entries with the same UID are necessarily the same legal entity
 * (typically the German vs English/French naming of the foundation).
 *
 * Strategy per cluster:
 *   1. Pick the keeper: better data quality wins (higher priority,
 *      higher fitScore, longer purposeSummary+researchNotes,
 *      real websiteUrl, contact info).
 *   2. Merge fields from the loser into the keeper using the same
 *      union strategy from the distance-0 cleanup (commits b5dec23 +
 *      c4b8dbf): copy missing fields, take the longer of
 *      purposeSummary/researchNotes, union themes, fill empty contact
 *      subfields.
 *   3. Archive the loser.
 *
 * Dry-run flag prints the merge plan without writing.
 *
 * Usage:
 *   npx tsx scripts/dedupe-by-uid.ts --dry-run
 *   npx tsx scripts/dedupe-by-uid.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' });
import { sql } from './lib/db';

const DRY_RUN = process.argv.includes('--dry-run');

type Foundation = {
  id: string;
  config_data: Record<string, unknown>;
  fit_score: number | null;
  priority: number;
};

function isRegistryUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  return /zefix\.admin\.ch|zefix\.ch|stiftungschweiz\.ch|stiftungsverzeichnis/.test(url);
}

function dataScore(f: Foundation): number {
  // Higher score = better keeper candidate.
  const cd = f.config_data;
  const purposeLen = (cd.purposeSummary as string | null ?? '').length;
  const notesLen = (cd.researchNotes as string | null ?? '').length;
  const hasRealWeb = !isRegistryUrl(cd.websiteUrl as string | null);
  const contact = cd.contact as Record<string, string> | null;
  const hasEmail = !!contact?.email;
  const hasPhone = !!contact?.phone;
  const themesLen = ((cd.themes as string[] | null) ?? []).length;
  const fit = f.fit_score ?? 0;
  // Priority: lower number = higher priority (P1=1, P4=4) — invert so lower P wins
  const priorityBonus = (5 - f.priority) * 1000;
  return (
    priorityBonus +
    fit * 100 +
    (hasRealWeb ? 200 : 0) +
    (hasEmail ? 100 : 0) +
    (hasPhone ? 50 : 0) +
    themesLen * 30 +
    purposeLen +
    notesLen
  );
}

function mergeConfig(
  dst: Record<string, unknown>,
  src: Record<string, unknown>,
): Record<string, unknown> {
  const longestFields = ['purposeSummary', 'researchNotes', 'tagline', 'officialPurpose'];
  const merged = { ...dst };
  for (const k of Object.keys(src)) {
    const sv = src[k];
    const dv = dst[k];
    if (sv == null || sv === '' || sv === undefined) continue;
    if (longestFields.includes(k)) {
      const sl = typeof sv === 'string' ? sv.length : 0;
      const dl = typeof dv === 'string' ? dv.length : 0;
      if (dl < sl) merged[k] = sv;
    } else if (dv == null || dv === '' || dv === undefined || (Array.isArray(dv) && dv.length === 0)) {
      merged[k] = sv;
    }
  }
  // Themes union
  if (Array.isArray(src.themes) && Array.isArray(dst.themes)) {
    merged.themes = [...new Set([...(dst.themes as string[]), ...(src.themes as string[])])];
  }
  // Contact deep-merge — fill missing subfields
  const sc = src.contact as Record<string, string> | null;
  const dc = dst.contact as Record<string, string> | null;
  if (sc || dc) {
    const c: Record<string, string> = { ...(sc ?? {}), ...(dc ?? {}) };
    for (const k of ['email', 'phone', 'address']) {
      if (!c[k] && sc?.[k]) c[k] = sc[k];
    }
    merged.contact = c;
  }
  // Prefer non-registry websiteUrl
  if (
    isRegistryUrl(dst.websiteUrl as string | null) &&
    !isRegistryUrl(src.websiteUrl as string | null)
  ) {
    merged.websiteUrl = src.websiteUrl;
  }
  return merged;
}

async function main() {
  const clusters = await sql`
    SELECT config_data->>'uid' AS uid, ARRAY_AGG(id ORDER BY id) AS ids
    FROM fundraising_foundations
    WHERE (archived = false OR archived IS NULL)
      AND config_data->>'uid' IS NOT NULL AND config_data->>'uid' != ''
    GROUP BY config_data->>'uid'
    HAVING COUNT(*) > 1
  `;
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Processing ${clusters.length} UID clusters...`);

  let merged = 0, archived = 0, errors = 0;
  for (const cluster of clusters) {
    const ids = cluster.ids as string[];
    if (ids.length !== 2) {
      console.log(`  SKIP cluster ${cluster.uid}: size ${ids.length}`);
      continue;
    }
    const rows = await sql`
      SELECT id, config_data, fit_score, priority
      FROM fundraising_foundations WHERE id IN (${ids[0]}, ${ids[1]})
    ` as Foundation[];
    if (rows.length !== 2) { errors++; continue; }
    const [a, b] = rows;
    const aScore = dataScore(a), bScore = dataScore(b);
    const keeper = aScore >= bScore ? a : b;
    const loser = aScore >= bScore ? b : a;

    const newConfig = mergeConfig(keeper.config_data, loser.config_data);

    if (DRY_RUN) {
      const purposeBefore = (keeper.config_data.purposeSummary as string ?? '').length;
      const purposeAfter = (newConfig.purposeSummary as string ?? '').length;
      const notesBefore = (keeper.config_data.researchNotes as string ?? '').length;
      const notesAfter = (newConfig.researchNotes as string ?? '').length;
      console.log(
        `  ${keeper.id} ← ${loser.id}` +
        (purposeBefore !== purposeAfter ? ` purpose ${purposeBefore}→${purposeAfter}` : '') +
        (notesBefore !== notesAfter ? ` notes ${notesBefore}→${notesAfter}` : ''),
      );
    } else {
      await sql`
        UPDATE fundraising_foundations
        SET config_data = ${JSON.stringify(newConfig)}::jsonb, updated_at = NOW()
        WHERE id = ${keeper.id}
      `;
      await sql`
        UPDATE fundraising_foundations
        SET archived = true, updated_at = NOW()
        WHERE id = ${loser.id}
      `;
    }
    merged++;
    archived++;
  }
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Done — ${merged} clusters merged, ${archived} entries archived, ${errors} errors`);
}

main().catch(console.error);
