/**
 * Gesuch Readiness Score
 *
 * Computes how "ready to submit" a gesuch is based on content completeness.
 * Returns a score (0-100), individual checks, and a boolean `ready` flag.
 */

import type { ComposedGesuch } from './gesuch-composer';
import type { GesuchOverridesData } from '@/lib/db/schema';
import type { Foundation } from '@/lib/schemas/foundation';
import { QUALITY_THRESHOLDS } from '@/lib/config/fit-scoring';

interface ReadinessCheck {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
}

export interface GesuchReadiness {
  score: number;
  checks: ReadinessCheck[];
  ready: boolean;
}

export function computeGesuchReadiness(
  gesuch: ComposedGesuch,
  overrides: GesuchOverridesData,
  foundation: Foundation,
): GesuchReadiness {
  const checks: ReadinessCheck[] = [
    {
      id: 'bridge',
      label: 'Verbindungssatz personalisiert',
      passed: Boolean(
        overrides.foundationBridge &&
        overrides.foundationBridge.length > QUALITY_THRESHOLDS.minContentChars,
      ),
      hint: 'Im Bearbeitungsmodus den Verbindungssatz anpassen oder KI-Entwurf nutzen.',
    },
    {
      id: 'anschreiben',
      label: 'Anschreiben angepasst',
      passed: Boolean(
        overrides.anschreiben?.opening &&
        overrides.anschreiben.opening.length > QUALITY_THRESHOLDS.minContentChars,
      ),
      hint: 'Eröffnungsabsatz des Anschreibens auf die Stiftung zuschneiden.',
    },
    {
      id: 'themes',
      label: 'Themen zugeordnet',
      passed: gesuch.themes.all.length > 0,
      hint: 'In Schritt 1 einen Schwerpunkt wählen, der zu den Förderbereichen passt.',
    },
    {
      id: 'contact',
      label: 'Kontaktinformationen bekannt',
      passed: Boolean(foundation.contact?.email || foundation.websiteUrl),
      hint: 'E-Mail oder Website auf der Stiftungsprofilseite ergänzen.',
    },
    {
      id: 'method',
      label: 'Einreichungsweg recherchiert',
      passed: Boolean(foundation.applicationMethod && foundation.applicationMethod !== 'unknown'),
      hint: 'Auf der Stiftungsprofilseite den Bewerbungsweg eintragen.',
    },
    {
      id: 'budget',
      label: 'Budget vorhanden',
      passed: Boolean(gesuch.story.projects.length > 0),
      hint: 'Projektbeschrieb mit Budget ist Teil des Gesuchs.',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    score,
    checks,
    ready: score >= 60,
  };
}
