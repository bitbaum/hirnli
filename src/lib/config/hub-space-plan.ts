/**
 * Hub Space Plan - Detailed Justifications
 *
 * WHY each space needs its size, WHAT it contains, MULTI-PURPOSE opportunities
 * Based on industry best practices and real Zürich market research (Feb 2026)
 *
 * Sources:
 * - Zürich commercial space: CHF 150-200/m²/year (agglomeration), CHF 200-300/m²/year (city)
 * - Workshop best practices: U-shape layout, 2.4-3.6m ceiling height
 * - Auto repair industry: 140-185m² for 2-lift shop (baseline for refurbishment workshop)
 *
 * Last Updated: 2026-02-13
 */

// ---------------------------------------------------------------------------
// Market Research - Zürich Commercial Space Costs (2026)
// ---------------------------------------------------------------------------

export const ZURICH_MARKET_DATA = {
  city_zurich: {
    office_space_per_year: '200-300 CHF/m²',
    workshop_space_per_year: '250-350 CHF/m²', // Estimate - workshops more expensive than office
    sources: [
      'Zürich West office space: CHF 270/m²/year (net) - Homegate.ch',
      'City center premium: +20-30% typical',
    ],
  },
  agglomeration: {
    commercial_space_per_year: '150-200 CHF/m²',
    workshop_space_per_year: '150-250 CHF/m²',
    locations: ['Volketswil', 'Schlieren', 'Dietikon', 'Regensdorf', 'Wallisellen'],
    sources: [
      'Volketswil commercial/logistics: CHF 150/m²/year - Homegate.ch',
      'Schlieren atelier 40m²: CHF 252/m²/year (small space premium) - Homegate.ch',
    ],
  },
  estimate_for_600m2: {
    city_zurich: {
      min: 150_000, // ~600m² × CHF 250/m²/year
      max: 210_000, // ~600m² × CHF 350/m²/year
      note: 'City locations expensive, not realistic for our budget',
    },
    agglomeration: {
      min: 90_000,  // ~600m² × CHF 150/m²/year
      max: 150_000, // ~600m² × CHF 250/m²/year
      realistic: 120_000, // ~600m² × CHF 200/m²/year for decent agglomeration location
      note: 'Volketswil, Schlieren, Dietikon - accessible by public transport',
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Detailed Space Requirements with Justifications
// ---------------------------------------------------------------------------

export interface SpaceArea {
  name: string;
  sqm_min: number;
  sqm_max: number;
  sqm_recommended: number;
  why_this_size: string;
  what_it_contains: string[];
  equipment_furniture: string[];
  simultaneous_capacity: string;
  ceiling_height_min: number;
  layout_type?: string;
  multi_purpose_with?: string[];
  cost_estimate_chf: number;
}

export const HUB_SPACE_AREAS: SpaceArea[] = [
  // -------------------------------------------------------------------------
  // CORE BUSINESS: Shop + Refurbishment + Operations
  // -------------------------------------------------------------------------
  {
    name: 'Shop & Customer Area',
    sqm_min: 40,
    sqm_max: 60,
    sqm_recommended: 50,
    why_this_size: 'Industry standard: 20-30 devices on display requires 30-40m² + 10-15m² for customer circulation, checkout, device intake area. Swiss retail standards recommend min 1.5m² per customer for comfortable browsing.',
    what_it_contains: [
      'Sales floor: 30m² (20-30 refurbished devices on display)',
      'Checkout & intake: 10m² (cash register, device acceptance counter)',
      'Customer waiting area: 10m² (3-4 seats, coffee corner)',
    ],
    equipment_furniture: [
      '8-10× Display shelves (adjustable, modular)',
      '1× Cash register system with inventory software',
      '1× Device intake counter (2m long workbench)',
      '4× Customer chairs + small table',
      '1× Coffee machine (optional, creates welcoming atmosphere)',
      'Wall-mounted displays for device specs',
    ],
    simultaneous_capacity: '5-8 customers comfortably',
    ceiling_height_min: 2.4,
    layout_type: 'Open floor plan with clear sight lines (theft prevention)',
    cost_estimate_chf: 20_000,
  },

  {
    name: 'Refurbishment Workshop',
    sqm_min: 120,
    sqm_max: 180,
    sqm_recommended: 150,
    why_this_size: 'Based on auto repair industry standard (2-lift shop = 140-185m²). We refurbish electronics (smaller than cars), but need: (1) 6-8 workstations × 12-18m² each = 72-144m², (2) Test area, (3) Data wipe zone, (4) QA/packaging, (5) Parts storage, (6) Tool library. U-shape layout keeps central 40-50m² open for movement.',
    what_it_contains: [
      'Main workshop: 70m² (6-8 repair workstations in U-shape)',
      'Test & Data Wipe: 30m² (10 devices can run tests simultaneously)',
      'Quality Assurance & Packaging: 25m² (final checks, boxing for sale)',
      'Parts & Tools: 25m² (shelving, organized component storage)',
    ],
    equipment_furniture: [
      '6-8× Workbenches (1.8m × 0.8m each with power, lighting)',
      '10× Test stations (laptops connected for automated diagnostics)',
      '6× Data wipe stations (dedicated PCs running secure erase)',
      '1× ESD-safe workstation (for sensitive electronics)',
      '4× QA workstations (final testing before sale)',
      '10-15× Industrial shelving units (parts organized by type)',
      '1× Tool chest (centralized tools: screwdrivers, thermal paste, etc.)',
      'Overhead lighting (min 500 lux for precision work)',
      'Power outlets every 2m (high-power draw for testing)',
    ],
    simultaneous_capacity: '6-8 technicians working, 10-15 devices in test/data-wipe parallel',
    ceiling_height_min: 2.8,
    layout_type: 'U-shape: Workbenches along walls, central 40m² open for carts/movement',
    cost_estimate_chf: 65_000,
  },

  {
    name: 'Office & Meeting Spaces',
    sqm_min: 40,
    sqm_max: 60,
    sqm_recommended: 50,
    why_this_size: 'Kernteam (3 people) + 2 BPL = 5 desks. Swiss office standard: 8-10m² per desk (includes personal space + shared circulation). 5 × 10m² = 50m². Meeting room seats 8-10 people (15-20m² standard).',
    what_it_contains: [
      'Open office: 30m² (5 desks for Kernteam + BPL)',
      'Meeting room: 15m² (8-10 people, flexible table config)',
      'Small kitchen/break area: 5m² (sink, fridge, microwave)',
    ],
    equipment_furniture: [
      '5× Office desks (adjustable height preferred for ergonomics)',
      '5× Office chairs (ergonomic, Swiss workplace safety standards)',
      '1× Meeting table (modular, seats 8-10)',
      '1× Whiteboard (2m × 1.2m for brainstorming)',
      '1× Projector or large screen (for presentations)',
      '1× Small kitchenette (fridge, microwave, coffee machine, sink)',
    ],
    simultaneous_capacity: '5 people working, 8-10 in meetings',
    ceiling_height_min: 2.4,
    multi_purpose_with: ['Meeting room doubles as training space during off-hours'],
    cost_estimate_chf: 25_000,
  },

  {
    name: 'Storage & Logistics',
    sqm_min: 60,
    sqm_max: 100,
    sqm_recommended: 80,
    why_this_size: 'We already have TOO MUCH inventory in 2 external warehouses (user feedback). Consolidating into 1 organized space saves double rent. 80m² holds ~500 devices (1.5 devices per m² with industrial shelving). Includes intake/triage (20m²), ready-to-sell (30m²), recycling staging (20m²), packing supplies (10m²).',
    what_it_contains: [
      'Intake & Triage: 20m² (incoming devices sorted by condition)',
      'Ready-to-sell inventory: 30m² (refurbished devices awaiting sale)',
      'Recycling staging: 20m² (non-repairable devices for e-waste pickup)',
      'Packing supplies: 10m² (boxes, bubble wrap, labels)',
    ],
    equipment_furniture: [
      '15-20× Industrial shelving (3m high, maximize vertical space)',
      '2× Rolling carts (move devices between areas)',
      '1× Pallet jack (for bulk deliveries)',
      '1× Scale (for shipping weight)',
      'Labeling system (barcode or RFID for inventory tracking)',
    ],
    simultaneous_capacity: '2-3 people organizing inventory',
    ceiling_height_min: 3.0,
    layout_type: 'High shelving (3m), vertical storage maximizes capacity',
    cost_estimate_chf: 35_000,
  },

  {
    name: 'Loading & Delivery Zone',
    sqm_min: 20,
    sqm_max: 40,
    sqm_recommended: 30,
    why_this_size: 'Standard loading bay for small trucks/vans: 15-20m². Temporary staging for pallets: 10-15m². Swiss commercial buildings typically allocate 5-10% of total space for logistics.',
    what_it_contains: [
      'Loading bay: 15m² (truck access, ramp)',
      'Temporary staging: 15m² (24-48h holding for incoming/outgoing)',
    ],
    equipment_furniture: [
      '1× Loading ramp or dock (if not built-in)',
      '1× Hand truck / dolly',
      'Temporary pallet storage area',
    ],
    simultaneous_capacity: '1-2 people during deliveries',
    ceiling_height_min: 3.0,
    multi_purpose_with: ['Can share space with Storage during non-delivery hours'],
    cost_estimate_chf: 10_000,
  },

  // -------------------------------------------------------------------------
  // INNOVATION: Makerspace + AI Lab + Training
  // -------------------------------------------------------------------------
  {
    name: 'Makerspace & Hackerspace',
    sqm_min: 50,
    sqm_max: 80,
    sqm_recommended: 60,
    why_this_size: 'Makerspace industry standard: 10-12 workstations for electronics/prototyping = 50-70m². Includes: 6× soldering stations (~3m² each), 3-4× 3D printers (need ventilation space), 1× laser cutter (dedicated 10m² zone), tool library (10m²).',
    what_it_contains: [
      'Electronics workstations: 25m² (6× soldering benches with fume extraction)',
      '3D printing & fabrication: 20m² (3-4 printers, filament storage)',
      'Laser cutter zone: 10m² (dedicated ventilation, fire safety)',
      'Tool library: 5m² (shared tools, check-out system)',
    ],
    equipment_furniture: [
      '6× Soldering stations (ESD-safe, fume extractors)',
      '3-4× 3D printers (FDM type, enclosed for safety)',
      '1× Laser cutter (40W-60W, proper ventilation REQUIRED)',
      '1× CNC mill or router (optional, if budget allows)',
      'Hand tools library (multimeters, oscilloscopes, calipers)',
      'Material storage (filament, acrylic sheets, electronics components)',
    ],
    simultaneous_capacity: '12-15 people working on projects',
    ceiling_height_min: 2.8,
    layout_type: 'Zone-based: Electronics (quiet) separate from fabrication (noisy)',
    multi_purpose_with: ['Can host evening workshops, weekend maker events'],
    cost_estimate_chf: 35_000,
  },

  {
    name: 'AI Lab (Server Room)',
    sqm_min: 15,
    sqm_max: 30,
    sqm_recommended: 20,
    why_this_size: 'Data center industry standard: 3-4 server racks (each 0.6m × 1m footprint) = 2.4m². Add: cooling system space (30% of floor), electrical infrastructure (UPS, PDUs), access/maintenance corridors (40% of floor). Formula: 4 racks × 0.6m² × 2.7 (infrastructure multiplier) = ~18-25m².',
    what_it_contains: [
      'Server racks: 5m² (3-4 racks with GPUs)',
      'Cooling system: 6m² (HVAC, air circulation, hot aisle/cold aisle)',
      'Electrical infrastructure: 4m² (UPS, power distribution, cable management)',
      'Access corridor: 5m² (maintenance access around racks)',
    ],
    equipment_furniture: [
      '3-4× Server racks (42U standard height)',
      '8-30× GPUs depending on setup (see AI Lab Setup A/B/C from hub page)',
      '1× Cooling system (mini split AC or precision cooling)',
      '1× UPS (Uninterruptible Power Supply, 15-30 min backup)',
      'Network switches, cabling, patch panels',
      'Fire suppression system (required for server rooms)',
    ],
    simultaneous_capacity: '1-2 people for maintenance (not a workspace, technical room)',
    ceiling_height_min: 2.4,
    layout_type: 'Hot aisle / cold aisle for efficient cooling',
    cost_estimate_chf: 80_000, // 15-150k range, highly variable — depends on GPU Setup A/B/C
  },

  {
    name: 'Training & Course Room',
    sqm_min: 40,
    sqm_max: 70,
    sqm_recommended: 50,
    why_this_size: 'Training industry standard: 2-2.5m² per participant for seated courses. 20 participants × 2.5m² = 50m². Includes: student desks (30m²), instructor area (10m²), equipment storage (10m²).',
    what_it_contains: [
      'Student area: 30m² (20 desks in flexible config)',
      'Instructor zone: 10m² (teaching desk, presentation screen)',
      'Equipment storage: 10m² (laptops, cables, training materials)',
    ],
    equipment_furniture: [
      '20× Training desks (modular, can reconfigure for group work)',
      '20× Chairs (stackable for flexibility)',
      '1× Instructor desk + whiteboard',
      '1× Projector or large screen (min 80" for visibility)',
      '20× Laptops (for courses - can be refurbished devices from workshop!)',
      'Network infrastructure (Gigabit Ethernet, WiFi backup)',
    ],
    simultaneous_capacity: '20 course participants + 1-2 instructors',
    ceiling_height_min: 2.4,
    multi_purpose_with: [
      'Doubles as meeting space during non-course hours',
      'Can host corporate training (revenue source!)',
      'Evening: Community events, presentations',
    ],
    cost_estimate_chf: 30_000,
  },

  // -------------------------------------------------------------------------
  // CULTURE & COMMUNITY (Multi-Purpose Focus)
  // -------------------------------------------------------------------------
  {
    name: 'Event Space + Community Café (MULTI-PURPOSE)',
    sqm_min: 80,
    sqm_max: 120,
    sqm_recommended: 100,
    why_this_size: 'Multi-purpose space serving 3 functions: (1) Café during day (15-20 seats = 30-40m²), (2) Event space evening/weekend (50-80 people standing = 60-80m²), (3) Repair Café 2×/month (shares tables/space). Total 100m² accommodates all uses with flexible furniture.',
    what_it_contains: [
      'Café area: 40m² (15-20 seats, counter, coffee station)',
      'Event/performance area: 40m² (stage/presentation zone, 50-80 people standing)',
      'Flexible seating: 20m² (movable tables/chairs, reconfigure for different events)',
    ],
    equipment_furniture: [
      'CAFÉ MODE: 10× small tables (2-4 person), 20× chairs, coffee machine, display case',
      'EVENT MODE: Sound system (portable PA, 2× speakers, mixer), simple stage/riser (2m × 3m), projector',
      'REPAIR CAFÉ MODE: 6× large work tables (for device repair), shared with café tables',
      '1× Small kitchen (coffee, simple snacks - NOT full restaurant)',
      'Modular furniture (easy to reconfigure daily)',
    ],
    simultaneous_capacity: 'DAY: 15-20 café guests | EVENING: 50-80 event attendees | REPAIR CAFÉ: 30-40 people (2× per month)',
    ceiling_height_min: 3.0,
    layout_type: 'Open floor plan with movable furniture, minimal fixed installations',
    multi_purpose_with: [
      'DAYTIME: Café (Mon-Fri 9-17h)',
      'EVENINGS: Concerts, film screenings, tech talks, community dinners (Fri-Sat)',
      'WEEKENDS: Repair Café (1st & 3rd Saturday), workshops, private rentals',
    ],
    cost_estimate_chf: 45_000,
  },

  // -------------------------------------------------------------------------
  // CIRCULATION & SHARED INFRASTRUCTURE
  // -------------------------------------------------------------------------
  {
    name: 'Circulation, Corridors, Bathrooms',
    sqm_min: 50,
    sqm_max: 80,
    sqm_recommended: 60,
    why_this_size: 'Commercial building standard: 10-15% of total usable space for circulation. For 500m² usable = 50-75m² circulation. Includes: hallways (30m²), 2× bathrooms (15m² total), entrance/reception (15m²).',
    what_it_contains: [
      'Hallways & corridors: 30m² (1.2-1.5m wide, wheelchair accessible)',
      'Bathrooms: 15m² (2× bathrooms, handicap-accessible, Swiss building code)',
      'Entrance & reception: 15m² (coat rack, visitor waiting, info desk)',
    ],
    equipment_furniture: [
      'Bathroom fixtures (toilets, sinks, wheelchair-accessible stall)',
      'Entrance furniture (coat rack, shoe storage, visitor seating)',
      'Signage (wayfinding, room labels, safety exits)',
    ],
    simultaneous_capacity: 'N/A - shared infrastructure',
    ceiling_height_min: 2.4,
    cost_estimate_chf: 25_000,
  },
];

// ---------------------------------------------------------------------------
// Summary Calculations
// ---------------------------------------------------------------------------

// Private helpers — derive category totals from the authoritative area definitions above
function _sumSqm(names: readonly string[]): number {
  return HUB_SPACE_AREAS.filter(a => names.includes(a.name)).reduce((s, a) => s + a.sqm_recommended, 0);
}
function _sumCost(names: readonly string[]): number {
  return HUB_SPACE_AREAS.filter(a => names.includes(a.name)).reduce((s, a) => s + a.cost_estimate_chf, 0);
}

// Category area name lists — each drives both the label array and the computed totals
const _CORE_AREAS = ['Shop & Customer Area', 'Refurbishment Workshop', 'Office & Meeting Spaces', 'Storage & Logistics', 'Loading & Delivery Zone'] as const;
const _INNOVATION_AREAS = ['Makerspace & Hackerspace', 'AI Lab (Server Room)', 'Training & Course Room'] as const;
const _CULTURE_AREAS = ['Event Space + Community Café (MULTI-PURPOSE)'] as const;
const _INFRA_AREAS = ['Circulation, Corridors, Bathrooms'] as const;

// Named exports for cross-module lookups (avoids string-keyed find() in consumers)
export const STORAGE_AREA = HUB_SPACE_AREAS.find(a => a.name === 'Storage & Logistics');
export const LOADING_AREA = HUB_SPACE_AREAS.find(a => a.name === 'Loading & Delivery Zone');

const CIRCULATION_SQM = _sumSqm(_INFRA_AREAS);

export const SPACE_SUMMARY = {
  /** Total including circulation — the full lease footprint */
  total_with_circulation: HUB_SPACE_AREAS.reduce((sum, area) => sum + area.sqm_recommended, 0),
  /** Usable space excluding corridors/bathrooms — the number for program descriptions (~590m²) */
  total_usable: HUB_SPACE_AREAS.reduce((sum, area) => sum + area.sqm_recommended, 0) - CIRCULATION_SQM,
  total_cost_estimate: HUB_SPACE_AREAS.reduce((sum, area) => sum + area.cost_estimate_chf, 0),

  by_category: {
    core_business: {
      areas: _CORE_AREAS,
      total_sqm: _sumSqm(_CORE_AREAS),
      total_cost: _sumCost(_CORE_AREAS),
    },
    innovation: {
      areas: _INNOVATION_AREAS,
      total_sqm: _sumSqm(_INNOVATION_AREAS),
      // AI Lab cost varies by GPU setup (15k–150k) — not in per-area config
      total_cost_min: 35_000 + 15_000 + 30_000, // AI Lab Setup A
      total_cost_max: 35_000 + 150_000 + 30_000, // AI Lab Setup C
    },
    culture_community: {
      areas: _CULTURE_AREAS,
      total_sqm: _sumSqm(_CULTURE_AREAS),
      total_cost: _sumCost(_CULTURE_AREAS),
    },
    infrastructure: {
      areas: _INFRA_AREAS,
      total_sqm: _sumSqm(_INFRA_AREAS),
      total_cost: _sumCost(_INFRA_AREAS),
    },
  },

  rental_cost_estimate_per_year: {
    city_zurich: {
      min: 150_000, // ~600m² × CHF 250/m²/year
      max: 210_000, // ~600m² × CHF 350/m²/year
      note: 'NOT REALISTIC for our budget',
    },
    agglomeration: {
      min: 90_000,  // ~600m² × CHF 150/m²/year
      realistic: 120_000, // ~600m² × CHF 200/m²/year — used in budget-scenarios.ts
      max: 150_000, // ~600m² × CHF 250/m²/year
      locations: ['Volketswil', 'Schlieren', 'Dietikon', 'Regensdorf'],
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Multi-Purpose Opportunities (Space Efficiency)
// ---------------------------------------------------------------------------

export const MULTI_PURPOSE_STRATEGY = {
  event_space_cafe: {
    shared_space: 'Event Space + Community Café',
    sqm_saved: 40, // Instead of 60m² café + 80m² event = 140m², we use 100m² shared
    time_sharing: {
      weekday_day: 'Café mode (9-17h)',
      weekday_evening: 'Event mode (18-22h) - concerts, talks, film',
      saturday_1st_3rd: 'Repair Café (10-16h)',
      saturday_2nd_4th: 'Workshops, private rentals',
      sunday: 'Community events, flexible',
    },
    furniture_flexibility: 'Movable tables/chairs reconfigure in 15-20 minutes',
  },

  training_meeting: {
    shared_space: 'Training & Course Room',
    time_sharing: {
      weekday_day: 'Corporate training, workshops (revenue!)',
      weekday_evening: 'Community courses (AI Literacy, Linux, Coding)',
      off_hours: 'Team meetings, presentations',
    },
    sqm_saved: 20, // Instead of 50m² training + 20m² meeting = 70m², we use 50m² shared
  },

  office_meeting: {
    shared_space: 'Office & Meeting Spaces',
    note: 'Meeting room (15m²) used <50% of time, serves as quiet focus room when not in meetings',
  },

  makerspace_events: {
    shared_space: 'Makerspace & Hackerspace',
    time_sharing: {
      weekday_evening: 'Open makerspace (members work on projects)',
      weekend: 'Workshops (Arduino, 3D printing, soldering courses)',
    },
  },

  total_space_saved_by_multi_purpose: 60, // Café+Event (40m²) + Training+Meeting (20m²)
  efficiency_gain: '11% space reduction through smart time-sharing',
} as const;

