/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 * The organisation's own identity comes from the request's tenant.
 */
import type { Metadata } from 'next';
import CTABanner from '@/components/ui/CTABanner';
import PageHeader from '@/components/layout/PageHeader';
import ContentNotPublished from '@/components/layout/ContentNotPublished';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';
import Card from '@/components/ui/Card';
import WhyThisMatters from '@/components/layout/WhyThisMatters';
import StoryBridge from '@/components/layout/StoryBridge';
import { STORY_BRIDGES } from '@/lib/config/story-bridges';
import {
  DEVICES_PER_MONTH_TARGET,
  PEOPLE_REACHED_DISPLAY,
  REVENUE_DECLINE_DISPLAY,
  YEARS_EXPERIENCE_DISPLAY,
} from '@/lib/config/projections';
import { getNumericValue } from '@/lib/config/numbers';
import { formatNumber } from '@/lib/utils/format';
import ProblemDiagnosis from './sections/ProblemDiagnosis';
import SolutionGrid from './sections/SolutionGrid';
import ReachSection from './sections/ReachSection';
import ArtCultureSection from './sections/ArtCultureSection';
import RoadmapSection from './sections/RoadmapSection';

export const metadata: Metadata = {
  title: 'Revamp 2030 — Zukunftsvision',
  description:
    'Von unorganisiertem 3-Personen-Team zu strukturiertem Impact-Hub: Organisation + Raum + Kultur',
};

