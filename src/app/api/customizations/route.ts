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

// Validation schema for creating rules
const createRuleSchema = z.object({
  foundationId: z.string().optional().nullable(),

  conditionType: z.enum([
    'focus_match',
    'grant_size',
    'geographic',
    'organization_type',
    'custom',
  ]),
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
  try {
    const { searchParams } = new URL(request.url);
    const foundationId = searchParams.get('foundationId');
    const activeOnly = searchParams.get('active') !== 'false';

    // Build conditions
    const conditions = [];
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
    console.error('GET /api/customizations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customization rules' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customizations
 * Create a new customization rule
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createRuleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create rule — omit createdAt (DB defaultNow())
    const newRule = {
      id: nanoid(),
      ...data,
    };

    await db.insert(customizationRules).values(newRule);

    return NextResponse.json(
      { success: true, data: newRule },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/customizations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customization rule' },
      { status: 500 }
    );
  }
}
