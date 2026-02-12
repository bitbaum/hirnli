# Comprehensive Storytelling Implementation Plan

## Mission: Data-Driven, Transparent, Mission-First Storytelling

**Goal:** Every number tells a story. Every story connects to mission. Every claim has a downloadable source.

---

## Phase 1: Foundation — Data Infrastructure (1-2 hours)

### 1.1 Central Number Registry
**File:** `src/lib/config/numbers.ts`

**Purpose:** Single source of truth for ALL numbers across site

```typescript
export const NUMBERS = {
  // Current Reality (2026-02-12)
  current: {
    yearsActive: {
      value: 23,
      since: 2003,
      source: {
        title: 'Handelsregister-Auszug',
        file: '/documents/legal/handelsregister-auszug-2026.pdf',
        verified: '2026-02-11',
      },
      confidence: 'high',
    },
    laptopsRefurbished2025: {
      value: 1_200,
      period: 'Jahr 2025',
      source: {
        title: 'Kivitendo Produktliste Export',
        file: '/documents/financials/kivitendo-produkte-2025.pdf',
        methodology: 'Durchschnitt 100 Laptops/Monat × 12 Monate',
        verified: '2026-02-11',
      },
      confidence: 'estimated',
    },
    co2PerLaptop: {
      value: 285,
      unit: 'kg CO2',
      source: {
        title: 'Fraunhofer IZM Studie 2023',
        file: '/documents/impact/fraunhofer-izm-co2-studie-2023.pdf',
        calculation: 'Neuproduktion (350kg) - Refurbishing (65kg) = 285kg',
        verified: '2024-06-15',
      },
      confidence: 'high',
    },
    // ... all other numbers
  },

  // Hub Projections
  hub: {
    year1: { /* ... */ },
    year2: { /* ... */ },
    year3: { /* ... */ },
  },
};
```

**Benefits:**
- ✅ Update once → propagates everywhere
- ✅ No contradictions
- ✅ Every number has source
- ✅ Confidence level visible

### 1.2 Document Library Setup
**Directory:** `public/documents/`

```
public/documents/
├── financials/
│   ├── kivitendo-produkte-2025.pdf          # Anonymized product list
│   ├── jahresrechnung-2024.pdf              # Annual accounts (public)
│   └── budget-modell-2026-2028.xlsx         # Budget model (downloadable)
│
├── impact/
│   ├── fraunhofer-izm-co2-studie-2023.pdf   # CO2 study
│   ├── arbeitsintegration-2020-2025.pdf     # Work integration report
│   └── kundenfeedback-anonymisiert-2025.pdf # Customer feedback (anonymized)
│
├── strategy/
│   ├── community-tech-hub-konzept.pdf       # Hub concept
│   ├── 3-jahres-finanzplan.pdf              # 3-year plan
│   └── sdg-mapping-revampit.pdf             # SDG alignment
│
├── legal/
│   ├── handelsregister-auszug-2026.pdf      # Commercial register
│   ├── statuten-revampit.pdf                # Statutes
│   └── gemeinnuetzigkeit-bestaetigung.pdf   # Non-profit confirmation
│
└── methodology/
    ├── number-calculation-methods.pdf        # How we calculate
    ├── data-sources-overview.pdf            # Where data comes from
    └── quality-assurance-process.pdf        # QA methodology
```

**Anonymization Rules:**
- ❌ No customer names
- ❌ No personal addresses
- ❌ No sensitive contract details
- ✅ Aggregated data OK
- ✅ Anonymized feedback OK
- ✅ Public records OK

