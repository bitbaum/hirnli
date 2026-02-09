'use client';

import { useState, useMemo } from 'react';
import { loadFinancialData, AVAILABLE_YEARS } from '@/lib/data/financial';
import type { MonthlyAggregate } from '@/lib/schemas/financial';

export function useFinancialData(defaultYear = 2025) {
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const dataset = useMemo(() => loadFinancialData(selectedYear), [selectedYear]);

  const monthlyData: MonthlyAggregate[] = useMemo(() => {
    if (dataset.isEmpty()) return [];
    return dataset.getAll();
  }, [dataset]);

  const totals = useMemo(() => {
    return {
      total: dataset.sum('total'),
      warenverkauf: dataset.sum('warenverkauf'),
      dienstleistungen: dataset.sum('dienstleistungen'),
      integration: dataset.sum('integration'),
      spenden: dataset.sum('spenden'),
      aufstockung: dataset.sum('aufstockung'),
    };
  }, [dataset]);

  const monthCount = monthlyData.filter((m) => m.total !== 0).length;
  const monthlyAvg = monthCount > 0 ? totals.total / monthCount : 0;
  const selfFinancingRate =
    totals.total > 0 ? (totals.warenverkauf + totals.dienstleistungen) / totals.total : 0;

  return {
    selectedYear,
    setSelectedYear,
    availableYears: AVAILABLE_YEARS,
    monthlyData,
    totals,
    monthCount,
    monthlyAvg,
    selfFinancingRate,
    dataset,
  };
}
