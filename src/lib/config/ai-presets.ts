/**
 * AI Rewrite Presets — SSOT for one-click AI editing actions
 *
 * Used in GesuchEditPanel for quick text transformations.
 */

export const AI_PRESETS = [
  { label: 'Kürzer', instruction: 'Kürze auf maximal 2 Sätze, behalte den Kern' },
  { label: 'Auf Stiftung fokussieren', instruction: 'Passe den Text noch besser auf den Stiftungszweck und die Förderbereiche dieser Stiftung an' },
  { label: 'Überzeugender', instruction: 'Mache den Text überzeugender — stärker, handlungsorientierter, mit klarem Nutzen für die Stiftung' },
  { label: 'Mehr Zahlen', instruction: 'Integriere konkrete Zahlen und messbare Fakten aus dem Kontext (z.B. 150 Geräte, 285 kg CO₂, 75% Reuse-Rate)' },
  { label: 'Formeller', instruction: 'Schreibe formeller — für ein offizielles Schweizer Fördergesuch' },
] as const;
