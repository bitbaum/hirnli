import { BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY, PEOPLE_REACHED_PER_YEAR } from '@/lib/config/projections';

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
          Unsere <strong>2× Bildungsprogrammleiter:innen</strong> bilden Techniker und Entwickler aus
          und führen Workshops durch. Strukturiertes Training statt informellem Wissenstransfer.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
            <div className="text-3xl font-bold">2 VZÄ</div>
            <div className="text-sm opacity-90">Bildungsprogrammleiter:innen</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
            <div className="text-3xl font-bold">{BPL_DIRECT_TRAINED_PER_YEAR_DISPLAY}</div>
            <div className="text-sm opacity-90">Direkt trainiert/Jahr</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 text-center backdrop-blur">
            <div className="text-3xl font-bold">{PEOPLE_REACHED_PER_YEAR}</div>
            <div className="text-sm opacity-90">Mit Workshops erreicht/Jahr</div>
          </div>
        </div>
      </div>
    </section>
  );
}
