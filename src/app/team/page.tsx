import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import MetricCard from '@/components/metrics/MetricCard';
import MetricGrid from '@/components/metrics/MetricGrid';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import {
  KERNTEAM,
  BILDUNGSPROGRAMMLEITER,
  TEAM_SUMMARY,
  MULTIPLICATION_EFFECT,
  TEAM_CAPACITY,
  DATA_QUALITY_NOTE,
} from '@/lib/config/team';
import { TEAM_MEMBERS, DEPARTMENTS } from './data';

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
        connection="2× Bildungsprogrammleiter ermöglichen 40-60 Menschen/Jahr direkt zu erreichen durch Train-the-Trainer."
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
          value="40-60"
          subtitle="Direkt trainiert + Workshops"
          sourceType="estimated"
        />
      </MetricGrid>

      {/* ========== GANZES TEAM ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unser Team ({TEAM_MEMBERS.length} Personen)</h2>
        <p className="mb-6 text-sm text-text-muted">
          Leitung, Techniker, Betrieb — eine Mischung aus Festangestellten, Freiwilligen und Reintegrations-Teilnehmern.
          Nicht alle arbeiten Vollzeit; Arbeitspensum wird nicht systematisch erfasst.
        </p>

        {DEPARTMENTS.map((dept) => {
          const members = TEAM_MEMBERS.filter((m) => m.bereich === dept.name);
          return (
            <div key={dept.name} className="mb-6">
              <h3 className="text-md font-semibold text-grey-dark mb-3 flex items-center gap-2">
                <span>{dept.icon}</span> {dept.name} ({members.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((member) => (
                  <Card key={member.id} className={`border-l-4 ${dept.borderColor}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-grey-dark">{member.name}</h4>
                        <div className="text-xs text-text-muted mt-1">
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
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Bildungsprogrammleiter (geplant)</h2>
        <p className="mb-4 text-sm text-text-muted">
          Diese 2 Positionen sind der Schlüssel zur Skalierung. Sie ermöglichen Train-the-Trainer Multiplikation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BILDUNGSPROGRAMMLEITER.map((member) => (
            <Card key={member.role} className="border-l-4 border-l-violet-500">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎯</div>
                <div className="flex-1">
                  <h3 className="font-bold text-grey-dark">{member.name}</h3>
                  <div className="text-sm text-violet-700 mb-2">{member.role}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="warning">{member.status}</Badge>
                    <Badge variant="primary">{member.vza} VZÄ</Badge>
                  </div>
                  {member.fachgebiete && (
                    <div className="text-xs text-text-muted">
                      {member.fachgebiete.join(' • ')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-4 bg-violet-50 border-l-4 border-violet-500">
          <h3 className="font-semibold text-violet-900 mb-2">Warum Bildungsprogrammleiter?</h3>
          <p className="text-sm text-violet-800 mb-3">
            <strong>Train-the-Trainer Modell:</strong> 2 bezahlte BPL trainieren und managen
            Freiwillige, Praktikant:innen, Zivis und Integrationsprogramm-Teilnehmende.
            So multiplizieren wir Kapazität ohne massive Lohnkosten — das ist der Kern des sozialen Unternehmensmodells.
          </p>
          <div className="text-sm text-violet-800">
            <strong>Direkte Wirkung:</strong> {MULTIPLICATION_EFFECT.combined.direct_training} Menschen/Jahr direkt trainiert<br />
            <strong>Mit Workshops:</strong> {MULTIPLICATION_EFFECT.combined.people_reached_with_workshops} Menschen/Jahr erreicht (direkt + Workshop-Teilnehmer)
          </div>
        </Card>
      </section>

      {/* ========== MULTIPLIKATOR-EFFEKT ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Train-the-Trainer Multiplikator-Effekt</h2>
        <p className="mb-6 text-sm text-text-muted">
          Wie 2 geplante Bildungsprogrammleiter (Budget-Ziel: CHF 180k/Jahr) durch Train-the-Trainer 40-60 Menschen/Jahr erreichen sollen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hardware BPL */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔧</span>
              <h3 className="text-lg font-bold text-grey-dark">Hardware-BPL</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="font-semibold text-blue-900 mb-1">Direkte Ausbildung</div>
                <div className="text-blue-800">{MULTIPLICATION_EFFECT.hardware_bpl.direct_training} Menschen/Jahr direkt trainiert</div>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 border-l-4 border-blue-600">
                <div className="font-bold text-blue-900">Techniker, Praktikanten und Freiwillige lernen strukturiert Refurbishment</div>
              </div>
            </div>
          </Card>

          {/* Software BPL */}
          <Card className="border-l-4 border-l-violet-500">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💻</span>
              <h3 className="text-lg font-bold text-grey-dark">Software/AI-BPL</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-violet-50 rounded-lg p-3">
                <div className="font-semibold text-violet-900 mb-1">Direkte Ausbildung</div>
                <div className="text-violet-800">{MULTIPLICATION_EFFECT.software_bpl.direct_training} Entwickler/Jahr direkt trainiert</div>
              </div>
              <div className="bg-violet-100 rounded-lg p-3 border-l-4 border-violet-600">
                <div className="font-bold text-violet-900">AI Literacy, Coding, Open-Source-Workshops für alle Niveaus</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Combined Effect */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-violet-50 border-2 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-grey-dark mb-4">Kombinierter Effekt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-sm text-text-muted mb-1">Direkt trainiert</div>
                <div className="text-3xl font-bold text-blue-900">{MULTIPLICATION_EFFECT.combined.direct_training}</div>
                <div className="text-xs text-text-muted">Menschen/Jahr</div>
              </div>
              <div>
                <div className="text-sm text-text-muted mb-1">Mit Workshops erreicht</div>
                <div className="text-3xl font-bold text-violet-900">{MULTIPLICATION_EFFECT.combined.people_reached_with_workshops}</div>
                <div className="text-xs text-text-muted">Menschen/Jahr (konservativ)</div>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-4 text-sm text-left">
              <strong>Das ist der Kern des sozialen Unternehmensmodells:</strong><br />
              Budget-Ziel: CHF 180k/Jahr für 2× BPL → {MULTIPLICATION_EFFECT.combined.people_reached_with_workshops} Menschen/Jahr erreichen (Prognose).<br />
              Geplante Kosten pro direkt trainierter Person: CHF {Math.round(180000 / MULTIPLICATION_EFFECT.combined.direct_training)}
            </div>
          </div>
        </Card>
      </section>

      {/* ========== KAPAZITÄTS-WACHSTUM ========== */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-grey-dark">Kapazitäts-Wachstum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current */}
          <Card className="border-l-4 border-l-gray-400">
            <h3 className="text-lg font-bold text-grey-dark mb-4">Heute (2025, geschätzt)</h3>
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
          <Card className="border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-grey-dark mb-4">Jahr 3 — Ziel (Hub + 2× BPL)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Team:</span>
                <span className="font-semibold text-emerald-700">{TEAM_CAPACITY.year3_with_hub_and_bpl.team_size_vza} VZÄ (+{TEAM_CAPACITY.year3_with_hub_and_bpl.team_size_vza - TEAM_CAPACITY.current.team_size_vza})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geräte/Monat:</span>
                <span className="font-semibold text-emerald-700">{TEAM_CAPACITY.year3_with_hub_and_bpl.devices_per_month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Geräte/Jahr:</span>
                <span className="font-semibold text-emerald-700">{TEAM_CAPACITY.year3_with_hub_and_bpl.devices_per_year.toLocaleString('de-CH')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Menschen trainiert/Jahr:</span>
                <span className="font-semibold text-emerald-700">{TEAM_CAPACITY.year3_with_hub_and_bpl.people_trained_per_year}</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ========== DATENQUALITÄT ========== */}
      <section className="mb-8">
        <Card className="bg-gray-50 border-l-4 border-l-gray-400">
          <h3 className="font-semibold text-grey-dark mb-3">Hinweis zur Datenqualität</h3>
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
            <div className="pt-2 border-t border-gray-200 text-xs">
              <strong>Frühere Datenquelle:</strong> {DATA_QUALITY_NOTE.previous_source}<br />
              <strong>Aktuelle Datenquelle:</strong> {DATA_QUALITY_NOTE.current_source}
            </div>
          </div>
        </Card>
      </section>

      {/* ========== NEXT STEPS ========== */}
      <section className="mb-8">
        <Card className="bg-gradient-to-br from-violet-50 to-blue-50 border-2 border-violet-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-grey-dark mb-4">Mehr erfahren</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/fundraising/bildung"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors inline-block"
              >
                Bildung & Skalierung
              </Link>
              <Link
                href="/fundraising/hub"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Community Tech Hub
              </Link>
              <Link
                href="/strategie"
                className="px-6 py-3 bg-white text-violet-600 border-2 border-violet-600 rounded-lg font-semibold hover:bg-violet-50 transition-colors inline-block"
              >
                Strategie 2030
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
