/**
 * Stiftungen Data - SSOT for foundation information
 *
 * FOUNDATION TYPES (from Robert Schmuki's presentation RVIT_Mittelsicherung_WSH2_22 12 25.pdf, p.13):
 * A = Professionalisierte Förderstiftung - Professional management, decisions based on analyses & norms
 * B = Potente Familienstiftung - Family foundation with administration, personal interests matter
 * C = Kleine Familienstiftung - Small board (3-5 people), emotional decisions, direct applications
 * D = Corporate Foundation - Professional but less transparent, norm-based processes
 *
 * THEMES (aligned with Revamp-IT's work):
 * - klima: Climate protection, CO2 reduction, sustainability
 * - kreislaufwirtschaft: Circular economy, reuse, repair, e-waste
 * - soziale-integration: Social integration, disadvantaged groups, second chance
 * - digitale-bildung: Digital education, IT workshops, tech skills training
 * - digitale-souveraenitaet: Digital sovereignty, open source, Linux, vendor independence
 * - jugend: Youth and young adults (15-30)
 * - zuerich: Zurich region focus
 * - arbeitsintegration: Job market integration, employment programs
 *
 * Status: open, closed, rolling, soon
 * Fit: 1-3 (3 = best fit for Revamp-IT)
 *
 * FOUNDATION CATEGORY (for grant-seeking relevance):
 * isOperative: true = Foundation runs programs directly, does NOT give grants to others
 * isOperative: false/undefined = Grant-giving foundation (Förderstiftung)
 */

// ============================================================================
// THEME DEFINITIONS - Revamp-IT relevant categories
// ============================================================================
const THEMES = {
  'klima': {
    id: 'klima',
    label: 'Klima & Umwelt',
    icon: '🌍',
    description: 'Klimaschutz, CO2-Reduktion, Nachhaltigkeit',
    color: '#10b981'
  },
  'kreislaufwirtschaft': {
    id: 'kreislaufwirtschaft',
    label: 'Kreislaufwirtschaft',
    icon: '♻️',
    description: 'Wiederverwendung, Reparatur, E-Waste',
    color: '#059669'
  },
  'soziale-integration': {
    id: 'soziale-integration',
    label: 'Soziale Integration',
    icon: '🤝',
    description: 'Benachteiligte, Chancengleichheit, Second Chance',
    color: '#8b5cf6'
  },
  'digitale-bildung': {
    id: 'digitale-bildung',
    label: 'Digitale Bildung',
    icon: '💻',
    description: 'IT-Workshops, Tech Skills, Medienkompetenz',
    color: '#3b82f6'
  },
  'digitale-souveraenitaet': {
    id: 'digitale-souveraenitaet',
    label: 'Digitale Souveränität',
    icon: '🔓',
    description: 'Open Source, Linux, Unabhängigkeit',
    color: '#6366f1'
  },
  'jugend': {
    id: 'jugend',
    label: 'Jugend',
    icon: '👥',
    description: 'Jugendliche und junge Erwachsene (15-30)',
    color: '#f59e0b'
  },
  'zuerich': {
    id: 'zuerich',
    label: 'Region Zürich',
    icon: '📍',
    description: 'Stadt oder Kanton Zürich Fokus',
    color: '#ef4444'
  },
  'arbeitsintegration': {
    id: 'arbeitsintegration',
    label: 'Arbeitsintegration',
    icon: '💼',
    description: 'Arbeitsmarkt-Integration, Beschäftigung',
    color: '#14b8a6'
  }
};

// ============================================================================
// SOURCE DEFINITIONS - Where we found the foundation
// ============================================================================
const SOURCES = {
  'manual': {
    id: 'manual',
    label: 'Eigenrecherche',
    description: 'Direkt recherchiert oder durch Netzwerk gefunden'
  },
  'fundraiso': {
    id: 'fundraiso',
    label: 'Fundraiso.ch',
    url: 'https://www.fundraiso.ch',
    description: '13\'300+ Schweizer Stiftungen'
  },
  'stiftungschweiz': {
    id: 'stiftungschweiz',
    label: 'StiftungSchweiz',
    url: 'https://stiftungen.stiftungschweiz.ch',
    description: '~14\'000 Stiftungen mit Filteroptionen'
  },
  'esa': {
    id: 'esa',
    label: 'Eidg. Stiftungsaufsicht',
    url: 'https://www.esa.admin.ch/de/stiftungsverzeichnis',
    description: 'Offizielles Bundesregister'
  },
  'robert': {
    id: 'robert',
    label: 'Robert Schmuki',
    description: 'Empfehlung aus Fundraising-Workshop'
  }
};

