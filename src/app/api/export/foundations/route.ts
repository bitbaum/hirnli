import { NextResponse } from 'next/server';
import { exportFoundationList } from '@/lib/domain/data-exporters';

export async function GET() {
  try {
    const csv = exportFoundationList();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="revampit-stiftungen.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
