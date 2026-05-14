import { BILDUNGSPROGRAMMLEITER } from '@/lib/config/team';
import { BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY, PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';

const HERO_STATS = [
  { value: `${BILDUNGSPROGRAMMLEITER.length} VZÄ`, label: 'Bildungsprogrammleiter:innen' },
  { value: BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY, label: 'Direkt trainiert/Jahr' },
  { value: PEOPLE_REACHED_PER_YEAR, label: 'Mit Workshops erreicht/Jahr' },
];

export default function TrainTheTrainerVisionSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Die Lösung: Train-the-Trainer</h2>
      <div className="rounded-xl gradient-hero-bildung p-8 text-white mb-6">
        <div className="text-center mb-6">
          <div className="text-6xl font-bold mb-2">{PEOPLE_REACHED_PER_YEAR}</div>
          <div className="text-xl opacity-90">
            Menschen/Jahr direkt erreicht durch strukturiertes Training + Workshops
          </div>
        </div>
        <p className="text-lg mb-4 leading-relaxed text-center max-w-3xl mx-auto">
          Unsere <strong>{BILDUNGSPROGRAMMLEITER.length}× Bildungsprogrammleiter:innen</strong> bilden Techniker und Entwickler aus
          und führen Workshops durch. Strukturiertes Training statt informellem Wissenstransfer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
              <div className="heading-stat text-white">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
