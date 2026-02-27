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
import { ORG_PROFILE } from '@/lib/config/org-profile';

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

type RequestBody = {
  instruction: string;
  currentText: string;
  fieldPath?: string;
  fieldDescription?: string;
  foundationName?: string;
  foundationPurpose?: string;
  foundationType?: string;
  foundationThemes?: string[];
  foundationFitScore?: number;
};

function buildUserMessage(body: RequestBody): string {
  const lines: string[] = [];

  // Foundation context block
  if (body.foundationName) {
    lines.push(`## Stiftung: ${body.foundationName}`);
    if (body.foundationPurpose) lines.push(`Stiftungszweck: ${body.foundationPurpose}`);
    if (body.foundationType) {
      const typeLabels: Record<string, string> = {
        A: 'Typ A — thematisch passend, hohe Priorität',
        B: 'Typ B — guter Fit, aktiv bewerben',
        C: 'Typ C — möglicher Fit, Timing wichtig',
        D: 'Typ D — Netzwerk-Stiftung',
      };
      lines.push(`Stiftungstyp: ${typeLabels[body.foundationType] ?? body.foundationType}`);
    }
    if (body.foundationThemes?.length) {
      lines.push(`Förderbereiche: ${body.foundationThemes.join(', ')}`);
    }
    if (body.foundationFitScore != null) {
      lines.push(`Fit-Score: ${body.foundationFitScore}/10`);
    }
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

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const { instruction, currentText } = body;
  if (!instruction?.trim() || !currentText?.trim()) {
    return NextResponse.json(
      { success: false, error: 'instruction und currentText sind erforderlich' },
      { status: 400 },
    );
  }

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
