/**
 * ORG-SPECIFIC: Content written for Revamp-IT.
 * To support a new org, rewrite this file's content.
 */
import { PillarDetail } from '../components';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import { AVG_DEVICE_PRICE, CO2_NEW_LAPTOP_MANUFACTURE, CO2_PER_LAPTOP, CO2_REFURBISH_COST, getNumericValue } from '@/lib/config/numbers';
import {
  DEVICES_PER_MONTH_CURRENT_DISPLAY,
  DEVICES_PER_MONTH_TARGET,
  DEVICES_PER_YEAR_CURRENT_DISPLAY,
} from '@/lib/config/projections';
import { CUMULATIVE_WARENVERKAUF } from '@/app/finanzen/data';

export default function FourPillarsSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-grey-dark">Vier Säulen unserer Arbeit</h2>
      <p className="mb-6 text-sm text-text-light">
        Unsere Mission ruht auf vier gleichwertigen Säulen. Klicke auf «Mehr erfahren», um zu sehen,
        was wir konkret tun, warum es wichtig ist und was wir erreicht haben.
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PillarDetail
          icon="♻️"
          title="1. Umweltschutz"
          description="Reduktion von Elektroschrott durch Wiederinstandsetzung, Reparatur, Weiterverwendung und fachgerechtes Recycling"
          colorScheme="emerald"
          activities={[
            `Professionelles Refurbishment: ${DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat aktuell (Ziel mit Hub: ~${DEVICES_PER_MONTH_TARGET}/Monat)`,
            'Datenvernichtung nach NIST 800-88 Standard (secure data wipe)',
            'Fachgerechtes Recycling für nicht reparierbare Komponenten',
            `Lebensdauerverlängerung: Ältere Hardware läuft mit Linux weitere ~${getNumericValue('DEVICE_LIFESPAN_EXTENSION')} Jahre`,
          ]}
          whyItMatters={`Jeder neue Laptop verursacht ~${CO2_NEW_LAPTOP_MANUFACTURE} kg CO₂ bei der Herstellung, Refurbishment nur ~${CO2_REFURBISH_COST} kg. Netto-Einsparung: ${CO2_PER_LAPTOP} kg CO₂ pro Gerät (Fraunhofer IZM 2023). Elektroschrott ist einer der am schnellsten wachsenden Abfallströme weltweit (62 Mio. Tonnen/Jahr). Gleichzeitig schonen wir wertvolle Rohstoffe wie Kupfer, Gold und seltene Erden.`}
          achievements={[
            `~${Math.round(CUMULATIVE_WARENVERKAUF / AVG_DEVICE_PRICE / 100) * 100}+ Geräte seit ${ORG_PROFILE.milestones.deviceTrackingStart} (geschätzt aus Kivitendo-Warenverkauf: CHF ${CUMULATIVE_WARENVERKAUF.toLocaleString('de-CH')} / ~CHF ${AVG_DEVICE_PRICE} Durchschnittspreis)`,
            `Aktuelle Kapazität: ${DEVICES_PER_MONTH_CURRENT_DISPLAY} Geräte/Monat, ${DEVICES_PER_YEAR_CURRENT_DISPLAY}/Jahr (geschätzt aus Umsatzdaten)`,
            `Durchschnittliche Lebensdauerverlängerung: ~${getNumericValue('DEVICE_LIFESPAN_EXTENSION')} Jahre pro Gerät (alte Hardware mit Linux)`,
            'Fachgerechtes Recycling für nicht reparierbare Teile (Quote nicht systematisch erfasst)',
          ]}
          relatedPages={[
            { title: 'Wirkung', href: '/wirkung', reason: 'Siehe detaillierte Umwelt-Impact-Zahlen' },
            { title: 'Operations', href: '/operations', reason: 'Wie unser Refurbishment-Prozess funktioniert' },
            { title: 'Methodik', href: '/methodik', reason: 'Wie wir CO₂-Einsparungen berechnen' },
          ]}
        />

        <PillarDetail
          icon="🐧"
          title="2. Digitale Souveränität"
          description="Förderung von Linux & Open-Source Software als nachhaltige, kostengünstige und befähigende Technologieoption"
          colorScheme="blue"
          activities={[
            '100% Linux-Installation (Ubuntu, Linux Mint, Pop!_OS) auf allen verkauften Geräten',
            'Keine Lizenzkosten = niedrigere Preise für Endkunden',
            'Workshops zu Linux-Grundlagen, Terminal, Softwareinstallation',
            'Community-Support & Dokumentation in deutscher Sprache',
          ]}
          whyItMatters="Digitale Souveränität bedeutet: Du besitzt dein Gerät wirklich. Keine Zwangsupdates, keine Vendor Lock-ins, keine Lizenzkosten. Open-Source-Software gibt Nutzern Kontrolle zurück und ermöglicht es, ältere Hardware weiter zu nutzen. Das ist besonders wichtig für Menschen mit geringem Einkommen und für Organisationen, die unabhängig bleiben wollen."
          achievements={[
            `Seit ${ORG_PROFILE.founded}: Pioniere für Linux-Desktop in der Schweiz`,
            '~1\'600+ Geräte mit vorinstalliertem Linux verkauft (2018-2025, geschätzt aus Umsatzdaten)',
            '100% Open-Source-Software auf allen verkauften Geräten',
            'Teil der weltweiten Open-Source-Bewegung',
          ]}
          relatedPages={[
            { title: 'Preismodell', href: '/preismodell', reason: 'Wie Open-Source niedrigere Preise ermöglicht' },
            { title: 'Strategie → Souveränität', href: '/strategie#souveraenitat', reason: 'Unser Souveränitäts-Pfad im Detail' },
          ]}
        />

        <PillarDetail
          icon="📚"
          title="3. Bildung & Aufklärung"
          description="Workshops, technische Unterstützung und niederschwellige Lernangebote — von Reparaturwissen bis zu digitalen Kompetenzen"
          colorScheme="violet"
          activities={[
            'Repair-Workshops: Wie repariere ich meinen eigenen Laptop?',
            'Linux-Einführungskurse für Einsteiger (Deutsch & Englisch)',
            'Technischer Support per E-Mail, Telefon und vor Ort',
            'Community-Events: Repair Cafés, Tech-Talks, Wissensaustausch',
          ]}
          whyItMatters="In einer Welt, die sich durch Automatisierung und KI rasant verändert, werden digitale Kompetenzen zur Grundvoraussetzung für Teilhabe. Gleichzeitig geht Reparaturwissen verloren – dabei ist es ein Schlüssel zu Nachhaltigkeit und Unabhängigkeit. Wir vermitteln beides: Wie man Technologie nutzt UND wie man sie wartet."
          achievements={[
            `Seit ${ORG_PROFILE.founded}: 100+ Menschen in Workshops & Praktika begleitet (Schätzung, nicht systematisch erfasst)`,
            'Repair-Workshops, Linux-Kurse, technischer Support',
            'Niederschwelliger Zugang: Keine Vorkenntnisse erforderlich',
            'Wissensdokumentation: Anleitungen & How-Tos für Community',
          ]}
          relatedPages={[
            { title: 'Team', href: '/team', reason: 'Wer diese Workshops durchführt' },
            { title: 'Wirkung', href: '/wirkung', reason: 'Wie viele Menschen wir erreicht haben' },
          ]}
        />

        <PillarDetail
          icon="🤝"
          title="4. Soziale Integration"
          description="Unterstützung bei der beruflichen Wiedereingliederung durch Struktur, Routinen und sinnvolle Tätigkeiten"
          colorScheme="amber"
          activities={[
            'Arbeitsintegrationsprogramme für Menschen mit erschwertem Arbeitsmarktzugang',
            'Praktikumsplätze mit Betreuung & Skill-Entwicklung',
            'Strukturierte Tagesabläufe: Refurbishment, Verkauf, Werkstatt',
            'Zusammenarbeit mit Sozialdiensten (AOZ, Caritas, etc.)',
          ]}
          whyItMatters="Geflüchtete, Langzeitarbeitslose und Menschen mit Behinderungen haben oft erschwerten Zugang zum Arbeitsmarkt – nicht wegen fehlender Fähigkeiten, sondern wegen fehlender Chancen. Wir bieten einen geschützten Rahmen, um praktische IT-Skills zu entwickeln, Selbstvertrauen aufzubauen und Referenzen zu sammeln. Das ist besonders wichtig, wenn Automatisierung traditionelle Einstiegsjobs ersetzt."
          achievements={[
            `Seit ${ORG_PROFILE.milestones.integrationProgram}: Arbeitsintegrationsprogramme für benachteiligte Menschen`,
            'Zusammenarbeit mit AOZ, Caritas und anderen Sozialpartnern',
            'Erfolgreiche Vermittlungen in den ersten Arbeitsmarkt',
            'Sinnvolle Arbeit: Jedes refurbishte Gerät ist messbarer Impact',
          ]}
          relatedPages={[
            { title: 'Wirkung', href: '/wirkung', reason: 'Soziale Impact-Metriken im Detail' },
            { title: 'Team', href: '/team', reason: 'Unser Team & unsere Werte' },
          ]}
        />
      </div>
    </section>
  );
}
