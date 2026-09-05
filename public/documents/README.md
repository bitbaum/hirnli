# Document Library - SSOT for Source Documents

**Purpose:** This directory contains all source documents referenced by `NUMBERS_REGISTRY` in `src/lib/config/numbers.ts`.

**Last Updated:** 2026-02-13

---

## Directory Structure

```
public/documents/
├── financials/     → Financial documents (Kivitendo, budgets, annual accounts)
├── impact/         → Impact studies and evidence (CO2, work integration, feedback)
├── strategy/       → Strategic planning (Hub concept, 3-year plan, SDG mapping)
├── legal/          → Legal documents (commercial register, statutes, non-profit status)
├── methodology/    → How we calculate metrics (methodology explanations)
├── team/           → Team capacity and multiplication effect documents
├── revenue/        → Revenue model breakdowns
├── hub/            → Hub-specific documents (capacity, quality, efficiency)
└── sources/        → General source documents
```

---

## Anonymization Rules (CRITICAL)

Before adding ANY document to this library:

### ❌ NEVER Include:
- Customer names or personal data
- Individual addresses or contact details
- Sensitive contract details (prices, terms for specific clients)
- Internal emails or private communications
- Unredacted financial data with client identifiers

### ✅ Safe to Include:
- Aggregated data (totals, averages, anonymized summaries)
- Public records (Handelsregister, published studies)
- Anonymized feedback (no names, generalized)
- Internal methodology documents (how we calculate)
- Budget models (projections, not actual client data)
- Published research (Fraunhofer, etc.)

### 🔒 Anonymization Process:
1. **Redact**: Remove all personal identifiers
2. **Aggregate**: Present as totals/averages where possible
3. **Review**: Double-check before publishing
4. **Watermark**: Add "ANONYMIZED FOR PUBLIC USE" footer to PDFs

---

## What Goes Where

### `/financials/`
**Purpose:** Financial evidence and budget models

**Files:**
- `kivitendo-produkte-2018-2025.pdf` — Anonymized product sales summary
- `jahresrechnung-2022.pdf` — Annual accounts 2022 (public version)
- `budget-2025-estimate.pdf` — 2025 budget estimate
- `budget-year1-breakdown.pdf` — Year 1 Hub budget breakdown
- `budget-year2-breakdown.pdf` — Year 2 Hub budget breakdown
- `budget-year3-breakdown.pdf` — Year 3 Hub budget breakdown
- `3year-budget-summary.pdf` — 3-year budget summary

**Source:** Kivitendo exports (anonymized), internal budget models

---

### `/impact/`
**Purpose:** Evidence of environmental and social impact

**Files:**
- `fraunhofer-izm-co2-studie-2023.pdf` — CO2 lifecycle study (Refurb vs. New)
- `arbeitsintegration-2020-2025.pdf` — Work integration report (anonymized)
- `kundenfeedback-anonymisiert-2025.pdf` — Customer feedback summary
- `laptop-refurbishment-history-2003-2025.pdf` — Historical refurbishment data

**Source:** External studies, anonymized internal records

---

### `/strategy/`
**Purpose:** Strategic planning documents

**Files:**
- `community-tech-hub-konzept.pdf` — Hub concept and vision
- `3-jahres-finanzplan.pdf` — 3-year financial plan
- `sdg-mapping-revampit.pdf` — UN SDG alignment
- `vision-2030-capacity-model.pdf` — Long-term vision
- `scaling-path-to-10k.pdf` — Scaling roadmap

**Source:** Internal strategic planning

---

### `/legal/`
**Purpose:** Legal and compliance documents

**Files:**
- `handelsregister-auszug-2026.pdf` — Commercial register extract
- `statuten-revampit.pdf` — Organization statutes
- `gemeinnuetzigkeit-bestaetigung.pdf` — Non-profit status confirmation

**Source:** Public records, official registrations

---

### `/methodology/`
**Purpose:** How we calculate and verify data

**Files:**
- `number-calculation-methods.pdf` — Methodology for all NUMBERS_REGISTRY entries
- `data-sources-overview.pdf` — Where data comes from
- `quality-assurance-process.pdf` — QA methodology

**Source:** Internal documentation

---

### `/team/`
**Purpose:** Team capacity and multiplication effect

