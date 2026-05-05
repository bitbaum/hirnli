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
import { z } from 'zod';
import { toSlug } from '@/lib/utils/slug';
import { getTodayISO } from '@/lib/utils/format';
import {
  API_ERR_SAVE,
  API_ERR_IMPORT_NO_FILE,
  API_ERR_IMPORT_FILE_TOO_LARGE,
  API_ERR_IMPORT_FILE_TYPE,
  API_ERR_IMPORT_JSON_INVALID,
  API_ERR_IMPORT_EMPTY,
} from '@/lib/utils/errors';

// Validation schema for imported foundations
const importedFoundationSchema = z.object({
  name: z.string().min(1),
  websiteUrl: z.string().url().optional().nullable(),
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
        { success: false, error: API_ERR_IMPORT_NO_FILE },
        { status: 400 }
      );
    }

    // Validate file size (max 10 MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: API_ERR_IMPORT_FILE_TOO_LARGE },
        { status: 413 }
      );
    }

    // Validate file type
    if (file.type && !['application/json', 'text/plain', ''].includes(file.type)) {
      return NextResponse.json(
        { success: false, error: API_ERR_IMPORT_FILE_TYPE },
        { status: 400 }
      );
    }

    const content = await file.text();
    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { success: false, error: API_ERR_IMPORT_JSON_INVALID },
        { status: 400 }
      );
    }

    // Handle both array and { foundations: [] } formats
    const batch = Array.isArray(parsed) ? parsed : parsed.foundations || [];

    if (!Array.isArray(batch) || batch.length === 0) {
      return NextResponse.json(
        { success: false, error: API_ERR_IMPORT_EMPTY },
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

    // Get existing foundation IDs (slugs) for deduplication
    const existingFoundations = await db.select({ id: foundations.id }).from(foundations);
    const existingSlugs = new Set(existingFoundations.map(f => f.id));

    // Filter out duplicates by slug and handle within-batch collisions
    const seenSlugs = new Set<string>();
    const newFoundations = validated.filter(f => {
      const slug = toSlug(f.name);
      if (existingSlugs.has(slug) || seenSlugs.has(slug)) return false;
      seenSlugs.add(slug);
      return true;
    });

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

    // Transform and insert — all domain data goes into configData JSONB
    const transformed = newFoundations.map(f => {
      const { min, max } = parseGrantRange(f.grantRange || '');
      const slug = toSlug(f.name);

      // Build configData (SSOT for all foundation domain data)
      const configData = {
        slug,
        name: f.name,
        websiteUrl: f.websiteUrl || '',
        region: f.location || 'Schweiz',
        type: 'foundation' as const,
        fitScore: f.fitScore ?? 0,
        priority: f.priority ?? 4,
        themes: f.focusAreas ?? [],
        amount: { min: f.grantRangeMin ?? min, max: f.grantRangeMax ?? max },
        applicationMethod: f.applicationMethod || 'unknown',
        deadline: f.deadline || null,
        decisionTimeline: f.decisionTimeline || null,
        strategicFit: f.strategicFit || f.fitRationale || null,
        applicationNotes: f.notes || null,
        pastGrantees: f.pastGrantees ?? [],
        boardMembers: f.boardMembers ?? [],
        source: f.source || 'api-import',
      };

      return {
        id: slug,
        name: f.name,
        fitScore: f.fitScore ?? null,
        priority: f.priority ?? null,
        configData,
        researchDepth: 'rapid' as const,
        researchDate: getTodayISO(),
        source: f.source || 'api-import',
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
      { success: false, error: API_ERR_SAVE },
      { status: 500 }
    );
  }
}
