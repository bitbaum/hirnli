import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import { computeReadinessScore, computePriorityScore } from './foundation-scores';

/** Priority level counts + average score across all foundations */
export function computePriorityDistribution() {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const scores: number[] = [];
  for (const f of STIFTUNGEN_DATA) {
    const p = computePriorityScore(f);
    counts[p.level]++;
    scores.push(p.score);
  }
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { counts, avg };
}

/** Average readiness score across all foundations */
export function computeReadinessDistribution() {
  const scores = STIFTUNGEN_DATA.map((f) => computeReadinessScore(f).score);
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  return { avg };
}
