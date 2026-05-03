/**
 * Apply Customizations API
 *
 * POST /api/customizations/apply  — Generate personalized Gesuch for foundation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generatePersonalizedGesuch,
  getCustomizationSummary,
} from '@/lib/domain/personalization-engine';
import { z } from 'zod';
import { API_ERR_VALIDATION } from '@/lib/utils/errors';

// Request schema
const applySchema = z.object({
  foundationId: z.string().min(1),
});

/**
 * POST /api/customizations/apply
 * Generate personalized Gesuch by evaluating all rules
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = applySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: API_ERR_VALIDATION,
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { foundationId } = validation.data;

    // Generate personalized Gesuch
    const gesuch = await generatePersonalizedGesuch(foundationId);

    // Get human-readable summary
    const summary = getCustomizationSummary(gesuch);

    return NextResponse.json({
      success: true,
      data: {
        foundation: gesuch.foundation,
        appliedRules: gesuch.appliedRules,
        customizations: gesuch.customizations,
        summary,
      },
    });
  } catch (error) {
    console.error('POST /api/customizations/apply error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Verarbeitung fehlgeschlagen',
      },
      { status: 500 }
    );
  }
}
