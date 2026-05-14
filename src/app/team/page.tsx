import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import {
  BILDUNGSPROGRAMMLEITER,
  MULTIPLICATION_EFFECT,
  TEAM_CAPACITY,
  BPL_TOTAL_COST_PER_YEAR,
  DATA_QUALITY_NOTE,
} from '@/lib/config/team';
import { TEAM_MEMBERS, DEPARTMENTS } from './data';
import { PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';
import { formatNumber } from '@/lib/utils/format';

export const metadata: Metadata = {
  title: 'Team & Kapazität',
  description: 'Kernteam, Bildungsprogrammleiter und Train-the-Trainer Multiplikator',
};

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team & Kapazität"
        subtitle={`${TEAM_MEMBERS.length} Menschen arbeiten bei ${ORG_PROFILE.name} — Leitung, Techniker, Betrieb`}
        badge="SSOT"
      />

      <WhyThisMatters
        purpose={`Zeigt, wer hinter ${ORG_PROFILE.name} steht und wie wir durch Train-the-Trainer skalieren.`}
        connection={`2× Bildungsprogrammleiter ermöglichen ${PEOPLE_REACHED_PER_YEAR} Menschen/Jahr direkt zu erreichen durch Train-the-Trainer.`}
      />

      {/* Key metrics */}
      <MetricGrid columns={3} className="mb-8">
        <MetricCard
          label="Aktuelles Team"
          value={String(TEAM_MEMBERS.length)}
          subtitle="Personen (Leitung, Technik, Betrieb)"
          sourceType="live"
        />
        <MetricCard
          label="Geplant mit Hub"
          value={String(TEAM_MEMBERS.length + BILDUNGSPROGRAMMLEITER.length)}
          subtitle={`+ ${BILDUNGSPROGRAMMLEITER.length} Bildungsprogrammleiter`}
          sourceType="estimated"
        />
        <MetricCard
          label="Menschen/Jahr (Ziel)"
          value={PEOPLE_REACHED_PER_YEAR}
          subtitle="Direkt trainiert + Workshops"
          sourceType="estimated"
        />
      </MetricGrid>

      {/* ========== GANZES TEAM ========== */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Unser Team ({TEAM_MEMBERS.length} Personen)</h2>
        <p className="mb-6 text-sm text-text-muted">
          Leitung, Techniker, Betrieb — eine Mischung aus Festangestellten, Freiwilligen und Reintegrations-Teilnehmern.
          Nicht alle arbeiten Vollzeit; Arbeitspensum wird nicht systematisch erfasst.
        </p>

        {DEPARTMENTS.map((dept) => {
          const members = TEAM_MEMBERS.filter((m) => m.bereich === dept.name);
          return (
            <div key={dept.name} className="mb-6">
              <h3 className="heading-item mb-3 flex items-center gap-2">
                <span>{dept.icon}</span> {dept.name} ({members.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((member) => (
                  <Card key={member.id} className={`border-l-4 ${dept.borderColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="heading-item">{member.name}</h4>
                        <div className="text-sm text-text-muted mt-1">
                          {member.fachgebiete.join(' · ')}
                        </div>
                        {member.capacity && (
                          <Badge variant="warning" className="mt-2">{member.capacity}</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ========== BILDUNGSPROGRAMMLEITER (GEPLANT) ========== */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Bildungsprogrammleiter (geplant)</h2>
        <p className="mb-4 text-sm text-text-muted">
          Diese 2 Positionen sind der Schlüssel zur Skalierung. Sie ermöglichen Train-the-Trainer Multiplikation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BILDUNGSPROGRAMMLEITER.map((member) => (
            <Card key={member.role} className="border-l-4 border-l-pillar-vision">
              <div className="flex items-start gap-3">
                <div className="text-3xl" aria-hidden="true">🎯</div>
                <div className="flex-1">
                  <h3 className="heading-card">{member.name}</h3>
                  <div className="text-sm text-pillar-vision mb-2">{member.role}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="warning">{member.status}</Badge>
                    <Badge variant="primary">{member.vza} VZÄ</Badge>
                  </div>
                  {member.fachgebiete && (
                    <div className="text-sm text-text-muted">
                      {member.fachgebiete.join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-4 bg-pillar-vision/10 border-l-4 border-pillar-vision">
          <h3 className="heading-item text-pillar-vision mb-2">Warum Bildungsprogrammleiter?</h3>
          <p className="text-sm text-pillar-vision mb-3">
            <strong>Train-the-Trainer Modell:</strong> 2 bezahlte BPL trainieren und managen
            Freiwillige, Praktikant:innen, Zivis und Integrationsprogramm-Teilnehmende.
            So multiplizieren wir Kapazität ohne massive Lohnkosten — das ist der Kern des sozialen Unternehmensmodells.
          </p>
          <div className="text-sm text-pillar-vision">
            <strong>Direkte Wirkung:</strong> {MULTIPLICATION_EFFECT.combined.direct_training} Menschen/Jahr direkt trainiert<br />
            <strong>Mit Workshops:</strong> {MULTIPLICATION_EFFECT.combined.people_reached_with_workshops} Menschen/Jahr erreicht (direkt + Workshop-Teilnehmer)
          </div>
        </Card>
      </section>

      {/* ========== MULTIPLIKATOR-EFFEKT ========== */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Train-the-Trainer Multiplikator-Effekt</h2>
        <p className="mb-6 text-sm text-text-muted">
          Wie 2 geplante Bildungsprogrammleiter (Budget-Ziel: CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR / 1000)}k/Jahr inkl. Sozialleistungen) durch Train-the-Trainer {PEOPLE_REACHED_PER_YEAR} Menschen/Jahr erreichen sollen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hardware BPL */}
          <Card className="border-l-4 border-l-primary">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl" aria-hidden="true">🔧</span>
              <h3 className="heading-card">Hardware-BPL</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-primary/10 rounded-lg p-3">
                <div className="font-semibold text-primary mb-1">Direkte Ausbildung</div>
                <div className="text-primary">{MULTIPLICATION_EFFECT.hardware_bpl.direct_training} Menschen/Jahr direkt trainiert</div>
              </div>
              <div className="bg-primary/15 rounded-lg p-3 border-l-4 border-primary">
                <div className="font-bold text-primary">Techniker, Praktikanten und Freiwillige lernen strukturiert Refurbishment</div>
              </div>
            </div>
          </Card>

          {/* Software BPL */}
          <Card className="border-l-4 border-l-pillar-vision">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl" aria-hidden="true">💻</span>
              <h3 className="heading-card">Software/AI-BPL</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-pillar-vision/10 rounded-lg p-3">
                <div className="font-semibold text-pillar-vision mb-1">Direkte Ausbildung</div>
                <div className="text-pillar-vision">{MULTIPLICATION_EFFECT.software_bpl.direct_training} Entwickler/Jahr direkt trainiert</div>
              </div>
              <div className="bg-pillar-vision/15 rounded-lg p-3 border-l-4 border-pillar-vision">
                <div className="font-bold text-pillar-vision">AI Literacy, Coding, Open-Source-Workshops für alle Niveaus</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Combined Effect */}
        <Card className="mt-6 gradient-card-primary border-2 border-primary/20">
          <div className="text-center">
            <h3 className="heading-subsection mb-4">Kombinierter Effekt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-text-muted mb-1">Direkt trainiert</div>
                <div className="heading-stat text-primary">{MULTIPLICATION_EFFECT.combined.direct_training}</div>
                <div className="text-xs text-text-muted">Menschen/Jahr</div>
              </div>
              <div>
                <div className="text-sm text-text-muted mb-1">Mit Workshops erreicht</div>
                <div className="heading-stat text-pillar-vision">{MULTIPLICATION_EFFECT.combined.people_reached_with_workshops}</div>
                <div className="text-xs text-text-muted">Menschen/Jahr (konservativ)</div>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-4 text-sm text-left">
              <strong>Das ist der Kern des sozialen Unternehmensmodells:</strong><br />
              Budget-Ziel: CHF {formatNumber(BPL_TOTAL_COST_PER_YEAR / 1000)}k/Jahr für 2× BPL (inkl. Sozialleistungen) → {MULTIPLICATION_EFFECT.combined.people_reached_with_workshops} Menschen/Jahr erreichen (Prognose).<br />
              Geplante Kosten pro direkt trainierter Person: CHF {Math.round(BPL_TOTAL_COST_PER_YEAR / MULTIPLICATION_EFFECT.combined.direct_training)}
            </div>
          </div>
        </Card>
      </section>

      {/* ========== KAPAZITÄTS-WACHSTUM ========== */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Kapazitäts-Wachstum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current */}
          <Card className="border-l-4 border-l-border">
            <h3 className="heading-card mb-4">Heute (2025, geschätzt)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Team:</span>
                <span className="font-semibold">{TEAM_CAPACITY.current.team_size_vza} VZÄ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geräte/Monat:</span>
                <span className="font-semibold">{TEAM_CAPACITY.current.devices_per_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geräte/Jahr:</span>
                <span className="font-semibold">{TEAM_CAPACITY.current.devices_per_year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Menschen trainiert/Jahr:</span>
                <span className="font-semibold">{TEAM_CAPACITY.current.people_trained_per_year}</span>
              </div>
            </div>
          </Card>

          {/* Year 3 with Hub + BPL */}
          <Card className="border-l-4 border-l-success">
            <h3 className="heading-card mb-4">Jahr 3 — Ziel (Hub + 2× BPL)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Team:</span>
                <span className="font-semibold text-success">{TEAM_CAPACITY.year3_with_hub_and_bpl.team_size_vza} VZÄ (+{TEAM_CAPACITY.year3_with_hub_and_bpl.team_size_vza - TEAM_CAPACITY.current.team_size_vza})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geräte/Monat:</span>
                <span className="font-semibold text-success">{TEAM_CAPACITY.year3_with_hub_and_bpl.devices_per_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geräte/Jahr:</span>
                <span className="font-semibold text-success">{formatNumber(TEAM_CAPACITY.year3_with_hub_and_bpl.devices_per_year)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Menschen trainiert/Jahr:</span>
                <span className="font-semibold text-success">{TEAM_CAPACITY.year3_with_hub_and_bpl.people_trained_per_year}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========== DATENQUALITÄT ========== */}
      <section className="mb-8">
        <Card className="bg-bg-light border-l-4 border-l-border">
          <h3 className="heading-item mb-3">Hinweis zur Datenqualität</h3>
          <div className="space-y-2 text-sm text-text-muted">
            <div>
              <strong>Kernteam:</strong> {DATA_QUALITY_NOTE.kernteam}
            </div>
            <div>
              <strong>Was wir nicht systematisch erfassen:</strong> {DATA_QUALITY_NOTE.what_we_dont_track}
            </div>
            <div>
              <strong>Warum das OK ist:</strong> {DATA_QUALITY_NOTE.why_this_is_ok}
            </div>
            <div className="pt-2 border-t border-border text-sm">
              <strong>Frühere Datenquelle:</strong> {DATA_QUALITY_NOTE.previous_source}<br />
              <strong>Aktuelle Datenquelle:</strong> {DATA_QUALITY_NOTE.current_source}
            </div>
          </div>
        </Card>
      </section>

      {/* ========== NEXT STEPS ========== */}
      <section className="mb-8">
        <Card className="gradient-card-primary border-2 border-pillar-vision/20">
          <div className="text-center">
            <h2 className="heading-section mb-4">Mehr erfahren</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Button href="/wirkung" size="lg">Wirkung & Impact</Button>
              <Button href="/revamp-2030" size="lg">Revamp 2030</Button>
              <Button href="/strategie" variant="secondary" size="lg">Strategie 2030</Button>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
