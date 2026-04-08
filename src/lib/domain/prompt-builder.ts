/**
 * External Prompt Builder — Generates self-contained prompts for frontier AI models
 *
 * When Groq output isn't good enough, the user copies a rich prompt to clipboard
 * and pastes it into ChatGPT, Claude, etc. The result can be pasted back into the field.
 *
 * Pure function: no I/O, no side effects.
 */

import { ORG_PROFILE } from '@/lib/config/org-profile';
import type { FoundationAIContext } from './ai-context';

interface PromptParams {
  foundation: FoundationAIContext;
  schwerpunktLabel?: string;
  fieldDescription: string;
  currentText: string;
}

/**
 * Build a standalone prompt that works in any AI assistant without additional context.
 */
export function buildExternalPrompt({
  foundation,
  schwerpunktLabel,
  fieldDescription,
  currentText,
}: PromptParams): string {
  const org = ORG_PROFILE;
  const areas = org.missionAreas
    .map((a) => `- **${a.name}**: ${a.description} (${a.metrics.join(', ')})`)
    .join('\n');

  const foundationLines: string[] = [];
  foundationLines.push(`**Stiftung:** ${foundation.name}`);
  if (foundation.purpose) foundationLines.push(`**Stiftungszweck:** ${foundation.purpose}`);
  if (foundation.type) foundationLines.push(`**Typ:** ${foundation.type}`);
  if (foundation.themes.length) foundationLines.push(`**Förderbereiche:** ${foundation.themes.join(', ')}`);
  if (foundation.fitScore != null) foundationLines.push(`**Fit-Score:** ${foundation.fitScore}/10`);
  if (foundation.pastGrantees?.length) foundationLines.push(`**Bisherige Empfänger:** ${foundation.pastGrantees.slice(0, 5).join(', ')}`);
  if (foundation.researchNotes) foundationLines.push(`**Strategische Einschätzung:** ${foundation.researchNotes}`);
  if (foundation.grantRange?.min != null || foundation.grantRange?.max != null) {
    const parts = [];
    if (foundation.grantRange?.min != null) parts.push(`ab CHF ${foundation.grantRange.min.toLocaleString('de-CH')}`);
    if (foundation.grantRange?.max != null) parts.push(`bis CHF ${foundation.grantRange.max.toLocaleString('de-CH')}`);
    foundationLines.push(`**Förderbetrag:** ${parts.join(' ')}`);
  }

  const angleSection = schwerpunktLabel
    ? `\n## Schwerpunkt dieses Gesuchs\n${schwerpunktLabel} — fokussiere den Text auf diesen Aspekt unserer Arbeit.\n`
    : '';

  return `## Aufgabe
Verbessere den folgenden Text für ein Schweizer Stiftungsgesuch (Förderantrag). Gib NUR den verbesserten Text zurück — kein Kommentar, keine Erklärung.

## Über uns
**${org.name}** — ${org.legalForm} in ${org.location} (gegründet ${org.founded})
${areas}

## Stiftung (Empfänger des Gesuchs)
${foundationLines.join('\n')}
${angleSection}
## Feld im Dokument
${fieldDescription}

## Aktueller Text
${currentText}

## Schreibregeln
- Schweizer Schriftdeutsch (ss statt ß, echte Umlaute ä ö ü)
- Professionell und präzise — nicht blumig oder pathetisch
- Konkrete Zahlen und Fakten bevorzugen
- Stiftungsgesuche sind Partnerschaftsangebote, nicht Bittschriften
- Maximal 2-4 Sätze pro Absatz`;
}
