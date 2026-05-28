# Hub Number Audit - 2026-02-13

> ⚠️ **HISTORICAL SNAPSHOT** — this audit was performed on 2026-02-13.
> The "WHAT TO FIX" recommendations near the bottom were partially
> actioned afterwards (see commits in `src/app/fundraising/hub/` and
> `src/lib/config/hub-space-plan.ts`). Kept as historical context for
> the design rationale; do not treat the inconsistencies listed below
> as still-current bugs without first checking the live code.

## CRITICAL INCONSISTENCIES FOUND

### 1. Square Meters Don't Add Up

**Cards show:**
- Shop: 80 m²
- Werkstatt: 150 m²
- Offices: 100 m²
- Lager: 150 m²
- Lade: 50 m²
- Makerspace: 80 m²
- Robotik: 60 m²
- Schulung: 70 m²
- AI Lab: 30 m² (midpoint)
- Museum: 60 m²
- Synth: 50 m²
- E-Waste: 40 m²
- Event: 100 m²
- Kitchen: 50 m²
- Repair Café: 30 m²

**TOTAL: ~1,100 m²**

**But page claims: "~500-600 m²"** ❌

### 2. Budget Summary vs Cards - COMPLETELY DIFFERENT

| Space | Card Says | Budget Says | MISMATCH |
|-------|-----------|-------------|----------|
| Shop | 80 m², CHF 35k | 50 m², CHF 25k | ❌ |
| Makerspace | 80 m², CHF 70k | 60 m², CHF 40k | ❌ |
| Schulung | 70 m², CHF 45k | 50 m², CHF 30k | ❌ |
| Event | 100 m², CHF 60k | 80 m², CHF 40k | ❌ |
| Kitchen | 50 m², CHF 40k | 30 m², CHF 25k | ❌ |

### 3. AI Lab is COMPLETE FANTASY

**Setup C claims:** "20-30× Enterprise GPUs (H100/A100) for CHF 100'000-150'000"

**Reality:**
- 1× NVIDIA H100: CHF 25,000-40,000
- 1× NVIDIA A100: CHF 10,000-15,000

**Actual costs:**
- 20× H100 = CHF 500,000-800,000
- 30× H100 = CHF 750,000-1,200,000
- 20× A100 = CHF 200,000-300,000

**Setup C is off by 5-10×!** ❌

### 4. Missing Infrastructure

No accounting for:
- Corridors (15-20% of usable space)
- Bathrooms (not counted separately)
- Emergency exits
- Utility rooms

## REALISTIC NUMBERS (from hub-space-plan.ts)

### Total Space: 550m² (NOT 1,100m²)

**Core Business: 360m²**
- Shop: 50m²
- Werkstatt: 150m²
- Office: 50m²
- Lager: 80m²
- Lade: 30m²

**Innovation: 130m²**
- Makerspace: 60m²
- AI Lab: 20m²
- Schulung: 50m²

**Culture: 100m²**
- Event + Café (COMBINED): 100m²

**Infrastructure: 60m²**
- Corridors, bathrooms, etc.

**TOTAL: 650m²** (slightly over 550m² target, need to trim or accept)

### Realistic Setup Costs

**Core Business: CHF 155,000**
- Shop: CHF 20,000
- Werkstatt: CHF 65,000
- Office: CHF 25,000
- Lager: CHF 35,000
- Lade: CHF 10,000

**Innovation: CHF 80,000-215,000 (depending on AI Lab)**
- Makerspace: CHF 35,000
- AI Lab: CHF 15,000-150,000 (see below)
- Schulung: CHF 30,000

**Culture: CHF 45,000**
- Event + Café: CHF 45,000

**Infrastructure: CHF 25,000**

**TOTAL SETUP: CHF 305,000-440,000**

### Realistic AI Lab Options

**Setup A — Starter (CHF 15,000-20,000)**
- 2-4× Consumer GPUs (RTX 3090/4090, used or donated)
- 1× Server rack
- **REALISTIC**

**Setup B — Professional (CHF 40,000-60,000)**
- 4-6× Professional GPUs (A40, some donated)
- 2× Server racks
- **REALISTIC with corporate donations**

**Setup C — Enterprise (CHF 100,000-150,000)**
- **8-12× A100 GPUs (NOT 20-30!)**
- OR 4-6× H100 GPUs
- 2-3× Server racks
- **REALISTIC with major corporate donations + partial purchase**

## WHAT TO FIX

1. ✅ Remove optional culture spaces (Museum, Synth, E-Waste, Robotik, Kitchen, Repair Café)
2. ✅ Keep only CORE: Shop, Werkstatt, Office, Lager, Lade, Makerspace, AI Lab, Schulung, Event+Café
3. ✅ Make all card numbers match budget summary numbers
4. ✅ Fix AI Lab GPU counts to realistic numbers
5. ✅ Total should be ~550m², not 1,100m²
6. ✅ Total cost should be CHF 305k-440k for setup

## DECISION NEEDED

**Option A: Minimal Core (550m²)**
- Only essential spaces
- Removes: Museum, Synth, E-Waste, Robotik, Kitchen, Repair Café
- Total: CHF 305k-440k setup

**Option B: Full Vision (900m²)**
- All spaces included
- Be honest: "We need 900m², not 550m²"
- Total: CHF 500k-700k setup
- Rental: CHF 135k-180k/year (agglomeration)

**Recommendation: Option A** - Start with core, expand later