// ============================================================================
// FOUNDATION DATA
// ============================================================================
const STIFTUNGEN_DATA = [
  // PRIORITY 1: Apply Now (Deadline in 1-3 months)
  {
    slug: "klimastiftung",
    name: "Klimastiftung Schweiz",
    type: "A",
    status: "open",
    deadline: "2026-03-01",
    deadlineText: "1. März 2026",
    nextDeadline: "1. September 2026",
    amount: { min: 5000, max: 200000, text: "bis CHF 200'000 (max. 50% Projektkosten)" },
    fit: 3,
    priority: 1,
    tagline: "Die Stiftung, die KMUs beim Klimaschutz unterstützt",
    founded: 2008,
    annualBudget: "ca. CHF 3 Mio.",
    region: "CH/FL",
    applicationUrl: "https://www.klimastiftung.ch/de/antrag-stellen/",
    websiteUrl: "https://www.klimastiftung.ch",
    applicationMethod: "online",
    themes: ["klima", "kreislaufwirtschaft"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "ernst-goehner",
    name: "Ernst Göhner Stiftung",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Min. 4 Monate vor Projektstart",
    amount: { min: 15000, max: 30000, text: "CHF 15'000 - 30'000 (typisch)" },
    fit: 3,
    priority: 1,
    tagline: "Eine der grössten Schweizer Stiftungen",
    founded: 1957,
    annualBudget: "ca. CHF 40 Mio.",
    region: "Schweiz",
    applicationUrl: "https://ernst-goehner-stiftung.ch/index.php/de/services/Downloads",
    websiteUrl: "https://ernst-goehner-stiftung.ch",
    applicationMethod: "post",
    contact: {
      address: "Ernst Göhner Stiftung, Artherstrasse 19, 6300 Zug",
      email: "info@ernst-goehner-stiftung.ch",
      phone: "+41 41 729 66 33"
    },
    themes: ["soziale-integration", "digitale-bildung", "klima"],
    source: "robert",
    researchDate: "2026-02-06"
  },
  {
    slug: "binding",
    name: "Sophie und Karl Binding Stiftung",
    type: "A",
    status: "open",
    deadline: "2026-03-31",
    deadlineText: "31. März 2026",
    deadlines: [
      { date: "31. März", response: "Ende Juni" },
      { date: "30. Juni", response: "Ende September" },
      { date: "22. September", response: "Ende Dezember" },
      { date: "15. Dezember", response: "Ende März 2027" }
    ],
    amount: { min: 3000, max: 100000, text: "CHF 3'000 - 100'000+/Jahr" },
    fit: 3,
    priority: 1,
    tagline: "Grosse Basler Stiftung mit Herz für Jugendintegration",
    region: "Schweiz",
    applicationUrl: "https://request-binding.alphafoundation.app",
    websiteUrl: "https://www.binding-stiftung.ch",
    applicationMethod: "online",
    contact: {
      email: "contact@binding-stiftung.ch",
      phone: "+41 61 317 40 90"
    },
    themes: ["jugend", "soziale-integration", "arbeitsintegration", "digitale-bildung"],
    source: "robert",
    researchDate: "2026-02-06"
  },
  {
    slug: "baugarten",
    name: "Stiftung Baugarten Zürich",
    type: "B",
    status: "open",
    deadline: "2026-05-01",
    deadlineText: "1. Mai 2026",
    amount: { min: 5000, max: 50000, text: "CHF 5'000 - 50'000" },
    fit: 3,
    priority: 1,
    tagline: "Zürcher Stiftung für soziale & ökologische Projekte",
    region: "Stadt & Kanton Zürich",
    applicationUrl: "https://www.baugarten-zuerich.ch/gesuch",
    websiteUrl: "https://www.baugarten-zuerich.ch",
    applicationMethod: "online",
    themes: ["zuerich", "soziale-integration", "klima", "digitale-bildung"],
    source: "manual",
    researchDate: "2026-02-06"
  },

  // PRIORITY 2: Rolling Applications
  {
    slug: "mercator",
    name: "Mercator Stiftung Schweiz",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    responseTime: "4 Wochen",
    amount: { min: 15000, max: 40000, text: "CHF 15'000 - 40'000+ (je nach Projekt)" },
    fit: 2,
    priority: 2,
    tagline: "Digitalisierung + Gesellschaft als Förderfeld",
    founded: 2006,
    region: "Schweiz",
    applicationUrl: "https://gesuch.stiftung-mercator.ch",
    websiteUrl: "https://www.stiftung-mercator.ch",
    applicationMethod: "online",
    themes: ["digitale-bildung", "digitale-souveraenitaet"],
    source: "robert",
    researchDate: "2026-02-06"
  },
  {
    slug: "hirschmann",
    name: "Hirschmann Stiftung",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "6 Monate vor Projektbeginn",
    decisionCycle: "3x jährlich (Frühling/Sommer/Winter)",
    amount: { min: null, max: null, text: "Variabel (mehrjährig bevorzugt)" },
    fit: 3,
    priority: 2,
    tagline: "Die Stiftung, die Grassroots-Projekte liebt",
    founded: 1985,
    region: "Schweiz",
    applicationUrl: "https://www.hirschmann-stiftung.ch/en/sponsorship/",
    websiteUrl: "https://www.hirschmann-stiftung.ch",
    applicationMethod: "email",
    contact: {
      email: "kontakt@hirschmann-stiftung.ch"
    },
    sdgs: [3, 4, 8],
    themes: ["soziale-integration", "arbeitsintegration", "digitale-bildung"],
    source: "robert",
    researchDate: "2026-02-06"
  },
  {
    slug: "drosos",
    name: "Drosos Stiftung",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    responseTime: "6-12 Monate (inkl. Due Diligence)",
    amount: { min: 50000, max: 500000, text: "CHF 50'000 - 500'000+ (3-5 Jahre)" },
    fit: 2,
    priority: 2,
    tagline: "Ermöglicht benachteiligten Menschen, ihr Leben selbst zu gestalten",
    region: "Zürich / Schweiz",
    applicationUrl: "https://www.drosos.org/how-we-work/partner-us",
    websiteUrl: "https://www.drosos.org",
    applicationMethod: "email",
    contact: {
      email: "info@drosos.org"
    },
    themes: ["jugend", "soziale-integration", "arbeitsintegration"],
    source: "robert",
    researchDate: "2026-02-06"
  },
  {
    slug: "hasler",
    name: "Hasler Stiftung",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    responseTime: "~30 Tage (kleine Projekte)",
    amount: { min: 10000, max: 50000, text: "CHF 10'000 - 50'000+" },
    smallProjects: { max: 10000, text: "bis CHF 10'000 (Events, Publikationen)" },
    fit: 2,
    priority: 2,
    tagline: "Die ICT-Stiftung der Schweiz seit 1948",
    founded: 1948,
    region: "Schweiz",
    applicationUrl: "https://haslerstiftung.ch/en/what-the-hasler-foundation-supports/supportprograms/",
    websiteUrl: "https://haslerstiftung.ch",
    applicationMethod: "online",
    themes: ["digitale-bildung", "digitale-souveraenitaet", "jugend"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "zkb-philanthropie",
    name: "ZKB Philanthropie Stiftung",
    type: "D",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    amount: { min: null, max: null, text: "Variabel" },
    fit: 2,
    priority: 2,
    tagline: "Neue Zürcher Stiftung - regional verankert",
    founded: 2024,
    region: "Kanton Zürich",
    applicationUrl: "https://www.zkb-philanthropie-stiftung.ch/de.html",
    websiteUrl: "https://www.zkb-philanthropie-stiftung.ch",
    applicationMethod: "online",
    themes: ["zuerich", "soziale-integration", "klima", "digitale-bildung"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "arbeitsintegration-zh",
    name: "Arbeitsintegration Zürich",
    type: "D",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    amount: { min: null, max: null, text: "Partnerschaft (Lohnkosten übernommen)" },
    fit: 3,
    priority: 2,
    tagline: "Partnerschaft statt Grant - nachhaltiges Einkommen",
    region: "Stadt Zürich",
    applicationUrl: "https://www.stadt-zuerich.ch/de/lebenslagen/unterstuetzung-und-beratung/arbeitslosigkeit/arbeitsintegration.html",
    websiteUrl: "https://www.stadt-zuerich.ch/sd/de/index/unterstuetzung/ai/arbeitsintegrationsozialhilfe.html",
    applicationMethod: "contact",
    isPartnership: true,
    themes: ["zuerich", "arbeitsintegration", "soziale-integration"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "zuerich-jobs",
    name: "Stiftung Zürich-Jobs",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    amount: { min: null, max: null, text: "Variabel" },
    capital: "CHF 3.4 Mio.",
    fit: 3,
    priority: 2,
    tagline: "Stadt + Wirtschaft für Jugend-Arbeitsintegration",
    founded: 2006,
    region: "Stadt Zürich",
    applicationUrl: "https://stiftungzuerichjobs.ch/",
    websiteUrl: "https://stiftungzuerichjobs.ch/ueber/",
    applicationMethod: "contact",
    themes: ["zuerich", "jugend", "arbeitsintegration"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "max-kohler",
    name: "Max Kohler Stiftung",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    amount: { min: null, max: null, text: "Variabel" },
    fit: 2,
    priority: 2,
    tagline: "Arts for Change - Kreativität für Integration",
    founded: 2003,
    region: "Zürich",
    applicationUrl: "https://www.maxkohler-stiftung.ch/en/contact/applications/",
    websiteUrl: "https://www.maxkohler-stiftung.ch",
    applicationMethod: "email",
    contact: {
      address: "Schifflände 5, 8001 Zürich"
    },
    themes: ["zuerich", "jugend", "soziale-integration"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "glueckskette",
    name: "Glückskette",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit",
    amount: { min: null, max: null, text: "Variabel" },
    fit: 2,
    priority: 2,
    tagline: "Berufliche + Soziale Integration junger Menschen",
    region: "Schweiz",
    applicationUrl: "https://www.glueckskette.ch/sammlungen/berufliche-und-soziale-integration-junger-menschen-in-der-schweiz/",
    websiteUrl: "https://www.glueckskette.ch",
    applicationMethod: "online",
    themes: ["jugend", "soziale-integration", "arbeitsintegration"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "minerva",
    name: "Minerva Stiftung",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit (Entscheide 4x/Jahr)",
    decisionCycle: "März, Juni, September, November",
    amount: { min: null, max: null, text: "Variabel" },
    fit: 3,
    priority: 2,
    tagline: "Kreislaufwirtschaft & Jugendbildung (15-25) aus Lugano",
    founded: null,
    region: "Schweiz (Fokus auch Tessin)",
    applicationUrl: "https://minerva-stiftung.org/",
    websiteUrl: "https://minerva-stiftung.org",
    applicationMethod: "online",
    contact: {
      email: "info@minerva-stiftung.org",
      phone: "+41 (0)79 945 37 38"
    },
    criteria: {
      nature: "Messbare Projekte mit Skalierungspotenzial, Kreislaufwirtschaft, Ressourcenschonung",
      education: "Jugendprogramme 15-25, Übergang Schule-Beruf, hohe Jugendarbeitslosigkeit"
    },
    themes: ["kreislaufwirtschaft", "jugend", "soziale-integration", "arbeitsintegration"],
    source: "fundraiso",
    researchDate: "2026-02-06"
  },

  // PRIORITY 3: Watch & Wait
  {
    slug: "prototype-fund",
    name: "Prototype Fund Schweiz",
    type: "A",
    status: "soon",
    deadline: null,
    deadlineText: "Runde 5: Ende Januar 2026 (8 Wochen Bewerbungsfenster)",
    amount: { min: null, max: 100000, text: "bis CHF 100'000 (6 Monate)" },
    fit: 3,
    priority: 3,
    tagline: "Fördert Open-Source-Projekte für das Gemeinwohl",
    region: "Schweiz",
    applicationUrl: "https://prototypefund.opendata.ch/bewerbung/",
    websiteUrl: "https://prototypefund.opendata.ch",
    applicationMethod: "online",
    requiresOpenSource: true,
    themes: ["digitale-souveraenitaet", "klima", "kreislaufwirtschaft"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "migros-getconnected",
    name: "Migros \"Get connected!\"",
    type: "D",
    status: "closed",
    deadline: null,
    deadlineText: "2025 Runde abgeschlossen - neue Runde ca. Juni 2026",
    amount: { min: 2000, max: 10000, text: "CHF 2'000 - 10'000" },
    fit: 3,
    priority: 3,
    tagline: "Digitale Inklusion für Benachteiligte",
    region: "Schweiz",
    applicationUrl: "https://engagement.migros.ch/en/culture-percentage/social-affairs/getconnected",
    websiteUrl: "https://engagement.migros.ch",
    applicationMethod: "online",
    contact: {
      email: "isabelle.ruckli@mgb.ch"
    },
    stats2025: "45 Projekte, CHF 362'205",
    themes: ["digitale-bildung", "soziale-integration"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "klimup",
    name: "Stadt Zürich KlimUp",
    type: "D",
    status: "closed",
    deadline: null,
    deadlineText: "Aktuell geschlossen - 2026 Runde geplant",
    amount: { min: 5000, max: 600000, text: "NPO: CHF 5k-100k (Projekt) / CHF 60k-600k (Betrieb, 2-4 J.)" },
    fit: 3,
    priority: 3,
    tagline: "Das Zürcher Förderprogramm für Kreislaufwirtschaft",
    totalBudget: "CHF 14 Mio. (+ CHF 3 Mio. für 2026 beantragt)",
    region: "Stadt Zürich",
    applicationUrl: "https://www.stadt-zuerich.ch/de/umwelt-und-energie/klima/beratung-und-foerderung/klimup.html",
    websiteUrl: "https://www.stadt-zuerich.ch/de/umwelt-und-energie/klima/beratung-und-foerderung/klimup.html",
    applicationMethod: "online",
    themes: ["zuerich", "kreislaufwirtschaft", "klima"],
    source: "manual",
    researchDate: "2026-02-06"
  },

  // ============================================================================
  // PRIORITY 3: Research Needed - From ESA Registry (Purpose known, details TBD)
  // ============================================================================
  {
    slug: "stellennetz",
    name: "Stiftung Stellennetz",
    type: "B",
    status: "closed", // Operative foundation - not grant-giving
    deadline: null,
    deadlineText: "Keine Fördergesuche",
    amount: { min: null, max: null, text: "Nicht anwendbar" },
    fit: 1, // Operative - not relevant for grants
    priority: 1,
    tagline: "OPERATIV: Betreibt eigene Programme, vergibt keine Fördergelder",
    uid: "CHE-310.604.106",
    region: "Zürich",
    websiteUrl: "https://stellennetz-zh.ch/",
    contactEmail: "info@stellennetz-zh.ch",
    contactPhone: "+41 44 297 91 91",
    applicationMethod: "none", // Operative foundation
    purposeSummary: "Dienstleistungen im Bereich der Arbeitsintegration, Projekte im Auftrag von öffentlichen oder privaten Instanzen. ACHTUNG: Operative Stiftung - vergibt keine Fördergelder!",
    themes: ["zuerich", "arbeitsintegration", "soziale-integration"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    isOperative: true // Runs programs, doesn't give grants
  },
  {
    slug: "climatoor",
    name: "Stiftung climatoor",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Kontakt aufnehmen",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 2, // Climate focus but unclear application process
    priority: 2,
    tagline: "Umwelt- & Klimaschutz, Bildung, Wissenschaft",
    uid: "CHE-298.041.207",
    region: "Zürich",
    websiteUrl: "https://app.spheriq.ch/organisation/stiftung-climatoor",
    applicationMethod: "direct",
    purposeSummary: "Fördert Umwelt-/Klimaschutz durch: Projektunterstützung, Wissenschaft/Forschung, Sensibilisierung & Bildung. Keine eigene Website gefunden.",
    themes: ["zuerich", "klima", "digitale-bildung"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: true,
    researchNotes: "Keine eigene Website. Details auf Spheriq. Kontaktdaten über Handelsregister ermitteln und direkt anfragen."
  },
  {
    slug: "z43-netzero",
    name: "Z43 NetZero Stiftung",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Laufend",
    amount: { min: 300000, max: 600000, text: "USD 300-600k/Jahr (gesamt)" },
    fit: 2, // Focus on R&D, less on social enterprises
    priority: 2,
    tagline: "Klimaneutrale Technologien & Forschung",
    uid: "CHE-281.354.514",
    region: "Zürich / International",
    websiteUrl: "https://www.fundraiso.ch/en/organisations/z43-netzero-stiftung",
    contactEmail: "info@z43netzero.org",
    applicationMethod: "direct",
    purposeSummary: "Investiert in F&E für skalierbare, klimaneutrale Technologien. Gegründet Aug 2024 durch SPEAG/IT'IS Foundation. Fokus auf technologische Innovation.",
    themes: ["zuerich", "klima"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Neu gegründet (Aug 2024). Finanziert durch Z43-Gebäude E-Fuel Differenz. Stiftungsrat: Prof. Niels Kuster, Dr. Roland Walthert, Dr. Davnah Urbach. Fokus auf technologische R&D - weniger passend für soziale Projekte."
  },
  {
    slug: "stopp-klimakrise",
    name: "Stiftung Stopp Klimakrise - Kurt De Lorenzo",
    type: "C", // Small family foundation
    status: "rolling",
    deadline: null,
    deadlineText: "Persönlicher Kontakt",
    amount: { min: null, max: null, text: "Unbekannt (klein)" },
    fit: 2, // Small foundation, unclear process
    priority: 2,
    tagline: "Natur- und Klimaschutz, Ressourcenschonung - KLEINE STIFTUNG",
    uid: "CHE-391.558.817",
    region: "Zürich",
    websiteUrl: "https://www.zefix.admin.ch/de/search/entity/list?name=CHE391558817&directLink=true",
    applicationMethod: "personal",
    purposeSummary: "Fördert Natur-/Klimaschutz und Ressourcenschonung. Kleine Familienstiftung ohne Web-Präsenz. Persönlicher Kontakt zum Stifter erforderlich.",
    themes: ["zuerich", "klima", "kreislaufwirtschaft"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: true,
    researchNotes: "Keine Website gefunden. Typ C Familienstiftung - emotionale Entscheide, persönlicher Zugang wichtig. Stifter Kurt De Lorenzo über Netzwerk kontaktieren."
  },
  {
    slug: "familie-schwarz",
    name: "Familie Schwarz Stiftung",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Laufend (Kontakt aufnehmen)",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 3, // Great fit: Environment + social + youth
    priority: 3,
    tagline: "Umweltschutz, soziale Not, Jugend - GUTER FIT!",
    uid: "CHE-466.408.960",
    region: "Zürich / Weltweit",
    websiteUrl: "https://www.fundraiso.ch/sponsor/familie-schwarz-stiftung",
    applicationMethod: "direct",
    purposeSummary: "Finanziert: Umweltschutzprojekte, Hilfe für Menschen in sozialer/körperlicher Not, Jugend- und Alterspflege, Gesundheitswesen, Wohnsicherheit. Gegründet Dez 2022.",
    themes: ["zuerich", "kreislaufwirtschaft", "klima", "jugend", "soziale-integration"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Familienstiftung Schwarz, Feldblumenstrasse 19a, 8048 Zürich. Stiftungsrat: Konrad Schwarz (Präsident), Alexander Troschel, Barbara Schwarz. Breit aufgestellt: Umwelt + Soziales. Guter Fit für Revamp-IT."
  },
  {
    slug: "baitella-eberle",
    name: "Baitella-Eberle Stiftung",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Laufend (Kontakt aufnehmen)",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 3, // Great fit: Tech education + environment + disadvantaged youth
    priority: 3,
    tagline: "Zukunftstechnologien, Innovation, Umwelt, benachteiligte Jugend - SUPER FIT!",
    uid: "CHE-389.062.085",
    region: "Zürich / CH / Entwicklungsländer",
    websiteUrl: "https://www.fundraiso.ch/de/organisations/baitella-eberle-stiftung",
    applicationMethod: "direct",
    purposeSummary: "Fördert: 1) Aus-/Weiterbildung in Zukunftstechnologien, 2) Innovative Ideen für Allgemeinheit & Umwelt, 3) Bildung für benachteiligte Kinder/Jugendliche, 4) Natur-/Umweltschutz. Gegründet 2024.",
    themes: ["zuerich", "digitale-bildung", "klima", "jugend", "soziale-integration"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Administriert via Zürcher Kantonalbank, Bahnhofstrasse 9. Neue Stiftung (2024) mit breitem Fokus. Alle Revamp-IT Kernthemen abgedeckt: Technologie, Umwelt, Bildung, benachteiligte Jugend. HOHE PRIORITÄT!"
  },
  {
    slug: "foundation-regina",
    name: "Foundation Regina",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Laufend (via Hochschule)",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 2, // Academic focus - need university partner
    priority: 2,
    tagline: "Informatik & Umweltschutz - AKADEMISCHER FOKUS",
    uid: "CHE-449.768.771",
    region: "Zürich / International",
    websiteUrl: "https://www.zefix.admin.ch/de/search/entity/list?name=CHE449768771&directLink=true",
    applicationMethod: "via_partner", // Through universities
    purposeSummary: "Fördert Forschung in Energie, Technologie, Informatik & Umweltschutz. Primär an Hochschulen/Fachhochschulen. Gegründet 2024. Für Revamp-IT: Kooperation mit ZHAW/BFH könnte Türen öffnen.",
    themes: ["zuerich", "digitale-bildung", "digitale-souveraenitaet", "klima"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Administriert via STAIGER Rechtsanwälte, Talacker 41, 8001 Zürich. Keine eigene Website. Fokus auf akademische Forschung - direkter Antrag wahrscheinlich nicht möglich, aber über Hochschulpartner (ZHAW, BFH) denkbar."
  },
  {
    slug: "futuri",
    name: "Stiftung Futuri",
    type: "B",
    status: "rolling",
    deadline: null,
    deadlineText: "Direkte Anfrage",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 3,
    priority: 2,
    tagline: "Ausbildung, berufliche & soziale Integration, Nachhaltigkeit - KONTAKT AUFNEHMEN",
    uid: "CHE-325.640.105",
    region: "Zürich",
    websiteUrl: "https://www.futuri.ch/",
    applicationMethod: "direct", // Contact directly
    purposeSummary: "Förderung von Menschen durch Ausbildung und berufliche/soziale Integration. Betreibt primär eigene Programme für Geflüchtete, kann aber auch externe Projekte unterstützen. Direkten Kontakt aufnehmen!",
    themes: ["zuerich", "arbeitsintegration", "soziale-integration", "jugend", "klima"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Primär operative Stiftung (eigene Ausbildungsprogramme), aber laut Zweck auch Förderung von externen Projekten möglich. Direktkontakt empfohlen."
  },
  {
    slug: "erde-2-0",
    name: "ERDE 2.0 Stiftung",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Laufend (akademisch)",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 2, // Academic focus - need research partner
    priority: 2,
    tagline: "Klimaresilienz & Technologie - AKADEMISCHER FOKUS",
    uid: "CHE-443.701.461",
    region: "Zürich / CH / International",
    websiteUrl: "https://stiftungen.stiftungschweiz.ch/organisation/erde-2-0-stiftung",
    applicationMethod: "via_partner", // Through academic institutions
    purposeSummary: "Fördert wissenschaftliche Ideen für Klimaresilienz: Klima/Wetter, Energie/Wasser/Nahrung, Gesundheit, technologische Innovation. Primär akademische Initiativen mit CH-Institutionen.",
    themes: ["zuerich", "klima", "digitale-bildung"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Administriert via Centralis Switzerland, Kanzleistrasse 18, 8004 Zürich. Starker akademischer Fokus. Für Revamp-IT evtl. über Hochschulpartner (ZHAW, BFH) - z.B. für Impact-Studie zu IT-Refurbishing."
  },
  {
    slug: "responsability",
    name: "responsAbility Foundation",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Wahrscheinlich nicht passend",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 1, // Focus on developing countries
    priority: 1,
    tagline: "UN SDGs, Entwicklungsländer - NICHT FÜR CH-PROJEKTE",
    uid: "CHE-389.004.225",
    region: "Entwicklungsländer",
    websiteUrl: "https://zh.chregister.ch/cr-portal/auszug/auszug.xhtml?uid=CHE-389.004.225",
    applicationMethod: "unknown",
    purposeSummary: "Beitrag zu UN-SDGs durch Impact Investing in Entwicklungs-/Schwellenländer. ESG-fokussiert. Katalytisches Kapital. Gegründet 2024.",
    themes: ["klima", "soziale-integration"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Verknüpft mit responsAbility Investments AG (Impact Investing). Fokus auf Entwicklungsländer - nicht für Schweizer Projekte wie Revamp-IT geeignet, ausser wir expandieren international."
  },
  {
    slug: "landscape-resilience",
    name: "Landscape Resilience Fund",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Nicht für CH-Projekte",
    amount: { min: null, max: null, text: "Unbekannt" },
    fit: 1, // Focus on developing countries
    priority: 1,
    tagline: "Klimaanpassung, Entwicklungsländer - NICHT FÜR CH-PROJEKTE",
    uid: "CHE-485.173.674",
    region: "Entwicklungsländer",
    websiteUrl: "https://www.zefix.admin.ch/de/search/entity/list?name=CHE485173674&directLink=true",
    applicationMethod: "unknown",
    purposeSummary: "Klimaanpassung und KMU-Finanzierung in Schwellen- und Entwicklungsländern. Landschaftsansatz ('landscape approach'). Gegründet 2021.",
    themes: ["klima"],
    source: "esa",
    researchDate: "2026-02-06",
    needsResearch: false,
    researchNotes: "Expliziter Fokus auf Entwicklungs- und Schwellenländer. Nicht für Schweizer Projekte wie Revamp-IT geeignet."
  },

  // Networks & Resources (not direct funders)
  {
    slug: "netzwerk-sds",
    name: "Netzwerk SDS",
    type: "network",
    status: "open",
    deadline: null,
    deadlineText: "Mitgliedschaft jederzeit",
    amount: { min: null, max: null, text: "Netzwerk (keine direkte Förderung)" },
    fit: 2,
    priority: 4,
    tagline: "Souveräne Digitale Schweiz",
    members: "100+ Organisationen",
    region: "Schweiz",
    applicationUrl: "https://netzwerksds.ch/",
    websiteUrl: "https://netzwerksds.ch",
    applicationMethod: "membership",
    partners: ["BFH", "EJPD", "Stadt Zürich", "Post", "SWITCH"],
    isNetwork: true,
    themes: ["digitale-souveraenitaet"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "ch-open",
    name: "CH Open",
    type: "network",
    status: "open",
    deadline: null,
    deadlineText: "Mitgliedschaft jederzeit",
    amount: { min: null, max: null, text: "CHF ~200/Jahr (Verein)" },
    fit: 2,
    priority: 4,
    tagline: "Open Source Community seit 1982",
    members: "~200 Personen, 54 Kollektiv, 53 Sponsoren",
    region: "Schweiz",
    applicationUrl: "https://www.ch-open.ch/en/",
    websiteUrl: "https://www.ch-open.ch",
    applicationMethod: "membership",
    events: ["DINAcon", "Lunch Lectures"],
    isNetwork: true,
    themes: ["digitale-souveraenitaet"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "innosuisse",
    name: "Innosuisse",
    type: "A",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit (mit Forschungspartner)",
    amount: { min: null, max: null, text: "Variabel (substanziell)" },
    fit: 1,
    priority: 4,
    tagline: "Förderagentur für Innovation",
    region: "Schweiz",
    applicationUrl: "https://www.innosuisse.admin.ch/en/foerderangebote",
    websiteUrl: "https://www.innosuisse.admin.ch",
    applicationMethod: "partnership",
    requiresPartner: true,
    possiblePartners: ["BFH", "ZHAW", "Empa"],
    themes: ["kreislaufwirtschaft", "digitale-souveraenitaet"],
    source: "manual",
    researchDate: "2026-02-06"
  },
  {
    slug: "swico",
    name: "Swico Innovationsfonds",
    type: "D",
    status: "rolling",
    deadline: null,
    deadlineText: "Jederzeit (Swico-Vertrag erforderlich)",
    amount: { min: null, max: 300000, text: "bis CHF 300'000" },
    fit: 1,
    priority: 4,
    tagline: "Bis CHF 300k für IT-Recycling-Projekte",
    region: "Schweiz",
    applicationUrl: "https://www.swico.ch/de/recycling/innovationsfonds/",
    websiteUrl: "https://www.swico.ch/de/recycling/innovationsfonds/wer-kann-sich-bewerben/",
    applicationMethod: "contract",
    requiresContract: true,
    themes: ["kreislaufwirtschaft"],
    source: "manual",
    researchDate: "2026-02-06"
  }
];

// ============================================================================
// NOT RECOMMENDED - Foundations that don't fit Revamp-IT
// ============================================================================
const NOT_RECOMMENDED = [
  { name: "Avina Stiftung", reason: "Nur Ernährung/Food - \"Soziale Projekte\" explizit ausgeschlossen" },
  { name: "Gebert Rüf Stiftung", reason: "Nur Uni-Spin-offs und Hochschulprojekte" },
  { name: "Velux Stiftung", reason: "Nur akademische Forschung (Tageslicht, Wald, Alter)" },
  { name: "Stiftung Walder", reason: "Nur Projekte für Senioren (65+)" },
  { name: "Pestalozzi-Stiftung", reason: "Führt eigene Programme, keine externe Förderung" },
  { name: "UBS Optimus Foundation", reason: "Aktuell geschlossen für Bewerbungen, globaler Fokus" },
  { name: "Swiss Re Foundation", reason: "Nur Entwicklungsländer" },
  { name: "Coop Nachhaltigkeitsfonds", reason: "Stark auf Food fokussiert, \"Kerngeschäft-Verbindung\" nötig" }
];

// ============================================================================
// FOUNDATION DATABASES - For finding more foundations
// ============================================================================
const DATABASES = [
  {
    name: "Fundraiso.ch",
    url: "https://www.fundraiso.ch/de/page/stiftungsverzeichnis-schweiz",
    count: "13'300+",
    cost: "Basis: Gratis / Pro: Abo",
    description: "Täglich aktualisierte Datenbank aller gemeinnützigen Stiftungen der Schweiz"
  },
  {
    name: "StiftungSchweiz",
    url: "https://stiftungen.stiftungschweiz.ch/",
    count: "~14'000",
    cost: "Basis: Gratis / Premium: Abo",
    description: "Umfassende Plattform mit erweiterten Filteroptionen: Wirkungsart, Themengebiet, Zielgruppe, SDGs"
  },
  {
    name: "Eidg. Stiftungsaufsicht",
    url: "https://www.esa.admin.ch/de/stiftungsverzeichnis",
    count: "Variabel",
    cost: "Gratis",
    description: "Offizielles Register der Stiftungen unter Bundesaufsicht"
  }
];

// ============================================================================
// TYPE LABELS (Robert Schmuki classification)
// ============================================================================
const TYPE_LABELS = {
  A: {
    short: "A",
    long: "Professionalisierte Förderstiftung",
    desc: "Professionelles Management, Entscheide basieren auf Analysen & Normen",
    approach: "Strukturierte Anträge, Impact-Metriken, professionelle Kommunikation"
  },
  B: {
    short: "B",
    long: "Potente Familienstiftung",
    desc: "Familienstiftung mit Administration, persönliche Interessen relevant",
    approach: "Persönliche Beziehung aufbauen, Story erzählen, Werte teilen"
  },
  C: {
    short: "C",
    long: "Kleine Familienstiftung",
    desc: "Kleines Gremium (3-5 Personen), emotionale Entscheide, direkte Bewerbung",
    approach: "Direkter Kontakt, emotionaler Appeal, kurze prägnante Anfrage"
  },
  D: {
    short: "D",
    long: "Corporate Foundation",
    desc: "Professionell aber weniger transparent, normbasierte Prozesse",
    approach: "Alignment mit Unternehmenszielen zeigen, CSR-Sprache verwenden"
  },
  network: {
    short: "N",
    long: "Netzwerk",
    desc: "Netzwerk/Verband - keine direkte Förderung",
    approach: "Mitgliedschaft für Sichtbarkeit und Partnerschaften"
  }
};

// ============================================================================
// STATUS LABELS
// ============================================================================
const STATUS_LABELS = {
  open: { text: "Offen", class: "open", desc: "Bewerbungen werden angenommen" },
  closed: { text: "Geschlossen", class: "closed", desc: "Aktuell keine Bewerbungen möglich" },
  soon: { text: "Öffnet bald", class: "soon", desc: "Bewerbungsportal öffnet demnächst" },
  rolling: { text: "Laufend", class: "rolling", desc: "Jederzeit bewerbbar" }
};

// ============================================================================
// EXPORT
// ============================================================================
if (typeof window !== 'undefined') {
  window.STIFTUNGEN_DATA = STIFTUNGEN_DATA;
  window.NOT_RECOMMENDED = NOT_RECOMMENDED;
  window.DATABASES = DATABASES;
  window.TYPE_LABELS = TYPE_LABELS;
  window.STATUS_LABELS = STATUS_LABELS;
  window.THEMES = THEMES;
  window.SOURCES = SOURCES;
}
