/**
 * AI Gesuch Section Edit
 *
 * POST /api/ai/gesuch-section
 *
 * Rewrites a gesuch text section based on a user instruction.
 * Uses Groq, via `scripts/lib/groq-client.ts`'s fallback chain, for fast inference.
 *
 * Body: { instruction, currentText, fieldPath, fieldDescription?,
 *         foundationName?, foundationPurpose?, foundationType?,
 *         foundationThemes?, foundationFitScore? }
 * Returns: { success, data: { rewritten } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatNumber } from '@/lib/utils/format';
import { z } from 'zod';
import { resolveTypeLabel } from '@/lib/config/foundations/metadata';
import { getTenant } from '@/lib/tenant/resolve';
import type { Tenant } from '@/lib/tenant/profile';
import {
  API_ERR_BAD_REQUEST,
  API_ERR_AI_NOT_CONFIGURED,
  API_ERR_AI_UNAVAILABLE,
} from '@/lib/utils/errors';
import { callGroq } from '../../../../../scripts/lib/groq-client';
import { recordLLMFailure, recordLLMSuccess } from '@/lib/llm-health';

// This route used to hand-roll its own Groq fetch — a SECOND copy of the
// same request `scripts/lib/groq-client.ts` already made, with its own
// hardcoded model id. Both copies were retired together when Groq withdrew
// the whole llama-3.x family, and both had to be fixed by hand. `callGroq`
// now owns the request AND walks the fleet's model fallback chain, so a
// future retirement is one fix, not two, and this route survives a single
// retired id instead of going fully dark.

/**
 * The system prompt, for one tenant.
 *
 * It used to be a module-level constant, evaluated once when the module loaded,
 * from a compile-time profile describing Revamp-IT. Every organisation on the
 * platform therefore had its Gesuch text rewritten by an assistant that had
 * been told, in detail, that it was writing for a different organisation:
 * another tenant's name, legal form, location, founding year, addresses and
 * Kernbereiche, presented to the model as fact. The edit comes back fluent and
 * confidently wrong, which is the hardest kind of wrong to catch in a document
 * you are about to send to a foundation.
 *
 * So it takes a tenant and is built per request. Three of the fields it wants
 * are optional on `Tenant` — `missionAreas`, `address`, `warehouseAddress` —
 * and a young organisation genuinely has none of them. Absence is rendered by
 * leaving the sentence out, never by stating a placeholder: "0 Kernbereiche" or
 * an empty Standort line would be the model's only information on that topic,
 * and it would write around it.
 */
function buildSystemPrompt(tenant: Tenant): string {
  const sections: string[] = [];

  sections.push(
    `Du bist Spezialist für Stiftungsgesuche im deutschsprachigen Raum (Schweiz). Du hilfst ${tenant.name}, professionelle Förderanträge zu schreiben.`,
  );

  const about: string[] = [`## Über ${tenant.name}`];
  const areas = tenant.missionAreas ?? [];
  const intro = `${tenant.name} ist ein ${tenant.legalForm.toLowerCase()} in ${tenant.location} (gegründet ${tenant.founded}).`;
  about.push(areas.length > 0 ? `${intro} ${areas.length} Kernbereiche:` : intro);
  if (areas.length > 0) {
    about.push(
      areas
        .map((a, i) => `${i + 1}. **${a.name}** — ${a.description}. ${a.metrics.join('. ')}.`)
        .join('\n'),
    );
  }
  about.push(
    'Finanzen: Gemeinnützig, alle Einnahmen fliessen in die Mission. Haupteinnahmen: Gerätverkauf (Laden + Online-Shop), Dienstleistungen, Stiftungsförderung.',
  );

  // Two addresses, either of which may be absent. Naming a location the tenant
  // does not have is worse than naming none.
  const locations = [
    tenant.address ? `${tenant.address} (Verkaufsstelle)` : null,
    tenant.warehouseAddress
      ? `${tenant.warehouseAddress} (Lager, nur nach Terminvereinbarung)`
      : null,
  ].filter(Boolean);
  if (locations.length > 0) about.push(`Standort: ${locations.join(' & ')}.`);

  sections.push(about.join('\n'));

  // The "konkrete Zahlen" rule used to carry a worked example built from the
  // generated org-numbers module — a figure counting one organisation's
  // refurbished devices. Quoting it at every tenant would put another
  // customer's operating numbers in the model's mouth as its own, so the rule
  // now states the principle and lets the figures come from the request's own
  // context.
  sections.push(`## Schreibregeln
- Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü — nie ae/oe/ue)
- Professionell und präzise — nicht blumig oder pathetisch
- Konkrete Zahlen und Fakten bevorzugen: nie "viele" oder "zahlreiche", wo im Kontext eine Zahl steht. Keine Zahl erfinden, die nicht gegeben ist.
- Stiftungsgesuche sind Partnerschaftsangebote, nicht Bittschriften
- Aktive Sprache, handlungsorientiert
- Länge: 2–4 Sätze pro Absatz, maximal prägnant`);

  sections.push(`## Aufgabe
Du erhältst einen Textabschnitt und eine Überarbeitungsanweisung. Gib NUR den überarbeiteten Text zurück — kein Kommentar, keine Erklärung, keine Präambel, kein "Hier ist der überarbeitete Text:".`);

  return sections.join('\n\n');
}

