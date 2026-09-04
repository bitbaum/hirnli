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
import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from './lib/db';
import {
  readAssessmentsForFoundation,
  upsertAssessment,
  type AnalysisPatch,
} from './lib/assessment-write';

const DRY_RUN = process.argv.includes('--dry-run');

type Foundation = {
  id: string;
  config_data: Record<string, unknown>;
};

function isRegistryUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  return /zefix\.admin\.ch|zefix\.ch|stiftungschweiz\.ch|stiftungsverzeichnis/.test(url);
}

/**
 * Which of two duplicate registry rows is the better one to keep.
 *
 * Half the evidence is registry (purpose, website, contact) and half is
 * assessment (fit, priority, themes, notes) — and the assessment half no longer
 * lives in config_data, so it is passed in rather than read off the blob. Read
 * from the blob it would score zero for every row, and the keeper would be
 * chosen on purpose-text length alone.
 *
 * The assessment half is aggregated across ALL organisations, not one: this is
 * a registry-level decision about which row survives, and a row somebody else
 * researched heavily is the better keeper regardless of who is running the
 * script. With a single tenant the aggregate is that tenant's own values, so
 * this reproduces the previous behaviour exactly.
 */
function dataScore(f: Foundation, assessments: AnalysisPatch[]): number {
  // Higher score = better keeper candidate.
  const cd = f.config_data;
  const purposeLen = ((cd.purposeSummary as string | null) ?? '').length;
  const longest = (key: keyof AnalysisPatch) =>
    Math.max(
      0,
      ...assessments.map((a) => (typeof a[key] === 'string' ? (a[key] as string).length : 0)),
    );
  const notesLen = longest('researchNotes');
  const hasRealWeb = !isRegistryUrl(cd.websiteUrl as string | null);
  const contact = cd.contact as Record<string, string> | null;
  const hasEmail = !!contact?.email;
  const hasPhone = !!contact?.phone;
  const themesLen = Math.max(
    0,
    ...assessments.map((a) => (Array.isArray(a.themes) ? a.themes.length : 0)),
  );
  const fit = Math.max(
    0,
    ...assessments.map((a) => (typeof a.fitScore === 'number' ? a.fitScore : 0)),
  );
  // Priority: lower number = higher priority (P1=1, P4=4) — invert so lower P
  // wins. The best (lowest) priority any organisation gave it.
  const bestPriority = Math.min(
    4,
    ...assessments.map((a) => (typeof a.priority === 'number' ? a.priority : 4)),
  );
  const priorityBonus = (5 - bestPriority) * 1000;
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
    } else if (
      dv == null ||
      dv === '' ||
      dv === undefined ||
      (Array.isArray(dv) && dv.length === 0)
    ) {
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

/**
 * Carry the loser's assessments onto the keeper, for every organisation.
 *
 * Deduplication is a registry-level act: two rows turned out to be one legal
 * entity. But the opinions attached to them belong to tenants, and there may be
 * several — so this merges per organisation rather than for whoever is running
 * the script. An organisation that researched only the loser would otherwise
 * watch its notes disappear into an archived row during somebody else's
 * cleanup.
 *
 * The rules match mergeConfig above: keep what the keeper already has, take the
 * longer text, union the themes, and never lower a fit score.
 */
async function mergeAssessments(keeperId: string, loserId: string): Promise<number> {
  const keeperRows = await readAssessmentsForFoundation(keeperId);
  const loserRows = await readAssessmentsForFoundation(loserId);
  const byOrg = new Map(keeperRows.map((r) => [r.orgId, r]));

  let merged = 0;
  for (const loser of loserRows) {
    const keeper = byOrg.get(loser.orgId);
    const patch: AnalysisPatch = {};

    if (!keeper) {
      // This organisation only ever assessed the duplicate. The whole
      // assessment moves across unchanged.
      const { orgId: _orgId, ...values } = loser;
      Object.assign(patch, values);
    } else {
      for (const [key, value] of Object.entries(loser)) {
        if (key === 'orgId' || value == null || value === '') continue;
        const current = (keeper as AnalysisPatch)[key as keyof AnalysisPatch];

        if (key === 'themes' && Array.isArray(value) && Array.isArray(current)) {
          const union = [...new Set([...(current as string[]), ...(value as string[])])];
          if (union.length > current.length) patch.themes = union;
        } else if (key === 'fitScore') {
          if (typeof value === 'number' && value > ((current as number) ?? 0)) {
            patch.fitScore = value;
          }
        } else if (typeof value === 'string' && typeof current === 'string') {
          // researchNotes and tagline: the longer text is the researched one.
          if (value.length > current.length) patch[key as keyof AnalysisPatch] = value;
        } else if (current == null || current === '') {
          patch[key as keyof AnalysisPatch] = value;
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      await upsertAssessment(loser.orgId, keeperId, patch);
      merged++;
    }
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

  let merged = 0,
    archived = 0,
    errors = 0;
  for (const cluster of clusters) {
    const ids = cluster.ids as string[];
    if (ids.length !== 2) {
      console.log(`  SKIP cluster ${cluster.uid}: size ${ids.length}`);
      continue;
    }
    const rows = (await sql`
      SELECT id, config_data
      FROM fundraising_foundations WHERE id IN (${ids[0]}, ${ids[1]})
    `) as Foundation[];
    if (rows.length !== 2) {
      errors++;
      continue;
    }
    const [a, b] = rows;
    const assessmentsById = new Map([
      [a.id, await readAssessmentsForFoundation(a.id)],
      [b.id, await readAssessmentsForFoundation(b.id)],
    ]);
    const aScore = dataScore(a, assessmentsById.get(a.id) ?? []),
      bScore = dataScore(b, assessmentsById.get(b.id) ?? []);
    const keeper = aScore >= bScore ? a : b;
    const loser = aScore >= bScore ? b : a;

    const newConfig = mergeConfig(keeper.config_data, loser.config_data);

    if (DRY_RUN) {
      const purposeBefore = ((keeper.config_data.purposeSummary as string) ?? '').length;
      const purposeAfter = ((newConfig.purposeSummary as string) ?? '').length;
      // Research notes are assessment data; report the longest any
      // organisation holds, which is what the merge would carry across.
      const noteLen = (rows: AnalysisPatch[]) =>
        Math.max(
          0,
          ...rows.map((r) => (typeof r.researchNotes === 'string' ? r.researchNotes.length : 0)),
        );
      const notesBefore = noteLen(assessmentsById.get(keeper.id) ?? []);
      const notesAfter = Math.max(notesBefore, noteLen(assessmentsById.get(loser.id) ?? []));
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
      // The registry rows are merged above; the assessments hanging off them
      // have to be merged too, or archiving the loser hides every opinion
      // anybody recorded against it.
      await mergeAssessments(keeper.id, loser.id);
      await sql`
        UPDATE fundraising_foundations
        SET archived = true, updated_at = NOW()
        WHERE id = ${loser.id}
      `;
    }
    merged++;
    archived++;
  }
  console.log(
    `\n${DRY_RUN ? '[DRY RUN] ' : ''}Done — ${merged} clusters merged, ${archived} entries archived, ${errors} errors`,
  );
}

main().catch(console.error);
