import { aiLivenessHandler } from '@/lib/ai-liveness';

export const dynamic = 'force-dynamic';

/**
 * Can the AI chain answer RIGHT NOW?
 *
 *   GET /api/health/ai            free. What the last real call did.
 *   GET /api/health/ai?probe=1    a real call. Needs AI_PROBE_SECRET, via the
 *                                 `x-probe-secret` header or `?secret=`.
 *
 * Separate from /api/health on purpose: there, `llm` is informational and must
 * never fail the check, because a dead provider key is not fixed by a restart.
 * Here it is the point — 200 only when a model actually answered — so an uptime
 * monitor can page on a real AI outage without paging on every deploy.
 *
 * Deliberately OUTSIDE the internal Basic Auth wall (it is not under
 * `/api/ai`): its callers are monitors and deploy scripts, which have no
 * password to present. It carries its own gate instead — AI_PROBE_SECRET,
 * compared in constant time inside ai-kit. No secret configured means 501, so a
 * deployment that forgets to set one cannot be made to spend money.
 */
export const GET = aiLivenessHandler;
