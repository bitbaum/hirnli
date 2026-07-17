import type { Foundation } from '@/lib/schemas/foundation';
import { computeReadinessScore, computePriorityScore } from './foundation-scores';

/** Priority level counts + average score across all foundations */
export function computePriorityDistribution(foundations: Foundation[]) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const scores: number[] = [];
  for (const f of foundations) {
    const p = computePriorityScore(f);
    counts[p.level]++;
    scores.push(p.score);
  }
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { counts, avg };
}

/** Average readiness score across all foundations */
export function computeReadinessDistribution(foundations: Foundation[]) {
  const scores = foundations.map((f) => computeReadinessScore(f).score);
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { avg };
}
