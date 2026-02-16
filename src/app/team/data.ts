export interface TeamMember {
  id: string;
  name: string;
  fachgebiete: string[];
  bereich: 'Leitung' | 'Technik' | 'Betrieb';
  capacity?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  // Leitung
  { id: 'PER-0001', name: 'Andreas', fachgebiete: ['Geschäftsführung', 'Strategie'], bereich: 'Leitung' },
  { id: 'PER-0002', name: 'Daniel', fachgebiete: ['Elektrotechnik', 'Software Engineering', 'Betrieb'], bereich: 'Leitung' },
  { id: 'PER-0003', name: 'Veronica', fachgebiete: ['Sozialpädagogik', 'HR', 'Fundraising'], bereich: 'Leitung' },
  // Technik
  { id: 'PER-0004', name: 'Cem', fachgebiete: ['Software Engineering', 'Kivitendo'], bereich: 'Technik' },
  { id: 'PER-0005', name: 'Georgie', fachgebiete: ['Software Engineering', 'Fundraising', 'Betrieb', 'Systementwicklung'], bereich: 'Technik', capacity: '60%' },
  { id: 'PER-0006', name: 'Michael', fachgebiete: ['Technik'], bereich: 'Technik' }, // Vero ergänzt
  { id: 'PER-0007', name: 'Mike', fachgebiete: ['Open Source', 'Linux'], bereich: 'Technik' },
  { id: 'PER-0008', name: 'Reza', fachgebiete: ['Reparatur', 'Technik'], bereich: 'Technik' },
  { id: 'PER-0009', name: 'Romeo', fachgebiete: ['Reparatur'], bereich: 'Technik' },
  { id: 'PER-0010', name: 'Sili', fachgebiete: ['Reparatur', 'Software Engineering', 'Kivitendo'], bereich: 'Technik' },
  { id: 'PER-0011', name: 'Simeon', fachgebiete: ['Technik'], bereich: 'Technik' }, // Vero ergänzt
  { id: 'PER-0012', name: 'Winchester', fachgebiete: ['3D-Modellierung'], bereich: 'Technik' }, // Vero ergänzt
  // Betrieb
  { id: 'PER-0013', name: 'Heinz', fachgebiete: ['Betrieb', 'Geräte-Annahme'], bereich: 'Betrieb' },
  { id: 'PER-0014', name: 'Bruno', fachgebiete: ['Betrieb'], bereich: 'Betrieb' }, // Vero ergänzt
];

export const DEPARTMENTS = [
  { name: 'Leitung', icon: '👔', color: 'from-violet-500 to-purple-500', borderColor: 'border-l-violet-500' },
  { name: 'Technik', icon: '🔧', color: 'from-blue-500 to-indigo-500', borderColor: 'border-l-blue-500' },
  { name: 'Betrieb', icon: '📦', color: 'from-emerald-500 to-green-600', borderColor: 'border-l-emerald-500' },
] as const;
