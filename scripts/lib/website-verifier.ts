/**
 * Website Verifier — LLM-based ownership check
 *
 * Given a candidate URL and a foundation's identity (name, purpose),
 * fetches the page and asks the LLM: "Does this website belong to this foundation?"
 *
 * The LLM does JUDGMENT (is this the right site?) — not data extraction.
 * Contact data extraction happens separately via regex (contact-extractor.ts).
 */

import { callGroqJSON } from './groq-client';
import { extractWebContent } from './web-extract';

export interface VerificationResult {
  url: string;
  verified: boolean;
  reason: string;
  pageTitle?: string;
}

const SYSTEM_PROMPT = `Du bist ein Recherche-Assistent für Schweizer Stiftungen.
Deine Aufgabe: Prüfe, ob eine Website tatsächlich einer bestimmten Stiftung gehört.

Antworte NUR mit einem JSON-Objekt:
{
  "belongs": true/false,
  "reason": "Einzeilige Begründung auf Deutsch"
}

Kriterien für "belongs: true":
- Der Seitentitel oder Inhalt nennt den Stiftungsnamen (oder eine erkennbare Variante)
- Der Inhalt passt zum Stiftungszweck
- Es ist die eigene Website der Stiftung, nicht ein Verzeichnis oder Drittanbieter

Kriterien für "belongs: false":
- Der Name stimmt nicht überein (z.B. "Garage Caflisch" statt "Caflisch Stiftung")
- Es ist eine Firma, ein Restaurant, eine Privatperson — nicht die Stiftung
- Es ist ein Hosting-Platzhalter, eine Fehlermeldung oder eine leere Seite
- Es ist ein Verzeichnis (Zefix, Moneyhouse, etc.) — nicht die eigene Website`;

/**
 * Verify whether a candidate URL belongs to the given foundation.
 * Uses LLM judgment on page title + first ~500 chars of content.
 */
export async function verifyWebsite(
  candidateUrl: string,
  foundationName: string,
  officialPurpose: string,
): Promise<VerificationResult> {
  // Fetch the page
  const extracted = await extractWebContent(candidateUrl);
  if (!extracted.ok || !extracted.content) {
    return { url: candidateUrl, verified: false, reason: 'Seite nicht erreichbar' };
  }

  // Extract title from content (extractWebContent strips HTML but keeps structure)
  const titleMatch = extracted.content.match(/^(.{0,100})/);
  const pageTitle = titleMatch?.[1]?.trim() || '';
  const contentPreview = extracted.content.slice(0, 800);

  // Quick check: if page title contains the foundation name, skip LLM (save tokens)
  const nameLower = foundationName.toLowerCase();
  const titleLower = pageTitle.toLowerCase();
  const nameWords = nameLower
    .replace(/stiftung|foundation|fondation|fondazione/gi, '')
    .trim()
    .split(/[\s-]+/)
    .filter(w => w.length > 2);
  const hasNameInTitle = nameWords.some(w => titleLower.includes(w));
  const hasStiftungInTitle = /stiftung|foundation|fondation|fondazione/i.test(titleLower);

  if (hasNameInTitle && hasStiftungInTitle) {
    return {
      url: candidateUrl,
      verified: true,
      reason: `Seitentitel enthält "${foundationName}"`,
      pageTitle,
    };
  }

  // LLM verification for ambiguous cases
  const userPrompt = `Stiftungsname: ${foundationName}
Stiftungszweck: ${officialPurpose.slice(0, 300)}

Website-URL: ${candidateUrl}
Seitentitel: ${pageTitle}
Seiteninhalt (Anfang):
${contentPreview}`;

  try {
    const result = await callGroqJSON<{ belongs: boolean; reason: string }>(
      SYSTEM_PROMPT,
      userPrompt,
      { maxTokens: 150, temperature: 0.1, model: '8b' },
    );
    if (result.ok) {
      return {
        url: candidateUrl,
        verified: result.data.belongs,
        reason: result.data.reason,
        pageTitle,
      };
    }
    // LLM returned error — fall through to fallback
  } catch {
    // LLM threw — fall through to fallback
  }

  // Conservative fallback: only verify if title clearly matches
  return {
    url: candidateUrl,
    verified: hasNameInTitle,
    reason: hasNameInTitle ? 'Name im Titel gefunden (LLM nicht verfügbar)' : 'Konnte nicht verifiziert werden',
    pageTitle,
  };
}
