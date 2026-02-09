export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: 'Management' | 'Tech' | 'Operations';
  capacity?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  // Management
  { id: 'PER-0001', name: 'Andreas', role: 'Founder & General Manager', department: 'Management' },
  { id: 'PER-0002', name: 'Daniel', role: 'Operations & Business Lead', department: 'Management' },
  { id: 'PER-0003', name: 'Veronica', role: 'HR & Social Responsibility', department: 'Management' },
  // Tech
  { id: 'PER-0004', name: 'Cem', role: 'Kivitendo & Engineering', department: 'Tech' },
  { id: 'PER-0005', name: 'Georgie', role: 'Systems Development & Strategy Support', department: 'Tech', capacity: '60%' },
  { id: 'PER-0006', name: 'Michael', role: 'Engineer', department: 'Tech' },
  { id: 'PER-0007', name: 'Mike', role: 'Open Source & Linux Specialist', department: 'Tech' },
  { id: 'PER-0008', name: 'Reza', role: 'Senior Repair Technician', department: 'Tech' },
  { id: 'PER-0009', name: 'Romeo', role: 'Repair Technician', department: 'Tech' },
  { id: 'PER-0010', name: 'Sili', role: 'Kivitendo & Engineering', department: 'Tech' },
  { id: 'PER-0011', name: 'Simeon', role: 'Engineer', department: 'Tech' },
  { id: 'PER-0012', name: 'Winchester', role: '3D Modeling Specialist', department: 'Tech' },
  // Operations
  { id: 'PER-0013', name: 'Heinz', role: 'Device Intake & Support', department: 'Operations' },
];

export const DEPARTMENTS = [
  { name: 'Management', icon: '👔', color: 'from-violet-500 to-purple-500', borderColor: 'border-l-violet-500' },
  { name: 'Tech', icon: '🔧', color: 'from-blue-500 to-indigo-500', borderColor: 'border-l-blue-500' },
  { name: 'Operations', icon: '📦', color: 'from-emerald-500 to-green-600', borderColor: 'border-l-emerald-500' },
] as const;

export const LOCATIONS = [
  { icon: '🏪', title: 'Hauptsitz & Verkauf', address: 'Birmensdorferstrasse 379, 8055 Zürich' },
  { icon: '🏭', title: 'Lager & Werkstatt', address: 'Badenerstrasse 816, 8048 Zürich' },
] as const;

export const MISSING_DATA = [
  { title: 'Kapazität & FTE', description: 'Arbeitspensum und Vollzeitäquivalente werden nicht systematisch erfasst.', detail: 'Nur Georgie (60%) hat einen Wert in HR_Roster.csv.' },
  { title: 'Auslastung & Bottlenecks', description: 'Es gibt keine Daten zur aktuellen Auslastung oder zu Engpässen im Team.' },
  { title: 'Praktikanten & Freiwillige', description: 'Das erweiterte Team (Arbeitsintegration, Freiwillige) wird nicht in HR_Roster.csv erfasst.' },
  { title: 'Skills & Kompetenzen', description: 'Die Spalte "skills" in HR_Roster.csv ist leer.' },
] as const;

export const HR_COLUMNS = [
  { field: 'id', description: 'Eindeutige ID (PER-0001, etc.)' },
  { field: 'name', description: 'Vorname' },
  { field: 'role', description: 'Funktion/Titel' },
  { field: 'department', description: 'Abteilung' },
  { field: 'capacity_pct', description: 'Arbeitspensum (meist leer)' },
  { field: 'skills', description: 'Kompetenzen (leer)' },
  { field: 'cost_rate_chf_per_hour', description: 'Stundensatz (leer)' },
  { field: 'status', description: 'Anstellungsstatus (leer)' },
  { field: 'profile_path', description: 'Link zu Profil-Datei' },
] as const;
