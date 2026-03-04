import { NextResponse } from 'next/server';
import { exportFinancialData } from '@/lib/domain/data-exporters';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';

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
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
