import type { Metadata } from 'next';
import CTABanner from '@/components/ui/CTABanner';
import PageHeader from '@/components/layout/PageHeader';
import ContentNotPublished from '@/components/layout/ContentNotPublished';
import { getTenant } from '@/lib/tenant/resolve';
import { ownsCodeContent } from '@/lib/content/page-content';
import Card from '@/components/ui/Card';
import { HUB_SPACE_DISPLAY } from '@/lib/config/projections';
import { HubImageGenerator } from '@/components/hub/HubImageGenerator';
import BudgetSection from './BudgetSection';
import SpacePlanningSection from './sections/SpacePlanningSection';
import CoreBusinessSection from './sections/CoreBusinessSection';
import OperationsSection from './sections/OperationsSection';
import InnovationSection from './sections/InnovationSection';
import CultureSection from './sections/CultureSection';

export const metadata: Metadata = {
  title: 'Revamp Hub — Community Tech Space',
  description:
    'Werkstatt, Kultur, Innovation: Wo Nachhaltigkeit, Technologie und Gemeinschaft zusammenkommen',
};

export default async function HubPage() {
  const tenant = await getTenant();

  // A project page: one organisation's premises plan / programme. There is
  // no meaningful partial — an empty version of it says nothing.
  if (!(await ownsCodeContent('hub'))) {
    return (
      <>
        <PageHeader
          title="Community Tech Space"
          subtitle={`Community Tech Space von ${tenant.name}`}
        />
        <ContentNotPublished
          page="Community Tech Space"
          tenantName={tenant.name}
          describes="Hier erscheint das Raumkonzept der Organisation, sobald ein Standortprojekt hinterlegt ist."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Revamp Hub"
        subtitle="Mehr als eine Werkstatt: Ein Ort, wo Technologie, Kultur und Gemeinschaft zusammenkommen"
        badge="Hub"
      />

      {/* Vision */}
      <section className="mb-8">
        <Card className="border-l-4 border-l-primary">
          <h2 className="heading-section mb-4">
            Der Revamp Hub: Prozesse professionalisieren, Menschen befähigen
          </h2>
          <p className="text-base text-text-secondary mb-4 leading-relaxed">
            <strong>Das Kernproblem heute:</strong> Nicht fehlende Fläche, sondern fehlende
            Organisation. Wir haben zu viel Inventar in 2 Lagern, aber keine effizienten Verkaufs-
            und Refurbishment-Prozesse. 4 Reparaturtische vorhanden, meist nur 1-2 in Nutzung.
            Unstrukturierte Workflows.
          </p>
          <p className="text-base text-text-secondary mb-6 leading-relaxed">
            <strong>Die Lösung:</strong> {HUB_SPACE_DISPLAY} effizienter, gut organisierter Raum.
            Nicht endlos Platz — sondern <strong>strukturierte Prozesse</strong> mit 2
            Bildungsprogrammleitern + sozialpädagogischer Begleitung (Veronica). Plus: Tech-Bildung,
            AI Lab, Makerspace — damit Menschen nicht nur konsumieren, sondern lernen und gestalten.
          </p>
        </Card>
      </section>

      <SpacePlanningSection />
      <CoreBusinessSection />
      <OperationsSection />
      <InnovationSection />
      <CultureSection />

      {/* Budget (Interactive Scenarios) */}
      <BudgetSection />

      {/* AI Image Generation */}
      <section className="mb-8">
        <h2 className="mb-4 heading-subsection">🎨 Hub visualisieren: AI-Bilder generieren</h2>
        <p className="text-sm text-text-secondary mb-6">
          Erstelle professionelle Visualisierungen der verschiedenen Hub-Bereiche mit
          AI-Bildgenerierung. Wähle einen Raum, kopiere den Prompt, und generiere in Midjourney,
          DALL-E 3 oder Stable Diffusion.
        </p>
        <HubImageGenerator />
      </section>

      {/* Call to Action */}
      <section className="mb-8">
        <CTABanner
          title="Hilf uns, diesen Ort zu schaffen"
          description={
            <>
              Der Revamp Hub ist mehr als ein Gebäude — es ist eine Plattform für{' '}
              <strong>
                digitale Teilhabe, kulturelle Transformation und nachhaltige Innovation
              </strong>
              . Mit deiner Unterstützung können wir zeigen: Elektroschrott ist nicht Müll — es ist
              Potenzial.
            </>
          }
          variant="light"
          links={[
            { href: '/fundraising', label: '📊 Fundraising-Übersicht' },
            {
              href: '/fundraising/stiftungen',
              label: '🏛️ Passende Stiftungen finden',
              variant: 'secondary',
            },
            { href: '/revamp-2030', label: '🚀 Gesamtstrategie 2030', variant: 'secondary' },
          ]}
        />
      </section>
    </>
  );
}
