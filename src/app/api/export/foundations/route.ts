import { NextResponse } from 'next/server';
import { exportFoundationList } from '@/lib/domain/data-exporters';
import { getAllFoundations } from '@/lib/db/foundations-repo';
import { getTenant } from '@/lib/tenant/resolve';
import { toFilePrefix } from '@/lib/utils/slug';
import { API_ERR_EXPORT } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

export async function GET() {
  try {
    // Per request, not per build: the filename names whichever organisation
    // asked for the export.
    const filePrefix = toFilePrefix((await getTenant()).name);
    const csv = exportFoundationList(await getAllFoundations());

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filePrefix}-stiftungen.csv"`,
      },
    });
  } catch (error) {
    return apiError('Export', error, API_ERR_EXPORT);
  }
}
