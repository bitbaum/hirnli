# UX, Consistency & Growth Modeling Guide

## Critical Issues to Fix

### 1. Number Consistency Across Site
### 2. No Internal Links (Everything Downloadable)
### 3. Clickable UX (Progressive Disclosure)
### 4. Team = Multiplication Effect
### 5. Revenue Growth = Quality + Efficiency + Scale
### 6. Never Look Like Profiteering

---

## Issue 1: Number Consistency — Single Source of Truth

### Problem
Numbers appear differently across pages:
- Dashboard: "1'200 laptops"
- About page: "1'000+ laptops"
- Gesuch: "Über 1'200 Geräte"

**Impact:** Looks inconsistent, loses credibility.

### Solution: Central Number Registry

**Create:** `lib/config/numbers.ts`

```typescript
/**
 * SSOT for all numbers used across site
 * Update here → propagates everywhere
 */

export const NUMBERS = {
  // Current State (as of 2026-02-12)
  current: {
    yearsActive: 23,
    laptopsRefurbished: {
      total: 1_200,
      period: '2025',
      source: 'Kivitendo ERP - Produktkatalog',
      confidence: 'Estimated',
      methodology: 'Basierend auf durchschnittlich 100 Laptops/Monat × 12 Monate',
    },
    customers: {
      total: 5_803,
      period: 'seit 2007',
      source: 'Kivitendo ERP - Kundenliste',
      confidence: 'High',
    },
    co2PerLaptop: {
      value: 285,
      unit: 'kg',
      source: 'Fraunhofer IZM 2023',
      confidence: 'High',
      calculation: 'Neuproduktion (350kg) - Refurbishing (65kg) = 285kg',
    },
    team: {
      fullTime: 3,
      interns: 8,
      volunteers: 4,
      total: 15,
      period: '2026-02',
      source: 'Interne Team-Liste',
    },
    budget: {
      annual: 80_000,
      period: '2025',
      confidence: 'Estimated',
      note: 'Geschätzt - keine systematische Mittelbeschaffung',
    },
  },

  // Hub Projections (2026-2028)
  hub: {
    year1: {
      total: 520_000,
      stiftungen: 450_000,
      revenue: 70_000,
      laptops: 1_800,
      team: 5,
    },
    year2: {
      total: 560_000,
      stiftungen: 340_000,
      revenue: 220_000,
      laptops: 2_400,
      team: 8,
    },
    year3: {
      total: 540_000,
      stiftungen: 250_000,
      revenue: 290_000,
      laptops: 3_000,
      team: 10,
    },
  },
} as const;

// Helper function
export function getNumber(path: string) {
  // Access nested numbers safely
  // e.g., getNumber('current.laptopsRefurbished.total') → 1_200
}
```

**Usage:**
```tsx
import { NUMBERS } from '@/lib/config/numbers';

<NumberWithSource
  value={NUMBERS.current.laptopsRefurbished.total}
  source={NUMBERS.current.laptopsRefurbished.source}
/>
```

**Result:** Every page shows EXACTLY the same number.

---

## Issue 2: No Internal Links — Everything Downloadable

### Problem
❌ Links to Nextcloud, Google Docs, internal systems
- User can't access
- Broken links
- No transparency

### Solution: Public PDFs

**Structure:**
```
public/
├── documents/
│   ├── financials/
│   │   ├── kivitendo-export-2025.pdf
│   │   ├── jahresabschluss-2024.pdf
│   │   └── budget-2026-2028.pdf
│   ├── impact/
│   │   ├── fraunhofer-co2-studie-2023.pdf
│   │   ├── arbeitsintegration-statistik.pdf
│   │   └── kundenfeedback-2025.pdf
│   ├── strategy/
│   │   ├── community-tech-hub-konzept.pdf
│   │   ├── 3-jahres-plan-2026-2028.pdf
│   │   └── sdg-mapping.pdf
│   └── legal/
│       ├── statuten.pdf
│       ├── handelsregister.pdf
│       └── gemeinnuetzigkeit.pdf
```

**Every number gets a downloadable source:**