export default async function Revamp2030Page() {
  const tenant = await getTenant();

  // This page is one organisation's own material. Rendering it for another
  // tenant presented those facts as theirs; see lib/content/page-content.ts.
  if (!(await ownsCodeContent('vision'))) {
    return (
      <>
        <PageHeader title="Vision" subtitle={`Vision von ${tenant.name}`} />
        <ContentNotPublished
          page="Vision"
          tenantName={tenant.name}
          describes="Hier erscheint die langfristige Vision der Organisation, sobald sie veröffentlicht ist."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Revamp 2030"
        subtitle="Das eigentliche Problem ist nicht Raum — es ist Organisation, Struktur und fehlende professionelle Leitung"
        badge="Vision"
      />

      <WhyThisMatters
        purpose="Revamp 2030 zeigt die ehrliche Diagnose unserer Engpässe und wie wir sie durch zwei strategische Investitionen lösen: Hub (Infrastruktur) + Bildungsprogrammleiter:innen (Organisation & Multiplikation)."
        connection="Diese Seite erklärt das WARUM hinter der Strategie. Details zu Budget und Umsetzung: Fundraising → Hub und Fundraising → Bildung."
      />

      {/* Vision 2030 */}
      <section className="mb-8">
        <Card variant="muted">
          <h2 className="heading-stat mb-3">Vision 2030</h2>
          <p className="text-lg mb-4 font-semibold text-text-primary leading-snug">
            Jedes IT-Gerät schöpft sein volles Potenzial aus. Niemand wird aufgrund mangelnder
            Technologie ausgeschlossen.
          </p>
          <p className="text-base mb-4 text-text-secondary leading-relaxed">
            Bis 2030 wollen wir durch <strong>bessere Prozesse und Bildungsprogramme</strong> mehr
            Menschen befähigen und effizienter refurbishen — nicht durch endlosen Raum, sondern
            durch klare Organisation.
          </p>
          <div className="rounded-lg border border-border-subtle bg-surface-base p-4">
            <p className="text-sm text-text-secondary">
              <strong>Realistische Ziele (Jahr 3):</strong> ~{DEVICES_PER_MONTH_TARGET} Geräte/Monat
              (durch effiziente Prozesse, nicht durch endlos Raum). Menschen-Wirkung:{' '}
              {PEOPLE_REACHED_DISPLAY} durch Train-the-Trainer + Workshops (konservative Schätzung).
            </p>
            <p className="text-xs text-text-tertiary mt-2">
              Aktuelle Kapazität nicht systematisch getrackt — Zahlen sind Schätzungen.
              Systematische Erfassung ab 2026 geplant.
            </p>
          </div>
        </Card>
      </section>

      <ProblemDiagnosis />
      <SolutionGrid />

      {/* Digitale Plattform */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Digitale Plattform — unsere eigene Software</h2>
        <Card className="border-l-4 border-l-pillar-digital">
          <div className="flex items-start gap-4">
            <span className="text-4xl" aria-hidden="true">
              🌐
            </span>
            <div className="flex-1">
              <p className="text-sm text-text-secondary mb-4">
                Revamp-IT ist nicht nur eine Werkstatt —{' '}
                <strong>wir entwickeln eigene Software</strong>. Unsere Community-Plattform (
                <a
                  href="https://revampit.orangecat.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pillar-digital hover:text-pillar-digital underline"
                >
                  revampit.orangecat.ch
                </a>
                ) ist eine produktionsreife Full-Stack-Anwendung mit{' '}
                {formatNumber(getNumericValue('PLATFORM_CODEBASE_FILES'))} TypeScript-Dateien,{' '}
                {formatNumber(getNumericValue('PLATFORM_COMPONENTS'))} Komponenten und{' '}
                {formatNumber(getNumericValue('PLATFORM_PAGES'))} Seiten — eigenentwickelt, Open
                Source.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-pillar-digital/10 rounded-lg p-3">
                  <p className="heading-detail text-pillar-digital mb-2">
                    Was die Plattform bietet:
                  </p>
                  <ul className="text-sm text-pillar-digital space-y-1 list-disc list-inside">
                    <li>
                      <strong>Community-Marktplatz:</strong> Gebrauchte IT transparent kaufen und
                      verkaufen
                    </li>
                    <li>
                      <strong>IT-Hilfe-Portal:</strong> Community-basierter Tech-Support
                    </li>
                    <li>
                      <strong>Knowhow-Plattform:</strong> Reparaturanleitungen, Workshops, Blog
                    </li>
                    <li>
                      <strong>Geräte-Erfassung:</strong> Lückenlose Dokumentation vom Eingang bis
                      zum Verkauf
                    </li>
                  </ul>
                </div>
                <div className="bg-pillar-digital/10 rounded-lg p-3">
                  <p className="heading-detail text-pillar-digital mb-2">
                    Warum das unsere Wirkung erhöht:
                  </p>
                  <ul className="text-sm text-pillar-digital space-y-1 list-disc list-inside">
                    <li>
                      <strong>Messbarkeit:</strong> Systematische Erfassung statt Schätzungen —
                      jedes Gerät, jeder Service-Kontakt wird dokumentiert
                    </li>
                    <li>
                      <strong>Skalierung:</strong> Online-Marktplatz und Wissensportal erreichen
                      Menschen weit über Zürich hinaus
                    </li>
                    <li>
                      <strong>Effizienz:</strong> Ein IT-Hilfe-Portal bedient 100 Anfragen so
                      effizient wie 10
                    </li>
                    <li>
                      <strong>Open Source:</strong> Andere Organisationen können die Plattform
                      nachnutzen
                    </li>
                  </ul>
                </div>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface-raised p-4">
                <p className="heading-detail text-pillar-digital mb-2">
                  Tech-Stack (produktionsreif):
                </p>
                <p className="text-sm text-text-secondary mb-2">
                  Next.js, TypeScript, PostgreSQL, Redis, Meilisearch, Auth.js, Payrexx —
                  professionelle Architektur mit{' '}
                  {formatNumber(getNumericValue('PLATFORM_DB_MIGRATIONS'))} Datenbank-Migrationen
                  und {formatNumber(getNumericValue('PLATFORM_API_ROUTES'))}+ API-Endpunkten.
                </p>
                <p className="text-sm text-text-secondary">
                  <strong>Das beweist:</strong> Wir haben nicht nur die handwerkliche Kompetenz,
                  Geräte zu reparieren — wir haben auch die technische Kompetenz, die digitale
                  Infrastruktur dafür selbst zu bauen. Stiftungen investieren nicht in eine
                  Werkstatt. Sie investieren in eine Organisation, die Technologie versteht und
                  einsetzt.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <ReachSection />
      <ArtCultureSection />
      <RoadmapSection />

      {/* Warum jetzt? */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">Warum jetzt?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-danger">
            <h3 className="heading-item mb-2">🚨 Das Problem</h3>
            <p className="text-sm text-text-secondary">
              Einnahmen von {REVENUE_DECLINE_DISPLAY} gefallen — B2B-Kunden verloren,
              Dienstleistungen eingebrochen. Das eigentliche Problem:{' '}
              <strong>Fehlende Organisation für Verkauf & Ausführung</strong>, nicht fehlende
              Kapazität.
            </p>
          </Card>
          <Card className="border-l-4 border-l-amber">
            <h3 className="heading-item mb-2">🎯 Die Lösung</h3>
            <p className="text-sm text-text-secondary">
              Nicht mehr Raum, sondern{' '}
              <strong>bessere Prozesse + bezahlte Bildungsprogrammleiter</strong>. Sie organisieren
              Workflows, bilden Techniker aus, koordinieren Freiwillige & Reintegrations-Teilnehmer.
            </p>
          </Card>
          <Card className="border-l-4 border-l-success">
            <h3 className="heading-item mb-2">💪 Wir sind bereit</h3>
            <p className="text-sm text-text-secondary">
              {YEARS_EXPERIENCE_DISPLAY}. Soziale Mission mit sozialpädagogischem Fokus (Veronica).
              Wir wissen genau, was fehlt:{' '}
              <strong>Organisation, Struktur, bezahlte Fachleute</strong>.
            </p>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <CTABanner
          title="Hilf uns, Revamp 2030 zu verwirklichen"
          description={
            <>
              Es geht nicht nur um Geräte oder Workshops — es geht darum,{' '}
              <strong>wie Menschen über Technologie denken</strong>. Durch Organisation, Bildung,
              Kunst und Kultur schaffen wir eine Plattform für{' '}
              <strong>digitale Teilhabe und nachhaltige Innovation</strong>.
            </>
          }
          links={[
            { href: '/wirkung', label: '🌱 Unsere Wirkung ansehen' },
            { href: '/finanzen', label: '💰 Finanzen im Detail', variant: 'secondary' },
          ]}
        />
      </section>

      <StoryBridge bridges={STORY_BRIDGES.vision ?? []} />
    </>
  );
}
