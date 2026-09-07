import { NextResponse } from 'next/server';
import { exportFinancialData } from '@/lib/domain/data-exporters';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';
import { toFilePrefix } from '@/lib/utils/slug';
import { FINANCIAL_YEAR_RANGE } from '@/lib/config/financial-constants';
import { API_ERR_EXPORT, API_ERR_EXPORT_NOT_AUTHORED } from '@/lib/utils/errors';
import { apiError } from '@/lib/api/route-helpers';

export async function GET() {
  // This export is one organisation's accounting, read from code. Without this
  // check the route served it to every tenant, on every host, with the
  // REQUESTING tenant's name in the filename — so the file was labelled as the
  // downloader's own finances and contained somebody else's.
  //
  // Outside the try on purpose: `notFound()` signals by throwing, and the catch
  // below would turn a deliberate 404 into a 500.
  if (!(await ownsCodeContent('finanzen'))) {
    return NextResponse.json(
      { success: false, error: API_ERR_EXPORT_NOT_AUTHORED },
      { status: 404 },
    );
  }

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
