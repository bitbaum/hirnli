/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 */
import Card from '@/components/ui/Card';
import { SovereigntyPillar } from '../components';
import {
  DEVICES_PER_MONTH_CURRENT_DISPLAY,
  DEVICES_PER_MONTH_TARGET,
} from '@/lib/config/projections';
import { ORG_PROFILE } from '@/lib/config/org-profile';

export default function SovereigntySection() {
  return (
    <section id="souveraenitat" className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">Unser Weg: Souveränität auf jeder Ebene</h2>
      <Card>
        <p className="mb-6 text-sm text-text-light">
          Von Anfang an ging es um Unabhängigkeit — von geplanter Obsoleszenz, von Lizenzkosten, von Abhängigkeit.
          Dieser Weg führt konsequent weiter:
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SovereigntyPillar
            icon="🔧"
            title="Hardware-Souveränität"
            description={`Repariere dein eigenes Gerät. Seit ${ORG_PROFILE.founded}.`}
            colorScheme="emerald"
            achievements={[
              `Seit ${ORG_PROFILE.founded}: Repair-Workshops & Open-Source-Hardware`,
              `${DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat aktuell, ~${DEVICES_PER_MONTH_TARGET}/Monat (Ziel mit Hub)`,
              'Right to Repair — Community-getrieben',
            ]}
            relatedPages={[
              { title: 'Operations', href: '/operations', reason: 'Wie unser Refurbishment-Prozess funktioniert' },
              { title: 'Wirkung', href: '/wirkung', reason: 'Wie viele Geräte wir gerettet haben' },
            ]}
          />
          <SovereigntyPillar
            icon="🐧"
            title="Software-Souveränität"
            description="Linux & Open Source statt Lizenzen."
            colorScheme="blue"
            achievements={[
              `Seit ${ORG_PROFILE.founded}: Linux-Fokus (Ubuntu, Linux Mint, etc.)`,
              '100% Open-Source-Software auf allen Geräten',
              'Keine Lizenzkosten = niedrigere Preise',
            ]}
            relatedPages={[
              { title: 'Preismodell', href: '/preismodell', reason: 'Wie Open-Source Zugang ermöglicht' },
              { title: 'Team', href: '/team', reason: 'Unser Linux-Expertise' },
            ]}
          />
          <SovereigntyPillar
            icon="☁️"
            title="Daten-Souveränität"
            description="Schweizer Cloud & Hosting. Seit 2022."
            colorScheme="violet"
            achievements={[
              'Seit 2022: Nextcloud (Swiss Hosting)',
              'Alle Daten bleiben in der Schweiz',
              'DSGVO-konform, transparent, selbst gehostet',
            ]}
            relatedPages={[
              { title: 'Methodik', href: '/methodik', reason: 'Wie wir Daten verarbeiten' },
            ]}
          />
          <SovereigntyPillar
            icon="🧠"
            title="KI-Souveränität"
            description="Eigene Modelle hosten, trainieren, vermitteln."
            colorScheme="amber"
            achievements={[
              'GPU-Cluster geplant (Community Tech Space)',
              'Lokale KI-Modelle statt Cloud-Abhängigkeit',
              'Sovereign AI Lab für Schweizer Organisationen',
            ]}
            relatedPages={[
              { title: 'Strategie → Community Tech Space', href: '/strategie#community-tech-space', reason: 'Sovereign AI Lab Details' },
            ]}
          />
        </div>
      </Card>
    </section>
  );
}