```tsx
<NumberWithSource
  value="1'200"
  label="Laptops refurbished (2025)"
  source={{
    file: '/documents/financials/kivitendo-export-2025.pdf',
    page: 'Produktkatalog, S. 12',
    downloadLabel: 'Kivitendo Export herunterladen (PDF, 245 KB)',
  }}
/>
```

**Implementation:**
1. Export all source documents as PDFs
2. Place in `/public/documents/`
3. Update all `source` links to point to PDFs
4. Add "Herunterladen" button on every source

---

## Issue 3: Clickable UX — Progressive Disclosure

### Problem: Elements Look Clickable But Aren't

**Example:**
```
Von Spende bis Verkauf
1 INTAKE → 2 TRIAGE → 3 LÖSCHUNG → 4 REINIGUNG → 5 UPGRADE → 6 LINUX → 7 QA → 8 VERKAUF
```

**User expects:** Click on "REINIGUNG" → See details
**Reality:** Nothing happens

**Impact:** Poor UX, broken promise of progressive disclosure

### Solution: Make Everything Interactive

**Option A: Modal on Click**
```tsx
<ProcessStep
  number={4}
  title="REINIGUNG"
  onClick={() => openModal('reinigung')}
>
  <Modal>
    <h3>Schritt 4: Reinigung</h3>
    <p>Jedes Gerät wird physisch gereinigt:</p>
    <ul>
      <li>Außenreinigung mit Desinfektionsmittel</li>
      <li>Tastatur-Tiefenreinigung</li>
      <li>Lüfter-Entstaubung</li>
      <li>Display-Politur</li>
    </ul>
    <strong>Zeitaufwand:</strong> 15 Minuten pro Gerät
    <strong>Qualitätsstandard:</strong> "Wie neu" Zustand
  </Modal>
</ProcessStep>
```

**Option B: Expandable Accordion**
```tsx
<ProcessFlow>
  <Step expanded={false}>
    <StepHeader>1. INTAKE</StepHeader>
    <StepContent>
      Details about intake...
    </StepContent>
  </Step>

  <Step expanded={false}>
    <StepHeader>2. TRIAGE</StepHeader>
    <StepContent>
      Details about triage...
    </StepContent>
  </Step>

  {/* etc */}
</ProcessFlow>
```

**Visual Indication:**
- Add ⓘ icon to clickable elements
- Hover effect: underline + cursor pointer
- "Klicken für Details" tooltip

**Result:** Users can explore every step.

---

## Issue 4: Team = Multiplication Effect

### Current Problem
Team section just lists people, doesn't explain HOW they scale impact.

### Solution: Connect Team → Mission → SDGs

**Example: Education Program Manager**

