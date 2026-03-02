/**
 * Parse foundation response time strings → follow-up date computation
 *
 * Foundation.responseTime is a free-text field like "6-8 Wochen", "3 Monate", etc.
 * We take the upper bound so we give the foundation enough time before following up.
 *
 * Default: 8 weeks (conservative, works when responseTime is missing or unparseable)
 */

/** Parse "6-8 Wochen" / "3 Monate" → number of weeks (upper bound) */
export function parseResponseTimeWeeks(responseTime?: string | null): number {
  if (!responseTime) return 8;
  const s = responseTime.toLowerCase();

  // "X-Y Wochen" or "X Wochen"
  const wochen = s.match(/(\d+)\s*(?:-\s*(\d+))?\s*wochen/);
  if (wochen) return parseInt(wochen[2] ?? wochen[1], 10);

  // "X-Y Monate" or "X Monat"
  const monate = s.match(/(\d+)\s*(?:-\s*(\d+))?\s*monat/);
  if (monate) return parseInt(monate[2] ?? monate[1], 10) * 4;

  // "X-Y Months" (English fallback)
  const months = s.match(/(\d+)\s*(?:-\s*(\d+))?\s*month/);
  if (months) return parseInt(months[2] ?? months[1], 10) * 4;

  return 8;
}

/** Compute ISO follow-up date from submission date + response time string */
export function computeFollowUpDate(submissionDateIso: string, responseTime?: string | null): string {
  const weeks = parseResponseTimeWeeks(responseTime);
  const d = new Date(submissionDateIso);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split('T')[0];
}

/** Format an ISO date as "15. Mai 2026" for display */
export function formatFollowUpDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
