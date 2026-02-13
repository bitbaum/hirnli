import { NextResponse } from 'next/server';
import { exportFinancialData } from '@/lib/domain/data-exporters';

export async function GET() {
  try {
    const csv = exportFinancialData();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="revampit-finanzen-2018-2025.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