### 1.3 NumberWithSource Component
**File:** `src/components/data/NumberWithSource.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface NumberWithSourceProps {
  value: number | string;
  label: string;
  source: {
    title: string;
    file: string;
    verified?: string;
    methodology?: string;
    calculation?: string;
  };
  confidence: 'high' | 'medium' | 'estimated';
  unit?: string;
}

export function NumberWithSource({ value, label, source, confidence, unit }: NumberWithSourceProps) {
  const [showModal, setShowModal] = useState(false);

  const confidenceBadge = {
    high: { color: 'green', label: 'Verifiziert' },
    medium: { color: 'yellow', label: 'Geschätzt (Mittel)' },
    estimated: { color: 'orange', label: 'Geschätzt' },
  };

  return (
    <div className="group relative">
      {/* The Number */}
      <button
        onClick={() => setShowModal(true)}
        className="text-left hover:bg-blue-50 rounded-lg p-4 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-300"
      >
        <div className="text-4xl font-bold text-gray-900">
          {value} {unit && <span className="text-2xl">{unit}</span>}
        </div>
        <div className="text-sm text-gray-600 mt-1">{label}</div>

        {/* Confidence Badge */}
        <div className={`mt-2 inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-${confidenceBadge[confidence].color}-100 text-${confidenceBadge[confidence].color}-700`}>
          <span>{confidenceBadge[confidence].label}</span>
          <span className="opacity-50">ⓘ</span>
        </div>
      </button>

      {/* Hover Tooltip */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10">
        Klicken für Quelle & Methodik →
      </div>

      {/* Source Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Datenquelle</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Number */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="text-3xl font-bold text-blue-900">
                {value} {unit}
              </div>
              <div className="text-sm text-blue-700 mt-1">{label}</div>
            </div>

            {/* Source Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Quelle:</label>
                <p className="text-gray-900">{source.title}</p>
              </div>

              {source.methodology && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Methodik:</label>
                  <p className="text-gray-900">{source.methodology}</p>
                </div>
              )}

              {source.calculation && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Berechnung:</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-100 p-3 rounded">
                    {source.calculation}
                  </p>
                </div>
              )}

              {source.verified && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Verifiziert:</label>
                  <p className="text-gray-900">{new Date(source.verified).toLocaleDateString('de-CH')}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Vertrauensstufe:</label>
                <p className="text-gray-900">{confidenceBadge[confidence].label}</p>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-6 pt-6 border-t">
              <a
                href={source.file}
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={20} />
                Quelldokument herunterladen
              </a>
              <p className="text-xs text-gray-500 mt-2">
                PDF-Dokument • Anonymisiert • Öffentlich
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Result:** Every number is clickable, shows source, downloadable.

---

## Phase 2: Content Fixes — Correct Business Model (2-3 hours)

### 2.1 Update All Pages

**Files to Update:**
1. `COMPLETE.md` — Remove "laptop sales"
2. `IMPLEMENTATION_SUMMARY.md` — Correct model
3. `src/lib/pdf/GesuchTemplate.tsx` — Fix intro
4. All Gesuch templates — Update language
5. Dashboard components — Correct framing

**Find & Replace:**
```bash
# Find all instances
grep -r "laptop sales" src/
grep -r "Solidaritätspreise" src/
grep -r "80% self-financed" src/
grep -r "sell laptops" src/

# Replace with
"kostenlose Laptops für Organisationen"
"Non-Profit mit hybridem Modell"
"Revenue finanziert Operations, Stiftungen finanzieren Impact"
```

### 2.2 Add Mission Connection Template

**File:** `src/lib/config/mission-connections.ts`

```typescript
export const MISSION_CONNECTIONS = {
  corporateBB: {
    revenue: 120_000,
    finances: 'Werkstatt Operations (Miete, Gehälter)',
    enables: '500 kostenlose Laptops/Jahr für AOZ, Caritas, Asylorganisation ZH',
    achieves: 'SDG 10: Reduced Inequalities - Digitaler Zugang für alle',
    story: `Zürich Tech-Firmen entsorgen jährlich Tausende Laptops. Wir bieten verantwortungsvolle IT-Entsorgung: Unternehmen zahlen → Wir refurbishen → Sozialarbeiter verteilen GRATIS.`,
  },
  workshops: {
    revenue: 90_000,
    finances: 'Education Program Manager Gehälter',
    enables: '50 kostenlose AI Literacy Kurse für Geflüchtete',
    achieves: 'SDG 4: Quality Education - AI-Kenntnisse für benachteiligte Gruppen',
    story: `Unternehmen zahlen CHF 500 pro Workshop → Finanziert kostenlose Kurse. 1 Manager → 5 Trainer → 100 Teilnehmer/Jahr. Multiplikationseffekt: 1:100.`,
  },
  // ... all revenue sources
};
```

---

## Phase 3: Interactive UX — Progressive Disclosure (3-4 hours)

### 3.1 ProcessStep Component
**File:** `src/components/process/ProcessStep.tsx`

```tsx
'use client';

