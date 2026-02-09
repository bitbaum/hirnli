/* ────────────────────────────────────────────
   Static data for the Operations page
   ──────────────────────────────────────────── */

export const PROCESS_STEPS = [
  { number: 1, name: 'INTAKE', active: false },
  { number: 2, name: 'TRIAGE', active: false },
  { number: 3, name: 'LÖSCHUNG', active: false },
  { number: 4, name: 'REINIGUNG', active: false },
  { number: 5, name: 'UPGRADE', active: false },
  { number: 6, name: 'LINUX', active: true },
  { number: 7, name: 'QA', active: false },
  { number: 8, name: 'VERKAUF', active: false },
] as const;

export const INTAKE_CHECKLIST = [
  'Gerät entgegennehmen',
  'Spendenbestätigung ausstellen (falls gewünscht)',
  'Kurze Sichtprüfung: Offensichtliche Schäden?',
  'Intake-Nummer vergeben: JJJJ-MM-NNN',
  'Etikette mit Intake-Nummer anbringen',
  'In Intake-Log eintragen',
] as const;

export type IntakeField = { field: string; example: string };

export const INTAKE_FIELDS: IntakeField[] = [
  { field: 'Datum', example: '2025-11-15' },
  { field: 'Intake-Nummer', example: '2025-11-042' },
  { field: 'Gerätetyp', example: 'Laptop' },
  { field: 'Marke/Modell', example: 'Lenovo ThinkPad T480' },
  { field: 'Spender', example: '(optional)' },
  { field: 'Zustand', example: 'Gut / Mittel / Schlecht' },
];

export const VISUAL_INSPECTION = [
  'Gehäuse-Zustand',
  'Display (bei Laptops/Monitors)',
  'Anschlüsse',
  'Tastatur/Trackpad',
] as const;

export const COMPONENT_CHECK = [
  'RAM-Typ & -Grösse',
  'Festplatte/SSD',
  'Prozessor (CPU)',
  'Grafikkarte (falls diskret)',
] as const;

export const HARDWARE_TESTS = [
  'BIOS-Zugang testen',
  'Boot-Test (von USB-Stick)',
  'RAM-Test (MemTest86+)',
  'Festplatten-Test (S.M.A.R.T.)',
  'Display-Test (Pixelfehler)',
  'Tastatur-Test',
  'WiFi/Bluetooth',
  'Akku-Test (bei Laptops)',
] as const;

export const CATEGORIES = [
  { label: 'Kategorie A', color: 'bg-emerald-100 text-emerald-800', title: 'Ready for Refurbishment', description: 'Voll funktionsfähig' },
  { label: 'Kategorie B', color: 'bg-amber-100 text-amber-800', title: 'Repair Needed', description: 'Kleine Reparaturen' },
  { label: 'Kategorie C', color: 'bg-blue-100 text-blue-800', title: 'Parts Only', description: 'Ersatzteillager' },
  { label: 'Kategorie D', color: 'bg-red-100 text-red-800', title: 'E-Waste', description: 'Fachgerecht recyceln' },
] as const;

export const DATA_WIPE_OPTIONS = [
  {
    title: 'Option A: DBAN',
    subtitle: "Darik's Boot and Nuke",
    steps: ['Von DBAN-USB booten', 'DoD Short (3 Pässe) auswählen', 'Löschen starten', 'Protokoll speichern'],
    duration: '2-8 Stunden (passiv)',
  },
  {
    title: 'Option B: ATA Secure Erase',
    subtitle: 'Linux-basiert',
    steps: ['Von Linux Live-System booten', 'hdparm --security-erase', 'Verifizieren'],
    duration: '1-2 Stunden',
  },
  {
    title: 'Option C: Physikalisch',
    subtitle: 'Bei defekten Platten',
    steps: ['Festplatte entfernen', 'Mit Bohrmaschine Löcher bohren', 'Als E-Waste markieren'],
    duration: '5 Minuten',
  },
] as const;

export const CLEANING_EXTERNAL = [
  'Gehäuse abwischen (Isopropanol)',
  'Tastatur reinigen',
  'Display reinigen',
  'Anschlüsse ausblasen',
] as const;

export const CLEANING_INTERNAL = [
  'Lüfter ausblasen',
  'Kühlrippen reinigen',
  'Wärmeleitpaste erneuern',
] as const;

export const LINUX_DISTROS = [
  { target: 'Anfänger', distro: 'Linux Mint' },
  { target: 'Leichtgewichtig', distro: 'Lubuntu/Xubuntu' },
  { target: 'Power-User', distro: 'Debian/Fedora' },
  { target: 'Spezial', distro: 'Nach Kundenwunsch' },
] as const;

export const QA_TESTS = [
  'System bootet korrekt',
  'Display funktioniert',
  'Tastatur funktioniert',
  'Trackpad/Maus funktioniert',
  'WiFi verbindet',
  'Sound funktioniert',
  'USB-Ports funktionieren',
  'Webcam (falls vorhanden)',
  'Software installiert & funktioniert',
  'Keine Fehlermeldungen',
  'Performance akzeptabel',
] as const;

export const QA_COSMETIC = [
  'Gerät sauber',
  'Keine losen Teile',
  'Display ohne Kratzer',
  'Tastatur vollständig',
] as const;

export type TimeRow = { step: string; duration: string; type: string };

export const TIME_DATA: TimeRow[] = [
  { step: '1. Intake', duration: '5-10 Min', type: 'Aktiv' },
  { step: '2. Triage & Testing', duration: '25-45 Min', type: 'Aktiv' },
  { step: '3. Datenlöschung', duration: '2-8 Stunden', type: 'Passiv' },
  { step: '4. Reinigung', duration: '15-30 Min', type: 'Aktiv' },
  { step: '5. Hardware-Upgrade', duration: '10-30 Min', type: 'Aktiv' },
  { step: '6. Linux-Installation', duration: '35-50 Min', type: 'Semi-Aktiv' },
  { step: '7. Qualitätskontrolle', duration: '10-15 Min', type: 'Aktiv' },
  { step: '8. Pricing & Listing', duration: '15-20 Min', type: 'Aktiv' },
];

export const TOOLS = [
  {
    icon: '🔧',
    title: 'Werkzeuge',
    items: ['Schraubendreher-Set (Kreuz, Torx)', 'Antistatik-Armband', 'Multimeter', 'USB-Sticks (Boot-Tools)', 'Etiketten-Drucker'],
  },
  {
    icon: '🧴',
    title: 'Verbrauchsmaterial',
    items: ['Isopropanol', 'Mikrofaser-Tücher', 'Druckluft-Dosen', 'Bubble-Wrap', 'Versand-Kartons', 'Etiketten'],
  },
  {
    icon: '💾',
    title: 'Software',
    items: ['MemTest86+', 'DBAN', 'Linux Mint ISO', 'GParted', 'hwinfo'],
  },
] as const;
