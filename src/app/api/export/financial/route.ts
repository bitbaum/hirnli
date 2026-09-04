import { NextResponse } from 'next/server';
import { exportFinancialData } from '@/lib/domain/data-exporters';
import { getTenant } from '@/lib/tenant/resolve';
import { toFilePrefix } from '@/lib/utils/slug';
import { FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';
import { API_ERR_EXPORT } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

export async function GET() {
  try {
    // Per request, not per build: the filename names whichever organisation
    // asked for the export.
    const filePrefix = toFilePrefix((await getTenant()).name);
    const csv = exportFinancialData();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filePrefix}-finanzen-${FINANCIAL_YEAR_RANGE}.csv"`,
      },
    });
  } catch (error) {
    return apiError('Export', error, API_ERR_EXPORT);
  }
}