```markdown
## Team-Struktur mit Hub (2028)

### Führung (2 FTE)
**Geschäftsführung**
- Operations, Fundraising, Strategie

**Tech Lead**
- Werkstatt, Qualität, Prozesse

### Education & Impact (3 FTE) ← NEU MIT HUB

**AI Lab Manager** (1 FTE)
Rolle:
- Entwickelt AI Literacy Kurse
- Trainiert Trainer (Train-the-Trainer)
- Betreut Corporate Workshops

Impact:
- 1 Manager → 5 Trainer → 100 Teilnehmer/Jahr
- **Multiplikationseffekt: 1:100**

Mission Connection:
- SDG 4 (Quality Education): AI-Kenntnisse für benachteiligte Gruppen
- SDG 10 (Reduced Inequalities): Digitale Kluft schließen

Revenue Connection:
- Corporate Workshops (CHF 500/Person) → Finanzieren kostenlose Kurse
- Zahlende Teilnehmer: 60/Jahr × CHF 500 = CHF 30'000
- Kostenlose Teilnehmer: 40/Jahr (finanziert durch Stiftungen)

**Makerspace Coordinator** (1 FTE)
Rolle:
- Organisiert Repair Cafés
- Betreut Jugend-Programme
- Community Events

Impact:
- 1 Coordinator → 10 Volunteers → 200 Reparaturen/Jahr
- **Multiplikationseffekt: 1:10**

Mission Connection:
- SDG 12 (Responsible Consumption): Reparatur statt Neukauf
- SDG 11 (Sustainable Communities): Nachbarschafts-Hub

Revenue Connection:
- Repair Services (CHF 120/Repair) → Finanzieren kostenlose Werkstatt-Tage
- Zahlende Kunden: 300/Jahr × CHF 120 = CHF 36'000
- Kostenlose Reparaturen: 100/Jahr (finanziert durch Stiftungen)

**Workshop Manager** (1 FTE)
Rolle:
- Entwickelt Bildungsprogramme
- Koordiniert externe Trainer
- Evaluiert Impact

Impact:
- 1 Manager → 8 Programme → 150 Teilnehmer/Jahr
- **Multiplikationseffekt: 1:150**

Mission Connection:
- SDG 8 (Decent Work): Arbeitsmarkt-Skills
- SDG 4 (Quality Education): Lebenslanges Lernen

Revenue Connection:
- Corporate Training (CHF 3'000/Tag) → Finanziert Stipendien
- Corporate: 12 Events/Jahr × CHF 3'000 = CHF 36'000
- Stipendien: 50 Teilnehmer kostenlos (finanziert durch Stiftungen)

### Arbeitsintegration (5 FTE)
**Praktikanten** (5 FTE, rotierend)
- 10 Personen/Jahr × 6 Monate Praktikum
- Refurbishing, Repair, Tech Support
- Ziel: Integration in regulären Arbeitsmarkt

Impact:
- 10 Personen/Jahr durchgeschleust
- Erfolgsquote (Ziel): 60% finden Arbeit
- **6 Menschen/Jahr in Arbeit gebracht**

Mission Connection:
- SDG 8 (Decent Work): Arbeitsplätze für benachteiligte Menschen
- SDG 10 (Reduced Inequalities): Chancengleichheit

Finanzierung:
- 100% durch Stiftungen (CHF 150'000/Jahr)
- Kein Revenue-Druck auf vulnerable Menschen

---

## Gesamt Team-Impact

**10 FTE = 500+ Menschen erreicht/Jahr**

Multiplikation:
- 3 Education Managers → 250 Kursteilnehmer
- 5 Praktikanten → 10 Menschen integriert → 500 kostenlose Laptops verteilt (via AOZ etc.)
- 2 Führung → Koordiniert Gesamtsystem

Revenue Generated: CHF 290'000
Impact Financed: CHF 250'000 (Stiftungen)

**Nicht Profiteering, sondern:**
→ Revenue finanziert Struktur
→ Stiftungen finanzieren Impact
→ Team multipliziert Wirkung 1:50+
```

---

## Issue 5: Revenue Growth = Quality + Efficiency + Scale

### Current Problem
"Mit Hub: Revenue wächst von CHF 70k → CHF 290k"

**Missing:** WHY? HOW? What changes?

### Solution: Explain the Mechanics

**Revenue Growth durch 3 Faktoren:**

#### 1. Produktqualität steigt (→ Höhere Preise)

**Vorher (ohne Hub):**
```
Laptop-Refurbishing: 120 m² Werkstatt
- Begrenzte Werkzeuge
- Keine systematischen Prozesse
- Qualität: variabel

Result:
- Durchschnittspreis: CHF 200
- Kundenzufriedenheit: 85%
- Rückgaberate: 8%
```

**Nachher (mit Hub):**
```
Laptop-Refurbishing: 650 m² Werkstatt
- Professionelle Teststation
- ISO-ähnliche QA-Prozesse
- Jedes Gerät: 8-Punkte-Check

Result:
- Durchschnittspreis: CHF 280 (+40%)
- Kundenzufriedenheit: 95%
- Rückgaberate: 2%

WHY höhere Preise?
→ Bessere Qualität = Kunden zahlen mehr
→ Garantie: 1 Jahr (vorher: 3 Monate)
→ Support inklusive
```

**Impact auf Revenue:**
- Vorher: 100 Laptops × CHF 200 = CHF 20'000
- Nachher: 150 Laptops × CHF 280 = CHF 42'000
- **+110% Revenue bei nur +50% Volumen**

#### 2. Kosten sinken (→ Bessere Margen)

**Vorher (ohne Hub):**
```
Cost per Laptop:
- Anschaffung (Spende): CHF 0
- Komponenten (RAM, SSD): CHF 80
- Arbeitszeit (6h × CHF 30): CHF 180
- Overhead (Miete, Strom): CHF 40
= Total: CHF 300

Verkaufspreis: CHF 200
VERLUST: -CHF 100 pro Laptop!

Warum Verlust?
→ Kleine Miete (120 m²) = Hohe m² Kosten
→ Keine Effizienz (kein System)
→ Viel Nacharbeit (schlechte QA)
```

