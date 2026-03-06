/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * Programmatic org references use ORG_PROFILE (src/lib/config/org-profile.ts).
 */
'use client';

import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import NumberInspector from '@/components/metrics/NumberInspector';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import ShareButton from '@/components/ui/ShareButton';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useNumberInspector } from '@/hooks/useNumberInspector';
import { formatCHF, calcGrowth } from '@/lib/utils/format';
import {
  ANNUAL_PL,
  PEAK_REVENUE,
  PEAK_YEAR,
  DATA_QUALITY,
} from './data';
import OverviewTab from './tabs/OverviewTab';
import MonthlyTab from './tabs/MonthlyTab';

const TABS = [
  { id: 'overview', label: 'Jahresübersicht' },
  { id: 'monthly', label: 'Monatsdetails' },
];

export default function FinanzenClient() {
  const financialData = useFinancialData(2025);
  const inspector = useNumberInspector();
  const prevYear = useFinancialData(financialData.selectedYear - 1);
  const growth = prevYear.totals.total > 0
    ? calcGrowth(prevYear.totals.total, financialData.totals.total)
    : 0;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-0">
        <PageHeader
          title="Finanzübersicht"
          subtitle="Einnahmen & Aufwand — Kivitendo Buchhaltung 2018–2025"
          badge="Quelldaten aus Buchhaltung"
        />
        <div className="shrink-0 pt-1">
          <ShareButton />
        </div>
      </div>

      <WhyThisMatters
        purpose="Transparente Finanzdaten zeigen unsere wirtschaftliche Entwicklung und Herausforderungen."
        connection="Zahlen erklären WARUM wir Stiftungsgelder brauchen — und warum Transformation jetzt nötig ist, nicht irgendwann."
      />

      {/* Revenue decline narrative */}
      <Card className="mb-6 border-l-4 border-l-orange-500 bg-orange-50">
        <h3 className="font-semibold text-grey-dark mb-2">Warum jetzt? Die Ausgangslage ehrlich</h3>
        <div className="text-sm text-text-light space-y-2">
          <p>
            Unsere Einnahmen sind von <strong>CHF {formatCHF(PEAK_REVENUE)}</strong> ({PEAK_YEAR}) auf <strong>{formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenue)}</strong> ({ANNUAL_PL[ANNUAL_PL.length - 1].year}) gefallen — ein Rückgang von über 50%.
            Der Haupttreiber: Verlust von B2B-Hosting-Kunden (Dienstleistungen von {formatCHF(Math.max(...ANNUAL_PL.filter(y => y.isComplete).map(y => y.revenueDetail.dienstleistungen)))} auf {formatCHF(ANNUAL_PL[ANNUAL_PL.length - 1].revenueDetail.dienstleistungen)}).
          </p>
          <p>
            Das aktuelle Modell — abhängig von wenigen grossen Einzelkunden — ist <strong>fragil</strong>.
            Stiftungsgelder sind keine Wachstumsinvestition, sondern ermöglichen die <strong>Diversifizierung</strong>,
            die Revamp-IT zum langfristigen Überleben braucht.
          </p>
          <p className="text-xs text-text-muted">
            Alle Zahlen aus Kivitendo Buchhaltung. Vollständige P&L nur für {DATA_QUALITY.completeRange} verfügbar.
            Seit 2024 wurden keine Aufwände verbucht.
          </p>
        </div>
      </Card>

      <Card className="mb-6 bg-blue-50 border-l-4 border-blue-500">
        <p className="text-sm">
          <strong>Diese Seite zeigt:</strong> Einnahmen & Ausgaben (woher kommt das Geld?)<br />
          <strong>Impact ansehen:</strong> <Link href="/wirkung" className="text-blue-600 hover:underline font-medium">Wirkungsseite</Link>
          {' '}zeigt, was wir mit dem Geld bewirken.
        </p>
      </Card>

      <Tabs tabs={TABS} defaultTab="overview">
        {(activeTab) => (
          <>
            {activeTab === 'overview' && <OverviewTab inspector={inspector} />}
            {activeTab === 'monthly' && (
              <MonthlyTab
                data={financialData}
                prevTotals={prevYear.totals}
                growth={growth}
                inspector={inspector}
              />
            )}
          </>
        )}
      </Tabs>

      <NumberInspector isOpen={inspector.isOpen} onClose={inspector.close} data={inspector.data} />
      <StoryBridge bridges={STORY_BRIDGES.finanzen} />
    </div>
  );
}
