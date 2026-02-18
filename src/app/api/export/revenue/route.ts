import { NextResponse } from 'next/server';
import { exportRevenueHistory } from '@/lib/domain/data-exporters';
import { ORG_PROFILE } from '@/lib/config/org-profile';

const filePrefix = ORG_PROFILE.name.toLowerCase().replace(/[^a-z0-9]/g, '');

export async function GET() {
  try {
    const csv = exportRevenueHistory();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filePrefix}-einnahmen-historie.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