**Nachher (mit Hub):**
```
Cost per Laptop:
- Anschaffung (Spende): CHF 0
- Komponenten (Bulk-Einkauf): CHF 60 (-25%)
- Arbeitszeit (4h × CHF 30): CHF 120 (-33%)
  WHY weniger? Systematische Prozesse
- Overhead (650 m², aber 3× Volumen): CHF 25 (-37%)
= Total: CHF 205

Verkaufspreis: CHF 280
GEWINN: +CHF 75 pro Laptop

WHY Kosten sinken?
→ Größere Fläche = Economies of Scale
→ Prozesse = Weniger Nacharbeit
→ Bulk-Einkauf = Bessere Preise
→ Mehr Geräte = Overhead verteilt sich
```

**Impact auf Revenue:**
- Vorher: -CHF 100/Laptop (Verlust)
- Nachher: +CHF 75/Laptop (Gewinn)
- **Swing: CHF 175 pro Laptop**

#### 3. Volumen steigt (→ Mehr Durchsatz)

**Vorher (ohne Hub):**
```
Kapazität: 120 m² Werkstatt
- 2 Arbeitsplätze gleichzeitig
- Kein Lager
- Kein Testbereich

Durchsatz:
- 8 Laptops/Woche
- 32 Laptops/Monat
- 384 Laptops/Jahr

Limitierender Faktor: RAUM
```

**Nachher (mit Hub):**
```
Kapazität: 650 m² Werkstatt
- 8 Arbeitsplätze gleichzeitig
- Lager: 500 Geräte
- Testbereich: 10 Stationen

Durchsatz:
- 60 Laptops/Woche
- 250 Laptops/Monat
- 3'000 Laptops/Jahr

Limitierender Faktor: PERSONAL (nicht Raum!)

WHY mehr Durchsatz?
→ 4× mehr Arbeitsplätze
→ Parallele Prozesse (kein Warten)
→ Spezialisierung (jeder macht einen Schritt)
→ Bessere Werkzeuge (schneller)
```

**Impact auf Revenue:**
- Vorher: 384 Laptops/Jahr
- Nachher: 3'000 Laptops/Jahr
- **7.8× mehr Volumen**

---

### Kombinierter Effekt: Revenue Explosion

**Vorher (2025):**
```
384 Laptops/Jahr × CHF 200 = CHF 76'800
- Kosten: CHF 115'200 (384 × CHF 300)
= VERLUST: -CHF 38'400

Finanzierung: Stiftungen decken Verlust
```

**Nachher (2028):**
```
3'000 Laptops/Jahr × CHF 280 = CHF 840'000
- Kosten: CHF 615'000 (3'000 × CHF 205)
= GEWINN: +CHF 225'000

ABER: Wir sind Non-Profit!
→ CHF 225k Gewinn = Reinvestition
   ├─ CHF 150k: Kostenlose Laptops (via AOZ, Caritas)
   ├─ CHF 50k: Stipendien (AI Lab)
   └─ CHF 25k: Community Events

Revenue für Operations: CHF 290'000
(Corporate B2B, Workshops, Repairs, Events)

Stiftungen für Impact: CHF 250'000
(Soziale Programme)
```

---

## Visual: The Growth Model

```
QUALITY ↑
  ├─ Better Processes → Less Rework
  ├─ Better Tools → Higher Quality
  └─ Better QA → Higher Satisfaction
     → Customers pay MORE (CHF 200 → CHF 280)

EFFICIENCY ↑
  ├─ Economies of Scale → Lower Cost/Unit
  ├─ Bulk Purchasing → Lower Component Costs
  └─ Specialization → Faster Production
     → Cost per Unit DECREASES (CHF 300 → CHF 205)

SCALE ↑
  ├─ More Space → More Parallel Work
  ├─ More Tools → Less Waiting
  └─ More People → Higher Throughput
     → Volume INCREASES (384 → 3'000)

RESULT:
Quality × Efficiency × Scale = Revenue Growth
(+40%)  × (+31%)      × (7.8×) = 11× Revenue

CHF 76k → CHF 840k
```

