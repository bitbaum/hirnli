import Card from '@/components/ui/Card';
import { TEAM_SALARIES, BPL_TOTAL_COST_PER_YEAR, MULTIPLICATION_EFFECT } from '@/lib/config/team';
import { formatNumber } from '@/lib/utils/format';

export default function BildungBudgetSection() {
  const bplGross = TEAM_SALARIES.hardware_bpl + TEAM_SALARIES.software_bpl;
  const bplSocialCharges = bplGross * (TEAM_SALARIES.social_charges_multiplier - 1);

  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Budget: Was kostet das?</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-primary">
          <h3 className="heading-card mb-4">Personalkosten (pro Jahr)</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-text-light">Hardware-BPL (1 VZÄ)</span>
              <span className="heading-item">CHF {formatNumber(TEAM_SALARIES.hardware_bpl)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-text-light">Software/AI-BPL (1 VZÄ)</span>
              <span className="heading-item">CHF {formatNumber(TEAM_SALARIES.software_bpl)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-sm text-text-light">Sozialabgaben (20%)</span>
              <span className="heading-item">CHF {formatNumber(bplSocialCharges)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-primary/10 rounded-lg p-3">
              <span className="text-base font-bold text-primary">Total pro Jahr</span>
              <span className="text-xl font-bold text-primary">CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR)}</span>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-success gradient-card-success">
          <h3 className="heading-card text-success mb-4">Return on Investment</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-success mb-1">Investition pro direkt Trainierter</div>
              <div className="text-2xl font-bold text-success">
                CHF {formatNumber(Math.round(BPL_TOTAL_COST_PER_YEAR / MULTIPLICATION_EFFECT.combined.direct_training))}
              </div>
              <div className="text-sm text-success">pro direkt trainierter Person/Jahr</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-success mb-1">Menschen erreicht (konservativ)</div>
              <div className="text-2xl font-bold text-success">
                {MULTIPLICATION_EFFECT.combined.people_reached_with_workshops}
              </div>
              <div className="text-sm text-success">Menschen/Jahr (direkt + Workshops)</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-success mb-1">Finanzierungsziel</div>
              <div className="text-2xl font-bold text-success">3 Jahre</div>
              <div className="text-sm text-success">CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR)}/Jahr bis Selbsttragung</div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
