/**
 * AI Gesuch Section Edit
 *
 * POST /api/ai/gesuch-section
 *
 * Rewrites a gesuch text section based on a user instruction.
 * Uses Groq (llama-3.3-70b) — same approach as revampit.
 *
 * Body: { instruction, currentText, foundationName, context? }
 * Returns: { success, data: { rewritten } }
 */

import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Du bist ein Experte für Stiftungsgesuche in der Schweiz. Du hilfst dabei, professionelle, überzeugende Texte für Fördermittelanträge zu verfassen.

Organisation: Revamp-IT — gemeinnütziger Verein für nachhaltige IT, Reparatur und Kreislaufwirtschaft, Zürich.

Stil: Professionell, präzise, überzeugend — Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü).

Wenn du Text überarbeitest, behalte den grundlegenden Sinn und setze die Anweisung des Benutzers um. Gib NUR den überarbeiteten Text zurück, ohne Kommentar, Präambel oder Erklärung.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'GROQ_API_KEY nicht konfiguriert' },
      { status: 503 }
    );
  }

  let body: { instruction: string; currentText: string; foundationName?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const { instruction, currentText, foundationName, context } = body;
  if (!instruction?.trim() || !currentText?.trim()) {
    return NextResponse.json(
      { success: false, error: 'instruction und currentText sind erforderlich' },
      { status: 400 }
    );
  }

  const contextNote = foundationName ? `Stiftung: ${foundationName}. ` : '';
  const extraContext = context ? `\n\nZusätzlicher Kontext: ${context}` : '';

  const userPrompt = `${contextNote}Überarbeite den folgenden Text gemäss dieser Anweisung: "${instruction}"

Aktueller Text:
${currentText}${extraContext}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
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
        { success: false, error: 'KI-Dienst nicht verfügbar' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rewritten = data.choices?.[0]?.message?.content?.trim();

    if (!rewritten) {
      return NextResponse.json(
        { success: false, error: 'Keine Antwort vom KI-Dienst' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, data: { rewritten } });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'KI-Anfrage hat zu lange gedauert' },
        { status: 504 }
      );
    }
    console.error('AI gesuch-section error:', err);
    return NextResponse.json(
      { success: false, error: 'Interner Fehler' },
      { status: 500 }
    );
  }
}
