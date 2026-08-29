/**
 * Personalization Engine - Rule-based Gesuch Customization
 *
 * Evaluates conditions and applies actions to customize Gesuch documents.
 * Follows Ground Truth #2: Single source of truth for customization logic.
 */

import { db } from '../db/client';
import { customizationRules, foundations } from '../db/schema';
import { eq, and, or, isNull } from 'drizzle-orm';
import type { FoundationRow, CustomizationRule } from '../db/schema';

/**
 * Customization action to apply to Gesuch
 */
export interface CustomizationAction {
  ruleId: string;
  type: string;
  value: string;
  rationale: string;
  priority: number;
}

/**
 * Personalized Gesuch result
 */
export interface PersonalizedGesuch {
  foundation: FoundationRow;
  appliedRules: CustomizationAction[];
  customizations: {
    emphasizedNarratives: string[];
    visibleBudgetModules: string[];
    hiddenBudgetModules: string[];
    toneAdjustments: string[];
    additionalSections: Array<{ section: string; content: string }>;
    sectionOrder: string[];
  };
}

/**
 * Extract typed fields from configData JSONB
 */
function getConfigData(foundation: FoundationRow): Record<string, unknown> {
  return (foundation.configData ?? {}) as Record<string, unknown>;
}

/**
 * Evaluate a single condition against foundation data (reads from configData JSONB)
 */
function evaluateCondition(rule: CustomizationRule, foundation: FoundationRow): boolean {
  const { conditionType, conditionValue } = rule;
  const cd = getConfigData(foundation);

  switch (conditionType) {
    case 'focus_match': {
      const themes = (cd.themes ?? []) as string[];
      if (themes.length === 0) return false;
      return themes.some((t: string) => t.toLowerCase().includes(conditionValue.toLowerCase()));
    }

    case 'grant_size': {
      const match = conditionValue.match(/([<>]=?)(\d+)/);
      if (!match) return false;

      const operator = match[1];
      const threshold = parseInt(match[2]);
      const amount = (cd.amount ?? {}) as Record<string, number | null>;
      const maxGrant = amount.max || 0;

      switch (operator) {
        case '<':
          return maxGrant < threshold;
        case '<=':
          return maxGrant <= threshold;
        case '>':
          return maxGrant > threshold;
        case '>=':
          return maxGrant >= threshold;
        default:
          return false;
      }
    }

    case 'geographic': {
      const region = cd.region as string | undefined;
      if (!region) return false;
      return region.toLowerCase().includes(conditionValue.toLowerCase());
    }

    case 'organization_type': {
      return cd.type === conditionValue;
    }

    case 'custom': {
      return false;
    }

    default:
      return false;
  }
}

/**
 * Generate personalized Gesuch for a foundation
 */
export async function generatePersonalizedGesuch(
  foundationId: string,
): Promise<PersonalizedGesuch> {
  // Fetch foundation
  const foundationResult = await db
    .select()
    .from(foundations)
    .where(eq(foundations.id, foundationId))
    .limit(1);

  if (foundationResult.length === 0) {
    throw new Error(`Foundation not found: ${foundationId}`);
  }

  const foundation = foundationResult[0];

  // Fetch applicable rules (foundation-specific + global rules)
  const rules = await db
    .select()
    .from(customizationRules)
    .where(
      and(
        or(
          eq(customizationRules.foundationId, foundationId),
          isNull(customizationRules.foundationId),
        ),
        eq(customizationRules.active, true),
      ),
    )
    .orderBy(customizationRules.priority);

  // Evaluate conditions and collect applicable actions
  const appliedRules: CustomizationAction[] = [];

  for (const rule of rules) {
    // Foundation-specific rules always apply (no condition check)
    // Global rules require condition evaluation
    const applies = rule.foundationId === foundationId || evaluateCondition(rule, foundation);

    if (applies) {
      appliedRules.push({
        ruleId: rule.id,
        type: rule.actionType,
        value: rule.actionValue,
        rationale: rule.rationale || '',
        priority: rule.priority || 50,
      });
    }
  }

  // Build customizations object
  const customizations: PersonalizedGesuch['customizations'] = {
    emphasizedNarratives: [],
    visibleBudgetModules: [],
    hiddenBudgetModules: [],
    toneAdjustments: [],
    additionalSections: [],
    sectionOrder: [],
  };

  // Apply actions
  for (const action of appliedRules) {
    switch (action.type) {
      case 'emphasize_narrative':
        customizations.emphasizedNarratives.push(action.value);
        break;

      case 'show_budget_module':
        if (!customizations.visibleBudgetModules.includes(action.value)) {
          customizations.visibleBudgetModules.push(action.value);
        }
        break;

      case 'hide_budget_module':
        if (!customizations.hiddenBudgetModules.includes(action.value)) {
          customizations.hiddenBudgetModules.push(action.value);
        }
        break;

      case 'adjust_tone':
        customizations.toneAdjustments.push(action.value);
        break;

      case 'add_section': {
        try {
          const sectionData = JSON.parse(action.value);
          customizations.additionalSections.push(sectionData);
        } catch {
          console.warn(`Failed to parse section data: ${action.value}`);
        }
        break;
      }

      case 'reorder_sections': {
        try {
          customizations.sectionOrder = JSON.parse(action.value);
        } catch {
          console.warn(`Failed to parse section order: ${action.value}`);
        }
        break;
      }

      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  return {
    foundation,
    appliedRules,
    customizations,
  };
}

/**
 * Get customization summary as human-readable text
 */
export function getCustomizationSummary(gesuch: PersonalizedGesuch): string {
  const { appliedRules, customizations } = gesuch;

  const lines: string[] = [];

  lines.push(`${appliedRules.length} Anpassungsregeln angewendet:`);
  lines.push('');

  if (customizations.emphasizedNarratives.length > 0) {
    lines.push('**Hervorgehobene Narrative:**');
    customizations.emphasizedNarratives.forEach((n) => lines.push(`- ${n}`));
    lines.push('');
  }

  if (customizations.visibleBudgetModules.length > 0) {
    lines.push('**Angezeigte Budget-Module:**');
    customizations.visibleBudgetModules.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  if (customizations.hiddenBudgetModules.length > 0) {
    lines.push('**Ausgeblendete Budget-Module:**');
    customizations.hiddenBudgetModules.forEach((m) => lines.push(`- ${m}`));
    lines.push('');
  }

  if (customizations.toneAdjustments.length > 0) {
    lines.push('**Tonanpassungen:**');
    customizations.toneAdjustments.forEach((t) => lines.push(`- ${t}`));
    lines.push('');
  }

  if (customizations.additionalSections.length > 0) {
    lines.push('**Zusätzliche Abschnitte:**');
    customizations.additionalSections.forEach((s) => lines.push(`- ${s.section}`));
    lines.push('');
  }

  return lines.join('\n');
}