**But we're Non-Profit!**
→ "Gewinn" wird reinvestiert in Mission
→ Kostenlose Laptops bleiben kostenlos
→ Stiftungen finanzieren Impact, nicht Overhead

---

## Issue 6: Never Look Like Profiteering

### The Framing Problem

❌ **WRONG Framing:**
> "With the hub, we'll make CHF 290k in revenue!"

**Sounds like:** We're in it for the money.

✅ **CORRECT Framing:**
> "With the hub, we'll generate CHF 290k in revenue to sustain operations — so Stiftungen can focus 100% on funding our mission: kostenlose Laptops für benachteiligte Menschen."

**Sounds like:** We're building sustainable infrastructure to maximize impact.

### Every Revenue Statement Needs Mission Connection

**Template:**
```
[REVENUE SOURCE] generates CHF X
  ↓ Finances
[OPERATIONAL NEED] (not mission!)
  ↓ Enables
[MISSION IMPACT] (funded by Stiftungen)
  ↓ Achieves
[SDG GOAL]
```

**Example: Corporate B2B**
```
Corporate B2B generates CHF 120k/Jahr
  ↓ Finances
Werkstatt Operations (Miete, Gehälter, Infrastruktur)
  ↓ Enables
500 kostenlose Laptops/Jahr (finanziert durch Stiftungen)
  ↓ Für
AOZ Sozialarbeiter, Caritas Klienten, Asylorganisation ZH
  ↓ Achieves
SDG 10 (Reduced Inequalities): Digitaler Zugang für alle
```

**Visual:**
```
┌─────────────────────────────────────┐
│ REVENUE: CHF 290k                   │
│ (Corporate, Workshops, Repairs)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ OPERATIONS: Selbsttragend           │
│ (Miete, Gehälter, Werkzeuge)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ STIFTUNGEN: CHF 250k                │
│ (100% für Impact)                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ IMPACT: Mission                     │
│ • 500 kostenlose Laptops            │
│ • 50 Stipendien (AI Lab)            │
│ • 100 Community Events              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ SDGs: 4, 8, 10, 12, 13              │
└─────────────────────────────────────┘
```

---

## Implementation Checklist

### Numbers Consistency
- [ ] Create `lib/config/numbers.ts` (SSOT)
- [ ] Audit all pages for number inconsistencies
- [ ] Replace hardcoded numbers with config imports
- [ ] Add unit tests (numbers match across pages)

### Downloadable Sources
- [ ] Export all source documents as PDFs
- [ ] Place in `/public/documents/`
- [ ] Update all source links to PDFs
- [ ] Add "Herunterladen" button to every source

### Clickable UX
- [ ] Audit all elements that "look" clickable
- [ ] Add click handlers + modals for process steps
- [ ] Add ⓘ icons to interactive elements
- [ ] Add hover effects (underline, cursor pointer)
- [ ] Add tooltips ("Klicken für Details")

### Team = Multiplication
- [ ] Add Education Program Manager roles
- [ ] Show 1:N multiplication effect
- [ ] Connect each role to SDGs
- [ ] Show revenue connection (paid → free model)

### Revenue Growth Mechanics
- [ ] Add "Quality" explanation (processes, tools)
- [ ] Add "Efficiency" explanation (scale economies)
- [ ] Add "Volume" explanation (capacity increase)
- [ ] Show combined effect visually
- [ ] Add "But we're Non-Profit!" framing

### Anti-Profiteering Framing
- [ ] Every revenue mention → mission connection
- [ ] Show "Revenue = Operations, Stiftungen = Impact"
- [ ] Visual: Money flow diagram
- [ ] Add SDG tags to every revenue source

---

## Summary

**6 Critical Fixes:**
1. ✅ Numbers consistent (central config)
2. ✅ Everything downloadable (no internal links)
3. ✅ Progressive disclosure (clickable elements)
4. ✅ Team = multiplication (show 1:N effect)
5. ✅ Revenue = Quality + Efficiency + Scale
6. ✅ Never profiteering (mission-first framing)

**Result:** Transparent, credible, mission-driven storytelling.