import { useState } from 'react';

interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  details: {
    whatHappens: string;
    timeRequired: string;
    tools: string[];
    qualityCheck: string;
    output: string;
  };
  icon?: string;
}

export function ProcessStep({ number, title, description, details, icon }: ProcessStepProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Step Header (Always Visible) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          {/* Number Badge */}
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {number}
          </div>

          {/* Title */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>

          {/* Expand Icon */}
          <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
            {expanded ? '▼' : '▶'}
          </div>
        </div>

        {/* Hover Tooltip */}
        {!expanded && (
          <div className="absolute top-full left-0 mt-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10">
            Klicken für Details →
          </div>
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Was passiert:</h4>
            <p className="text-gray-700">{details.whatHappens}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Zeitaufwand:</h4>
              <p className="text-gray-700">{details.timeRequired}</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Output:</h4>
              <p className="text-gray-700">{details.output}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Werkzeuge:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {details.tools.map((tool, i) => (
                <li key={i}>{tool}</li>
              ))}
            </ul>
          </div>

          <div className="bg-green-100 border-l-4 border-green-600 p-4">
            <h4 className="font-semibold text-green-900 mb-1">✓ Qualitätssicherung:</h4>
            <p className="text-green-800">{details.qualityCheck}</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.2 Refurbishing Process Page
**File:** `src/app/prozess/page.tsx`

```tsx
import { ProcessStep } from '@/components/process/ProcessStep';

const PROCESS_STEPS = [
  {
    number: 1,
    title: 'INTAKE',
    description: 'Gerät wird entgegengenommen und registriert',
    details: {
      whatHappens: 'Jedes gespendete Gerät wird fotografiert, mit Seriennummer erfasst und im ERP-System registriert. Visuelle Inspektion auf offensichtliche Schäden.',
      timeRequired: '5 Minuten pro Gerät',
      tools: ['Kivitendo ERP', 'Barcode-Scanner', 'Kamera'],
      qualityCheck: 'Seriennummer verifiziert, Spender dokumentiert',
      output: 'Gerät im System erfasst',
    },
  },
  {
    number: 2,
    title: 'TRIAGE',
    description: 'Funktionalität wird getestet und Kategorie bestimmt',
    details: {
      whatHappens: 'Laptop wird gestartet, BIOS-Check, Hardware-Test. Entscheidung: A (refurbish), B (Ersatzteile), C (Recycling).',
      timeRequired: '10 Minuten pro Gerät',
      tools: ['Hardware-Diagnose-Software', 'Multimeter', 'Testmonitor'],
      qualityCheck: 'Kategorie korrekt zugewiesen, Mängel dokumentiert',
      output: 'Gerät kategorisiert (A/B/C)',
    },
  },
  {
    number: 3,
    title: 'LÖSCHUNG',
    description: 'Alle Daten werden sicher gelöscht',
    details: {
      whatHappens: 'Festplatte wird mit DoD 5220.22-M Standard (3-Pass) überschrieben. Löschung wird zertifiziert.',
      timeRequired: '2-4 Stunden (automatisiert)',
      tools: ['DBAN', 'Festplatten-Docking-Station'],
      qualityCheck: 'Löschzertifikat generiert, keine Datenreste nachweisbar',
      output: 'Datenträger sicher gelöscht',
    },
  },
  {
    number: 4,
    title: 'REINIGUNG',
    description: 'Physische Reinigung auf "wie neu" Standard',
    details: {
      whatHappens: 'Außenreinigung mit Desinfektionsmittel, Tastatur-Tiefenreinigung, Lüfter entstauben, Display polieren.',
      timeRequired: '15 Minuten pro Gerät',
      tools: ['Druckluft-Kompressor', 'Mikrofaser-Tücher', 'Isopropanol', 'Spezialreiniger'],
      qualityCheck: 'Optisch einwandfrei, keine sichtbaren Verschmutzungen',
      output: 'Gerät optisch "wie neu"',
    },
  },
  {
    number: 5,
    title: 'UPGRADE',
    description: 'RAM und SSD werden aufgerüstet',
    details: {
      whatHappens: 'Standardisierung auf 8 GB RAM (mindestens) und 256 GB SSD. Alte HDD wird durch neue SSD ersetzt.',
      timeRequired: '20 Minuten pro Gerät',
      tools: ['Schraubendreher-Set', 'Antistatik-Matte', 'Ersatzteillager'],
      qualityCheck: 'RAM erkannt, SSD formatiert, Schrauben fest',
      output: 'Gerät mit moderner Hardware',
    },
  },
  {
    number: 6,
    title: 'LINUX',
    description: 'Betriebssystem wird installiert',
    details: {
      whatHappens: 'Linux Mint (neueste LTS) wird über PXE-Boot-Server installiert. Automatisierte Konfiguration mit Ansible.',
      timeRequired: '30 Minuten (automatisiert)',
      tools: ['PXE Boot Server', 'Ansible Playbooks', 'Custom Scripts'],
      qualityCheck: 'System bootet, alle Treiber installiert, Updates eingespielt',
      output: 'Betriebssystem einsatzbereit',
    },
  },
  {
    number: 7,
    title: 'QA',
    description: '8-Punkte Qualitätskontrolle',
    details: {
      whatHappens: 'Systematische Tests: Display, Tastatur, Touchpad, WLAN, Audio, USB, Akku, Performance. Dokumentiert im ERP.',
      timeRequired: '20 Minuten pro Gerät',
      tools: ['QA-Checkliste', 'Testskripte', 'Benchmark-Tools'],
      qualityCheck: 'Alle 8 Punkte bestanden, Qualitätszertifikat erstellt',
      output: 'Gerät QA-zertifiziert',
    },
  },
  {
    number: 8,
    title: 'VERTEILUNG',
    description: 'Kostenlose Abgabe an Organisationen',
    details: {
      whatHappens: 'Laptop wird GRATIS an AOZ, Caritas, Asylorganisation ZH, etc. abgegeben. Empfang dokumentiert.',
      timeRequired: '10 Minuten pro Gerät',
      tools: ['Abgabeprotokoll', 'ERP-Update'],
      qualityCheck: 'Empfänger dokumentiert, 1-Jahr Garantie ausgestellt',
      output: 'Laptop beim Empfänger',
    },
  },
];

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Von Spende bis Verteilung
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Klicken Sie auf jeden Schritt für Details. Transparenz von Anfang bis Ende.
        </p>

        <div className="space-y-4">
          {PROCESS_STEPS.map(step => (
            <ProcessStep key={step.number} {...step} />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-12 bg-blue-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Gesamt-Durchlaufzeit</h2>
          <div className="text-5xl font-bold mb-2">~6 Stunden</div>
          <p className="text-blue-100">
            Pro Laptop. Mit Hub: Parallele Verarbeitung → 3'000 Laptops/Jahr.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold">8</div>
              <div className="text-blue-100">Qualitätschecks</div>
            </div>
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-blue-100">Datenlöschung zertifiziert</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 4: Revenue Growth Story (2-3 hours)

### 4.1 Growth Mechanics Component
**File:** `src/components/hub/GrowthMechanics.tsx`

```tsx
export function GrowthMechanics() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Wie der Hub Revenue steigert
        </h2>
        <p className="text-lg text-gray-600">
          Nicht durch "mehr verkaufen", sondern durch Qualität, Effizienz und Skalierung.
        </p>
      </div>

      {/* Factor 1: Quality */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">✨</div>
          <h3 className="text-2xl font-bold text-gray-900">
            Faktor 1: Qualität steigt
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-gray-900 mb-3">Vorher (120 m²)</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Begrenzte Werkzeuge</li>
              <li>• Keine systematischen Prozesse</li>
              <li>• Qualität: variabel</li>
            </ul>
            <div className="mt-4 pt-4 border-t">
              <div className="text-2xl font-bold text-gray-900">CHF 200</div>
              <div className="text-sm text-gray-600">Durchschnittspreis</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Kundenzufriedenheit: 85%
            </div>
          </div>

          {/* After */}
          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="font-bold text-green-900 mb-3">Nachher (650 m²)</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Professionelle Teststation</li>
              <li>✓ ISO-ähnliche QA-Prozesse</li>
              <li>✓ 8-Punkte Qualitätskontrolle</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="text-2xl font-bold text-green-900">CHF 280</div>
              <div className="text-sm text-green-700">Durchschnittspreis (+40%)</div>
            </div>
            <div className="mt-2 text-sm text-green-700">
              Kundenzufriedenheit: 95%
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4">
          <strong className="text-blue-900">Warum zahlen Kunden mehr?</strong>
          <p className="text-blue-800 mt-1">
            Bessere Qualität + 1-Jahr Garantie (statt 3 Monate) + Support inklusive = Höherer Wert
          </p>
        </div>
      </div>

      {/* Factor 2: Efficiency */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">⚡</div>
          <h3 className="text-2xl font-bold text-gray-900">
            Faktor 2: Effizienz steigt
          </h3>
        </div>

        {/* Cost Comparison */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Kosten pro Laptop:</h4>

          {/* Before */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="font-bold text-red-900 mb-2">Vorher:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Komponenten (Einzelkauf):</span>
                <span className="font-mono">CHF 80</span>
              </div>
              <div className="flex justify-between">
                <span>Arbeitszeit (6h × CHF 30):</span>
                <span className="font-mono">CHF 180</span>
              </div>
              <div className="flex justify-between">
                <span>Overhead (Miete/Strom):</span>
                <span className="font-mono">CHF 40</span>
              </div>
              <div className="flex justify-between font-bold text-red-900 pt-2 border-t border-red-200">
                <span>Total:</span>
                <span className="font-mono">CHF 300</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-red-700">
              Bei CHF 200 Verkaufspreis = CHF 100 VERLUST pro Laptop
            </div>
          </div>

          {/* After */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="font-bold text-green-900 mb-2">Nachher:</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Komponenten (Bulk-Einkauf):</span>
                <span className="font-mono">CHF 60 <span className="text-green-700">(-25%)</span></span>
              </div>
              <div className="flex justify-between">
                <span>Arbeitszeit (4h × CHF 30):</span>
                <span className="font-mono">CHF 120 <span className="text-green-700">(-33%)</span></span>
              </div>
              <div className="flex justify-between">
                <span>Overhead (Scale):</span>
                <span className="font-mono">CHF 25 <span className="text-green-700">(-37%)</span></span>
              </div>
              <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-200">
                <span>Total:</span>
                <span className="font-mono">CHF 205</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-700">
              Bei CHF 280 Verkaufspreis = CHF 75 GEWINN pro Laptop
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4">
          <strong className="text-blue-900">Wie sinken Kosten?</strong>
          <ul className="text-blue-800 mt-2 space-y-1 text-sm">
            <li>✓ Bulk-Einkauf: Bessere Preise bei Komponenten</li>
            <li>✓ Prozesse: Weniger Nacharbeit, schneller</li>
            <li>✓ Scale: 3× Volumen, aber nur 2× Overhead</li>
          </ul>
        </div>
      </div>

      {/* Factor 3: Volume */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">📈</div>
          <h3 className="text-2xl font-bold text-gray-900">
            Faktor 3: Volumen steigt
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-gray-900 mb-3">Vorher</h4>
            <div className="text-4xl font-bold text-gray-900 mb-2">384</div>
            <div className="text-sm text-gray-600 mb-4">Laptops/Jahr</div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 2 Arbeitsplätze gleichzeitig</li>
              <li>• Kein Lagerplatz</li>
              <li>• Limitiert durch Raum</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="font-bold text-green-900 mb-3">Nachher</h4>
            <div className="text-4xl font-bold text-green-900 mb-2">3'000</div>
            <div className="text-sm text-green-700 mb-4">Laptops/Jahr (7.8× mehr)</div>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ 8 Arbeitsplätze gleichzeitig</li>
              <li>✓ Lager für 500 Geräte</li>
              <li>✓ Limitiert durch Personal (nicht Raum)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4">
          <strong className="text-blue-900">Wie steigt Durchsatz?</strong>
          <ul className="text-blue-800 mt-2 space-y-1 text-sm">
            <li>✓ Mehr Arbeitsplätze = Parallele Verarbeitung</li>
            <li>✓ Spezialisierung = Jeder macht einen Schritt (schneller)</li>
            <li>✓ Bessere Tools = Weniger Wartezeit</li>
          </ul>
        </div>
      </div>

      {/* Combined Effect */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-6">Kombinierter Effekt</h3>

        <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
          <div className="text-sm mb-2">Qualität × Effizienz × Volumen = Revenue Growth</div>
          <div className="text-4xl font-bold">(+40%) × (+31%) × (7.8×) = 11× Revenue</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90">Vorher (2025)</div>
            <div className="text-3xl font-bold">CHF 76k</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90">Nachher (2028)</div>
            <div className="text-3xl font-bold">CHF 840k</div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white border-opacity-30">
          <strong className="text-xl">Aber: Wir sind Non-Profit!</strong>
          <p className="mt-2 opacity-90">
            CHF 840k "Revenue" wird reinvestiert:
          </p>
          <ul className="mt-3 space-y-2 opacity-90">
            <li>→ CHF 500k: Kostenlose Laptops (via AOZ, Caritas)</li>
            <li>→ CHF 200k: Operations (Miete, Gehälter)</li>
            <li>→ CHF 140k: Stipendien & Community</li>
          </ul>
          <p className="mt-4 text-sm opacity-75">
            Revenue finanziert Impact, nicht Gewinn.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## Timeline & Priority

### Week 1: Foundation (Critical)
- Day 1-2: Numbers registry + Document library
- Day 3: NumberWithSource component
- Day 4: Update all pages (correct business model)
- Day 5: Test & verify consistency

### Week 2: Interactive UX
- Day 1-2: ProcessStep component + Process page
- Day 3: Growth mechanics component
- Day 4: Team multiplication section
- Day 5: Mission connections everywhere

### Week 3: Polish & Documents
- Day 1-2: Generate all PDFs (anonymized)
- Day 3: Add download buttons
- Day 4: Final consistency check
- Day 5: User testing

---

## Success Criteria

- [ ] Every number has source (clickable)
- [ ] Every source is downloadable (PDF)
- [ ] No contradictions (numbers consistent)
- [ ] Every revenue → mission connection
- [ ] Process steps are interactive
- [ ] Growth mechanics explained (Quality + Efficiency + Scale)
- [ ] Team = multiplication effect shown
- [ ] Never looks like profiteering
- [ ] All docs anonymized (no customer names)
- [ ] Ultimate transparency achieved

---

**Result:** Data-driven, transparent, mission-first storytelling that connects all dots.
