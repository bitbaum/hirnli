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
import { TYPE_LABELS } from '@/lib/config/foundations/metadata';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Static org-level context — never changes per request
const SYSTEM_PROMPT = `Du bist Spezialist für Stiftungsgesuche im deutschsprachigen Raum (Schweiz). Du hilfst ${ORG_PROFILE.name}, professionelle Förderanträge zu schreiben.

## Über ${ORG_PROFILE.name}
${ORG_PROFILE.name} ist ein ${ORG_PROFILE.legalForm.toLowerCase()} in ${ORG_PROFILE.location} (gegründet ${ORG_PROFILE.founded}). Drei Kernbereiche:
1. **Kreislaufwirtschaft** — IT-Geräte reparieren, refurbishen, weitergeben. ~150 Geräte/Jahr. Jedes spart ~285 kg CO₂ vs. Neukauf (Fraunhofer IZM 2023). 75% Reuse-Rate.
2. **Arbeitsintegration** — 8–10 Praktikumsplätze für benachteiligte Menschen (Sozialhilfe, RAV, IV). 100+ Praktikant:innen seit Programmbeginn 2009. Begleitung durch erfahrene Techniker.
3. **Digitale Bildung** — Linux-Kurse, IT-Grundlagen, Reparatur-Workshops. Eigene Open-Source-Plattform (Marktplatz, IT-Hilfe, Community). Partnerschaften mit Schulen und Sozialdiensten.

Finanzen: Gemeinnützig, alle Einnahmen fliessen in die Mission. Haupteinnahmen: Gerätverkauf (Laden Badenerstrasse + Online-Shop), Dienstleistungen, Stiftungsförderung.
Standort: Badenerstrasse 816, 8048 Zürich (Werkstatt + Laden) & Birmensdorferstrasse 379 (Shop).

## Schreibregeln
- Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü — nie ae/oe/ue)
- Professionell und präzise — nicht blumig oder pathetisch
- Konkrete Zahlen und Fakten bevorzugen: "150 Geräte" statt "viele Geräte"
- Stiftungsgesuche sind Partnerschaftsangebote, nicht Bittschriften
- Aktive Sprache, handlungsorientiert
- Länge: 2–4 Sätze pro Absatz, maximal prägnant

## Aufgabe
Du erhältst einen Textabschnitt und eine Überarbeitungsanweisung. Gib NUR den überarbeiteten Text zurück — kein Kommentar, keine Erklärung, keine Präambel, kein "Hier ist der überarbeitete Text:".`;

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
    tagline: z.string().optional(),
    researchNotes: z.string().optional(),
    pastGrantees: z.array(z.string()).optional(),
    grantRange: z.object({ min: z.number().optional(), max: z.number().optional() }).optional(),
    applicationProcess: z.string().optional(),
    deadline: z.string().optional(),
    deadlineText: z.string().optional(),
    priority: z.number().optional(),
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
      const label = TYPE_LABELS[fc.type as keyof typeof TYPE_LABELS];
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
      { success: false, error: 'KI-Dienst nicht konfiguriert' },
      { status: 503 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Ungültige Anfrage' },
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
        { success: false, error: 'KI-Dienst momentan nicht erreichbar' },
        { status: 502 },
      );
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (!rewritten) {
      return NextResponse.json(
        { success: false, error: 'Keine Antwort vom KI-Dienst' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: { rewritten } });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'KI-Anfrage hat zu lange gedauert (Timeout)' },
        { status: 504 },
      );
    }
    console.error('AI gesuch-section error:', err);
    return NextResponse.json({ success: false, error: 'Interner Fehler' }, { status: 500 });
  }
}
