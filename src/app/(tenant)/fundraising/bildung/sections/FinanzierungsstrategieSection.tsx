import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TEAM_SALARIES, BPL_TOTAL_COST_PER_YEAR } from '@/lib/config/team';
import { PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';
import { formatNumber } from '@/lib/utils/format';

export default function FinanzierungsstrategieSection() {
  const hardware_bpl_cost = TEAM_SALARIES.hardware_bpl * TEAM_SALARIES.social_charges_multiplier;

  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Finanzierungsstrategie: 3 Jahre bis Selbsttragung</h2>
      <Card>
        <p className="text-sm text-text-secondary mb-6">
          Wir suchen <strong>Stiftungsfinanzierung über 3 Jahre</strong> (CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR)}/Jahr, degressiv),
          um die Bildungsprogrammleiter:innen-Stellen zu finanzieren, während wir parallel Einnahmequellen aufbauen.
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Badge variant="info" className="mt-1">Jahr 1</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Aufbau & Pilotphase</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Hardware-BPL eingestellt, Curricula entwickelt, erste Trainings</li>
                <li>Erste trainierte Techniker werden aktiv (2-3 Trainer:innen)</li>
                <li>Finanzierung: 100% Stiftungsgelder (1× BPL: CHF {formatNumber(hardware_bpl_cost)} inkl. Sozialabgaben)</li>
                <li>Einnahmen: Workshop-Fees beginnen (CHF 5-10k, nicht ausreichend für Selbsttragung)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Badge variant="info" className="mt-1">Jahr 2</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Skalierung & zweite:r BPL</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Software/AI-BPL eingestellt, beide Programme laufen parallel</li>
                <li>5 Hardware-Techniker + 3 AI-Trainer gleichzeitig aktiv</li>
                <li>Finanzierung: degressiv (Stiftungsgelder sinken, Eigenmittel durch Kurseinnahmen steigen)</li>
                <li>Einnahmen: Corporate Trainings, Workshop-Fees (CHF 30-40k/Jahr)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Badge variant="success" className="mt-1">Jahr 3 (Ziel)</Badge>
            <div className="flex-1">
              <h3 className="heading-item mb-2">Selbsttragung erreicht</h3>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Train-the-Trainer voll etabliert, {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreicht</li>
                <li>Trainer:innen trainieren ohne unsere direkte Beteiligung</li>
                <li>Finanzierung: 50% Stiftungsgelder, 50% Eigenmittel (Workshop-Fees, Corporate Training)</li>
                <li>Einnahmen: Corporate Trainings, Workshops, Zuschüsse (CHF 80-100k/Jahr)</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
