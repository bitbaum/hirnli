/**
 * Customization Rules API - CRUD Operations
 *
 * GET    /api/customizations       — List all rules
 * POST   /api/customizations       — Create new rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { customizationRules } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { API_ERR_LOAD, API_ERR_VALIDATION, API_ERR_SAVE } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';
import { getCurrentOrgId } from '@/lib/tenant/resolve';

// Validation schema for creating rules
const createRuleSchema = z.object({
  foundationId: z.string().optional().nullable(),

  conditionType: z.enum(['focus_match', 'grant_size', 'geographic', 'organization_type', 'custom']),
  conditionValue: z.string(),

  actionType: z.enum([
    'emphasize_narrative',
    'show_budget_module',
    'hide_budget_module',
    'adjust_tone',
    'add_section',
    'reorder_sections',
    'custom',
  ]),
  actionValue: z.string(),

  rationale: z.string().optional().nullable(),
  priority: z.number().default(50),
  active: z.boolean().default(true),
});

/**
 * GET /api/customizations
 * List all customization rules
 */
export async function GET(request: NextRequest) {
  // Reads are scoped by the same identifier writes are attributed to. It was
  // only being used for the latter, so the list returned every tenant's rules.
  const ORG_ID = await getCurrentOrgId();
  try {
    const { searchParams } = new URL(request.url);
    const foundationId = searchParams.get('foundationId');
    const activeOnly = searchParams.get('active') !== 'false';

    // Build conditions. Rules are one organisation's personalisation logic for
    // its own Gesuche; listed unscoped, every tenant sees the others'.
    const conditions = [eq(customizationRules.orgId, ORG_ID)];
    if (foundationId) {
      conditions.push(eq(customizationRules.foundationId, foundationId));
    }
    if (activeOnly) {
      conditions.push(eq(customizationRules.active, true));
    }

    // Fetch rules
    const rules = await db
      .select()
      .from(customizationRules)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(customizationRules.priority));

    return NextResponse.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    return apiError('GET /api/customizations', error, API_ERR_LOAD);
  }
}

/**
 * POST /api/customizations
 * Create a new customization rule
 */
export async function POST(request: NextRequest) {
  // Every write says whose data it is. The columns no longer carry a
  // default, so an unattributed row cannot be created at all.
  const ORG_ID = await getCurrentOrgId();
  try {
    const body = await request.json();

    // Validate input
    const validation = createRuleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: API_ERR_VALIDATION,
          details: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Create rule — omit createdAt (DB defaultNow())
    const newRule = {
      id: nanoid(),
      // Whose rule this is — see the applications route for why there is no
      // longer a default to fall back on.
      orgId: ORG_ID,
      ...data,
    };

    await db.insert(customizationRules).values(newRule);

    return NextResponse.json({ success: true, data: newRule }, { status: 201 });
  } catch (error) {
    return apiError('POST /api/customizations', error, API_ERR_SAVE);
  }
}
