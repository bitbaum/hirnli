/**
 * AI Gesuch Section Edit
 *
 * POST /api/ai/gesuch-section
 *
 * Rewrites a gesuch text section based on a user instruction.
 * Uses Groq (llama-3.3-70b) for fast inference.
 *
 * Body: { instruction, currentText, fieldPath, fieldDescription?,
 *         foundationName?, foundationPurpose?, foundationType?,
 *         foundationThemes?, foundationFitScore? }
 * Returns: { success, data: { rewritten } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatNumber } from '@/lib/utils/format';
import { z } from 'zod';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { SHARED_ORG_NUMBERS } from '@/lib/config/shared-org-numbers.generated';
import { resolveTypeLabel } from '@/lib/config/foundations/metadata';
import {
  API_ERR_BAD_REQUEST,
  API_ERR_AI_NOT_CONFIGURED,
  API_ERR_AI_UNAVAILABLE,
  API_ERR_AI_NO_RESPONSE,
  API_ERR_AI_TIMEOUT,
  API_ERR_INTERNAL,
} from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Retired with the rest of Groq's llama-3.x family — this route answered 404
// with a valid key, which surfaces to the user as "AI unavailable". Verified
// live 2026-08-27; checked daily by dotfiles' model-pin audit.
const GROQ_MODEL = 'openai/gpt-oss-120b';

/** Build system prompt from ORG_PROFILE config (no hardcoded metrics) */
function buildSystemPrompt(): string {
  const areas = ORG_PROFILE.missionAreas
    .map((a, i) => {
      const metricsStr = a.metrics.join('. ');
      return `${i + 1}. **${a.name}** — ${a.description}. ${metricsStr}.`;
    })
    .join('\n');

  return `Du bist Spezialist für Stiftungsgesuche im deutschsprachigen Raum (Schweiz). Du hilfst ${ORG_PROFILE.name}, professionelle Förderanträge zu schreiben.

## Über ${ORG_PROFILE.name}
${ORG_PROFILE.name} ist ein ${ORG_PROFILE.legalForm.toLowerCase()} in ${ORG_PROFILE.location} (gegründet ${ORG_PROFILE.founded}). ${ORG_PROFILE.missionAreas.length} Kernbereiche:
${areas}

Finanzen: Gemeinnützig, alle Einnahmen fliessen in die Mission. Haupteinnahmen: Gerätverkauf (Laden + Online-Shop), Dienstleistungen, Stiftungsförderung.
Standort: ${ORG_PROFILE.address} (Verkaufsstelle) & ${ORG_PROFILE.warehouseAddress} (Lager, nur nach Terminvereinbarung).

## Schreibregeln
- Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü — nie ae/oe/ue)
- Professionell und präzise — nicht blumig oder pathetisch
- Konkrete Zahlen und Fakten bevorzugen: "${SHARED_ORG_NUMBERS.DEVICES_YEAR_CURRENT} Geräte" statt "viele Geräte"
- Stiftungsgesuche sind Partnerschaftsangebote, nicht Bittschriften
- Aktive Sprache, handlungsorientiert
- Länge: 2–4 Sätze pro Absatz, maximal prägnant

## Aufgabe
Du erhältst einen Textabschnitt und eine Überarbeitungsanweisung. Gib NUR den überarbeiteten Text zurück — kein Kommentar, keine Erklärung, keine Präambel, kein "Hier ist der überarbeitete Text:".`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

const requestSchema = z.object({
  instruction: z.string().min(1),
  currentText: z.string().min(1),
  fieldPath: z.string().optional(),
  fieldDescription: z.string().optional(),
  foundationContext: z.object({
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
    criteria: z.object({ nature: z.string().optional(), education: z.string().optional() }).optional(),
    partners: z.array(z.string()).optional(),
    sdgs: z.array(z.number()).optional(),
  }).optional(),
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
    return NextResponse.json(
      { success: false, error: API_ERR_AI_NOT_CONFIGURED },
      { status: 503 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: API_ERR_BAD_REQUEST }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: API_ERR_BAD_REQUEST },
      { status: 400 },
    );
  }
  const body = parsed.data;

  const userMessage = buildUserMessage(body);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.35,
        max_tokens: 1024,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Groq API error:', response.status, errText);
      return NextResponse.json(
        { success: false, error: API_ERR_AI_UNAVAILABLE },
        { status: 502 },
      );
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (!rewritten) {
      return NextResponse.json(
        { success: false, error: API_ERR_AI_NO_RESPONSE },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: { rewritten } });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: API_ERR_AI_TIMEOUT },
        { status: 504 },
      );
    }
    return apiError('AI gesuch-section', err, API_ERR_INTERNAL);
  }
}
