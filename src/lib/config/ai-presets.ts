/**
 * AI Rewrite Presets — SSOT for one-click AI editing actions
 *
 * Used in GesuchEditPanel for quick text transformations.
 *
 * These are INSTRUCTIONS, and they name no figures. "Mehr Zahlen" used to
 * illustrate itself with one customer's device count, CO2 saving and reuse
 * rate, so every tenant's AI rewrite was told to work those specific numbers
 * into its grant text. The model already receives the requesting tenant's own
 * context; the preset only has to ask it to use it.
 */

export const AI_PRESETS = [
  { label: 'Kürzer', instruction: 'Kürze auf maximal 2 Sätze, behalte den Kern' },
  {
    label: 'Auf Stiftung fokussieren',
    instruction:
      'Passe den Text noch besser auf den Stiftungszweck und die Förderbereiche dieser Stiftung an',
  },
  {
    label: 'Überzeugender',
    instruction:
      'Mache den Text überzeugender — stärker, handlungsorientierter, mit klarem Nutzen für die Stiftung',
  },
  {
    label: 'Mehr Zahlen',
    instruction:
      'Integriere konkrete Zahlen und messbare Fakten aus dem bereitgestellten Kontext dieser Organisation — keine erfundenen oder fremden Werte',
  },
  {
    label: 'Formeller',
    instruction: 'Schreibe formeller — für ein offizielles Schweizer Fördergesuch',
  },
] as const;
