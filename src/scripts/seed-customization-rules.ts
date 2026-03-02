/**
 * Seed Customization Rules
 *
 * Populates database with example personalization rules.
 * Run with: npx tsx src/scripts/seed-customization-rules.ts
 */

import { db } from '../lib/db/client';
import { customizationRules } from '../lib/db/schema';
import { nanoid } from 'nanoid';
import { CO2_PER_LAPTOP } from '../lib/config/numbers';

const EXAMPLE_RULES = [
  // Global rule: Circular economy focus
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'focus_match',
    conditionValue: 'circular economy',
    actionType: 'emphasize_narrative',
    actionValue: 'circular_economy_impact',
    rationale:
      `Lead with "${CO2_PER_LAPTOP}kg CO2 saved per laptop" for circular economy foundations`,
    priority: 100,
    active: true,
  },

  // Global rule: Small grants
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'grant_size',
    conditionValue: '<50000',
    actionType: 'show_budget_module',
    actionValue: 'werkstatt_ausbau',
    rationale: 'Small grants: show single module instead of full 3-year plan',
    priority: 90,
    active: true,
  },

  // Global rule: Climate focus
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'focus_match',
    conditionValue: 'climate',
    actionType: 'emphasize_narrative',
    actionValue: 'climate_impact',
    rationale: 'Highlight climate benefits (refurbished laptops reduce emissions)',
    priority: 95,
    active: true,
  },

  // Global rule: Social integration focus
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'focus_match',
    conditionValue: 'soziale integration',
    actionType: 'emphasize_narrative',
    actionValue: 'refugee_integration',
    rationale: 'Lead with refugee work integration success stories',
    priority: 98,
    active: true,
  },

  // Global rule: Youth/education focus
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'focus_match',
    conditionValue: 'jugend',
    actionType: 'emphasize_narrative',
    actionValue: 'youth_digital_skills',
    rationale: 'Emphasize digital skills training for young people',
    priority: 95,
    active: true,
  },

  // Global rule: Zurich geographic focus
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'geographic',
    conditionValue: 'Zürich',
    actionType: 'add_section',
    actionValue: JSON.stringify({
      section: 'local_impact',
      content:
        'Werkstatt in Zürich-Oerlikon, 15+ lokale Arbeitsplätze geschaffen',
    }),
    rationale: 'Highlight Zurich location for local foundations',
    priority: 85,
    active: true,
  },

  // Global rule: Large grants
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'grant_size',
    conditionValue: '>100000',
    actionType: 'show_budget_module',
    actionValue: 'full_expansion_plan',
    rationale: 'Large grants: show full 3-year expansion plan with all modules',
    priority: 88,
    active: true,
  },

  // Foundation-specific: Volkart Stiftung
  {
    id: nanoid(),
    foundationId: 'volkart-stiftung',
    conditionType: 'custom',
    conditionValue: 'volkart',
    actionType: 'add_section',
    actionValue: JSON.stringify({
      section: 'past_collaboration',
      content:
        'Volkart Stiftung funded our partner organization Refugees Go Solar+ — proven aligned values in refugee integration',
    }),
    rationale: 'Highlight Volkart connection to RGS+ (same founder support)',
    priority: 110,
    active: true,
  },

  // Foundation-specific: Migros Pionierfonds
  {
    id: nanoid(),
    foundationId: 'migros-pionierfonds',
    conditionType: 'custom',
    conditionValue: 'migros',
    actionType: 'adjust_tone',
    actionValue: 'innovative_pioneering',
    rationale: 'Use "pioneering" language for Migros Pionierfonds',
    priority: 105,
    active: true,
  },

  // Global rule: Hide non-relevant modules
  {
    id: nanoid(),
    foundationId: null,
    conditionType: 'grant_size',
    conditionValue: '<30000',
    actionType: 'hide_budget_module',
    actionValue: 'marketing_expansion',
    rationale: 'Very small grants: hide marketing/expansion modules',
    priority: 80,
    active: true,
  },
] as const;

async function seedRules() {
  console.log('🌱 Seeding customization rules...\n');

  try {
    // Insert all rules — omit createdAt (DB defaultNow())
    for (const rule of EXAMPLE_RULES) {
      await db.insert(customizationRules).values({
        ...rule,
      });
    }

    console.log(`✓ Seeded ${EXAMPLE_RULES.length} customization rules\n`);

    // Summary by type
    const byType: Record<string, number> = {};
    EXAMPLE_RULES.forEach(r => {
      byType[r.actionType] = (byType[r.actionType] || 0) + 1;
    });

    console.log('By action type:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log('\n✓ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedRules();
