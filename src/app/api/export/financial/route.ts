import { NextResponse } from 'next/server';
import { exportFinancialData } from '@/lib/domain/data-exporters';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';
import { API_ERR_EXPORT } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

const filePrefix = ORG_PROFILE.name.toLowerCase().replace(/[^a-z0-9]/g, '');

export async function GET() {
  try {
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