**Files:**
- `multiplication-effect.pdf` — Train-the-Trainer model explanation
- `hardware-bpl-capacity.pdf` — Hardware BPL capacity planning
- `software-bpl-capacity.pdf` — Software/AI BPL capacity planning
- `capacity-calculation-bpl.pdf` — BPL capacity calculation methodology
- `social-impact-projection.pdf` — Social impact projections
- `bpl-roi-calculation.pdf` — BPL ROI calculation

**Source:** Internal planning

---

### `/revenue/`
**Purpose:** Revenue model breakdowns

**Files:**
- `revenue-model-year3.pdf` — Year 3 revenue model
- `corporate-b2b-model.pdf` — Corporate B2B revenue breakdown
- `workshop-revenue-model.pdf` — Workshop revenue model

**Source:** Internal projections

---

### `/hub/`
**Purpose:** Hub-specific capacity, quality, efficiency documents

**Files:**
- `space-requirements-analysis.pdf` — Hub space analysis
- `year3-capacity-projection.pdf` — Year 3 capacity projection
- `quality-improvements.pdf` — Quality improvement projections
- `efficiency-analysis.pdf` — Efficiency gain analysis
- `capacity-analysis.pdf` — Volume capacity analysis

**Source:** Internal analysis

---

### `/sources/`
**Purpose:** General source documents and studies

**Files:**
- External research papers
- Public studies
- Reference materials

---

## Usage in Code

All documents are referenced in `src/lib/config/numbers.ts`:

```typescript
CO2_SAVED_PER_LAPTOP: {
  value: 285,
  label: 'kg CO₂ gespart pro Laptop',
  source: {
    documentUrl: '/documents/impact/fraunhofer-izm-co2-studie-2023.pdf',
    // ...
  },
}
```

When users click a number on the site, they can download the source document.

---

## Adding New Documents

### Workflow:
1. **Create/Anonymize** the document
2. **Save** to appropriate directory (e.g., `/impact/`)
3. **Update** `NUMBERS_REGISTRY` in `src/lib/config/numbers.ts`
4. **Test** download link works
5. **Verify** anonymization is complete

### Naming Convention:
- Use lowercase
- Use hyphens (not underscores or spaces)
- Be descriptive: `fraunhofer-izm-co2-studie-2023.pdf` (good) vs. `study.pdf` (bad)
- Include year if relevant

---

## Status

**Every directory here is empty, and no page links to a document any more.**

Eleven documents were referenced from `src/lib/config/` — seven as the
`documentUrl` behind the "Quelldokument ansehen (PDF)" button on the
transparency pages, four as downloads in the "Quelldateien (Kivitendo)" section
of `/dokumente`. None of them had ever been uploaded. Every one returned 404,
for every visitor, since the references were written.

This file already said so, in the table that used to be here: partial or empty
for all nine directories, "referenced but not uploaded". That is the failure —
the gap was documented and the UI kept rendering the button. Documentation is
not a check.

The references have been removed. The intent is not lost: the file lists above
are what was meant to exist, and they stay here as the backlog.

| Directory | Files present | What was promised |
|-----------|---------------|-------------------|
| `/financials/` | none | `budget-2025-estimate.pdf` |
| `/impact/` | none | `laptop-refurbishment-history-2003-2025.pdf` |
| `/hub/` | none | `space-requirements-analysis.pdf` |
| `/operations/` | none | `process-time-breakdown.pdf` |
| `/team/` | none | `hardware-bpl-capacity.pdf`, `software-bpl-capacity.pdf` |
| `/sources/` | none | Fraunhofer IZM CO₂ study; Kivitendo trial balance, chart of accounts, consolidated workbook + README |
| `/strategy/`, `/legal/`, `/methodology/`, `/revenue/` | none | see the file lists above |

### The rule now

**A document and the reference to it land in the same commit.**
`src/lib/config/__tests__/referenced-documents-exist.test.ts` fails on any
`/documents/...` or `/downloads/...` path in `src/` that has no matching file
under `public/`. So the way to restore one of the rows above is: add the file,
then add the reference. Adding the reference alone no longer builds.

---

## Maintenance

- **Quarterly:** Review document freshness
- **When data changes:** Update source documents
- **Before upload:** Verify anonymization
- **After changes:** Test download links

---

**Last Updated:** 2026-02-13
**Maintainer:** Revamp-IT Team
