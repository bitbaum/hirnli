/**
 * Foundation Bulk Import API
 *
 * POST /api/foundations/import  — Bulk upload foundations from JSON file
 *
 * Accepts: multipart/form-data with 'file' field
 * File format: JSON array of foundations
 * Deduplicates by name (skips existing foundations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { foundations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema for imported foundations
const importedFoundationSchema = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),

  fitScore: z.number().min(0).max(10).optional().nullable(),
  fitRationale: z.string().optional().nullable(),
  priority: z.number().min(1).max(4).optional().nullable(),

  focusAreas: z.array(z.string()).optional(),
  grantRange: z.string().optional().nullable(),
  grantRangeMin: z.number().optional().nullable(),
  grantRangeMax: z.number().optional().nullable(),

  applicationMethod: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  decisionTimeline: z.string().optional().nullable(),

  notes: z.string().optional().nullable(),
  strategicFit: z.string().optional().nullable(),
  source: z.string().optional().nullable(),

  pastGrantees: z.array(z.string()).optional(),
  boardMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
  })).optional(),
});

/**
 * Generate slug from foundation name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/à/g, 'a')
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parse grant range text to extract min/max
 */
function parseGrantRange(text?: string): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };

  // Match patterns like "CHF 10'000-50'000" or "CHF 10000-50000"
  const rangeMatch = text.match(/(\d[\d']*)\s*-\s*(\d[\d']*)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/'/g, ''));
    const max = parseInt(rangeMatch[2].replace(/'/g, ''));
    return { min, max };
  }

  // Match single amount like "CHF 50'000"
  const singleMatch = text.match(/(\d[\d']*)/);
  if (singleMatch) {
    const amount = parseInt(singleMatch[1].replace(/'/g, ''));
    return { min: amount, max: amount };
  }

  return { min: null, max: null };
}

/**
 * POST /api/foundations/import
 * Bulk import foundations from JSON file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Handle both array and { foundations: [] } formats
    const batch = Array.isArray(parsed) ? parsed : parsed.foundations || [];

    if (!Array.isArray(batch) || batch.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File must contain an array of foundations' },
        { status: 400 }
      );
    }

    // Validate all foundations
    const validated = [];
    const errors = [];

    for (let i = 0; i < batch.length; i++) {
      const validation = importedFoundationSchema.safeParse(batch[i]);
      if (validation.success) {
        validated.push(validation.data);
      } else {
        errors.push({
          index: i,
          name: batch[i]?.name || 'unknown',
          error: validation.error.flatten()
        });
      }
    }

    // Get existing foundation names for deduplication
    const existingFoundations = await db.select({ name: foundations.name }).from(foundations);
    const existingNames = new Set(existingFoundations.map(f => f.name));

    // Filter out duplicates
    const newFoundations = validated.filter(f => !existingNames.has(f.name));

    if (newFoundations.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        skipped: validated.length,
        errors: errors.length,
        message: 'All foundations already exist in database',
        errorDetails: errors.length > 0 ? errors : undefined,
      });
    }

    // Transform and insert
    const transformed = newFoundations.map(f => {
      const { min, max } = parseGrantRange(f.grantRange);

      return {
        id: generateSlug(f.name),
        name: f.name,
        websiteUrl: f.websiteUrl || null,
        contactEmail: f.contactEmail || null,
        contactPhone: f.contactPhone || null,

        fitScore: f.fitScore || null,
        priority: f.priority || null,
        focusAreas: f.focusAreas ? JSON.stringify(f.focusAreas) : null,
        geographicScope: f.location || null,
        organizationType: 'foundation' as const,

        grantRangeMin: f.grantRangeMin || min,
        grantRangeMax: f.grantRangeMax || max,
        typicalAmount: null,
        fundingModel: null,
        applicationMethod: f.applicationMethod || null,
        applicationDeadline: f.deadline || null,
        decisionTimeline: f.decisionTimeline || null,

        strategicFit: f.strategicFit || f.fitRationale || null,
        applicationNotes: f.notes || null,
        pastGrantees: f.pastGrantees ? JSON.stringify(f.pastGrantees) : null,
        boardMembers: f.boardMembers ? JSON.stringify(f.boardMembers) : null,

        researchDepth: 'rapid' as const,
        researchDate: new Date().toISOString().split('T')[0],
        researchFilePath: file.name,
        dataQuality: 3,

        source: f.source || 'api-import',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false,
      };
    });

    await db.insert(foundations).values(transformed);

    return NextResponse.json({
      success: true,
      imported: transformed.length,
      skipped: validated.length - newFoundations.length,
      errors: errors.length,
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : undefined, // Only return first 10 errors
      message: `Successfully imported ${transformed.length} foundations`,
    });

  } catch (error) {
    console.error('POST /api/foundations/import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import foundations' },
      { status: 500 }
    );
  }
}
