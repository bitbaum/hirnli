/**
 * Status Distribution Chart - applications by status, as a ring with an
 * exact-value legend, drawn by @bitbaum/chartkit.
 */

import { DoughnutChart } from '@bitbaum/chartkit/react';
import { getStatusConfig, type ApplicationStatusId } from '@/lib/config/application-statuses';

interface StatusCount {
  status: ApplicationStatusId;
  count: number;
}

interface StatusDistributionChartProps {
  data: StatusCount[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  return (
    <DoughnutChart
      rows={data.map((item) => ({ label: getStatusConfig(item.status).label, value: item.count }))}
      unit="Gesuche"
      caption="Gesuche nach Status"
      locale="de-CH"
      labelHeading="Status"
      valueHeading="Gesuche"
    />
  );
}