const requestSchema = z.object({
  instruction: z.string().min(1),
  currentText: z.string().min(1),
  fieldPath: z.string().optional(),
  fieldDescription: z.string().optional(),
  foundationContext: z
    .object({
      name: z.string(),
      purpose: z.string().optional(),
      type: z.string().optional(),
      themes: z.array(z.string()).optional(),
      fitScore: z.number().optional(),
      priority: z.number().optional(),
      tagline: z.string().optional(),
      researchNotes: z.string().optional(),
      pastGrantees: z.array(z.string()).optional(),
      grantRange: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
      applicationProcess: z.string().optional(),
      deadline: z.string().optional(),
      deadlineText: z.string().optional(),
      criteria: z
        .object({ nature: z.string().optional(), education: z.string().optional() })
        .optional(),
      partners: z.array(z.string()).optional(),
      sdgs: z.array(z.number()).optional(),
    })
    .optional(),
});

type RequestBody = z.infer<typeof requestSchema>;

function buildUserMessage(body: RequestBody): string {
  const lines: string[] = [];

  // Foundation context block
  const fc = body.foundationContext;
  if (fc?.name) {
    lines.push(`## Stiftung: ${fc.name}`);
    if (fc.purpose) lines.push(`Stiftungszweck: ${fc.purpose}`);
    if (fc.type) {
      const label = resolveTypeLabel(fc.type);
      lines.push(`Stiftungstyp: ${label ? `Typ ${label.short} — ${label.long}` : fc.type}`);
    }
    if (fc.themes?.length) {
      lines.push(`Förderbereiche: ${fc.themes.join(', ')}`);
    }
    if (fc.fitScore != null) {
      lines.push(`Fit-Score: ${fc.fitScore}/10`);
    }
    if (fc.tagline) lines.push(`Tagline: ${fc.tagline}`);
    if (fc.grantRange?.min != null || fc.grantRange?.max != null) {
      const rangeStr = [
        fc.grantRange.min != null ? `ab CHF ${formatNumber(fc.grantRange.min)}` : null,
        fc.grantRange.max != null ? `bis CHF ${formatNumber(fc.grantRange.max)}` : null,
      ]
        .filter(Boolean)
        .join(', ');
      lines.push(`Förderbereich Budget: ${rangeStr}`);
    }
    if (fc.pastGrantees?.length) {
      lines.push(`Bisherige Empfänger: ${fc.pastGrantees.slice(0, 5).join(', ')}`);
    }
    if (fc.applicationProcess) {
      lines.push(`Bewerbungsprozess: ${fc.applicationProcess}`);
    }
    if (fc.researchNotes) {
      lines.push(`\nStrategische Einschätzung:\n${fc.researchNotes}`);
    }
    if (fc.criteria) {
      const parts = [fc.criteria.nature, fc.criteria.education].filter(Boolean);
      if (parts.length) lines.push(`Förderkriterien: ${parts.join('; ')}`);
    }
    if (fc.partners?.length) {
      lines.push(`Partner: ${fc.partners.slice(0, 5).join(', ')}`);
    }
    if (fc.sdgs?.length) {
      lines.push(`SDGs: ${fc.sdgs.join(', ')}`);
    }
    if (fc.priority != null) {
      lines.push(`Priorität: P${fc.priority}`);
    }
    if (fc.deadlineText) lines.push(`Eingabeschluss: ${fc.deadlineText}`);
    lines.push('');
  }

  // Field context
  if (body.fieldDescription) {
    lines.push(`## Feld im Dokument`);
    lines.push(body.fieldDescription);
    lines.push('');
  }

  // The actual task
  lines.push(`## Überarbeitungsanweisung`);
  lines.push(`"${body.instruction}"`);
  lines.push('');
  lines.push(`## Aktueller Text`);
  lines.push(body.currentText);

  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: API_ERR_AI_NOT_CONFIGURED }, { status: 503 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: API_ERR_BAD_REQUEST }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: API_ERR_BAD_REQUEST }, { status: 400 });
  }
  const body = parsed.data;

  const userMessage = buildUserMessage(body);
  const systemPrompt = buildSystemPrompt(await getTenant());

  const result = await callGroq(systemPrompt, userMessage, {
    temperature: 0.35,
    maxTokens: 1024,
    timeoutMs: 30000,
  });

  if (!result.ok) {
    console.error('Groq API error:', result.error);
    recordLLMFailure(result.error);
    // callGroq already tried every model in the fleet's chain — a single
    // "unavailable" covers HTTP errors, an empty response and a timeout
    // alike, since a multi-model walk can fail each attempt a different way
    // and there is no one status code that would be more honest than this.
    return NextResponse.json({ success: false, error: API_ERR_AI_UNAVAILABLE }, { status: 502 });
  }

  recordLLMSuccess();
  return NextResponse.json({ success: true, data: { rewritten: result.content } });
}
