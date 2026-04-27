import type { Evidence } from '@/lib/schemas/story';
import Card from '@/components/ui/Card';

interface GesuchEvidenceSectionProps {
  evidence: Evidence[];
}

export default function GesuchEvidenceSection({ evidence }: GesuchEvidenceSectionProps) {
  if (evidence.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-grey-dark md:text-3xl">Wissenschaftliche Grundlagen</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {evidence.map((ev) => (
          <Card key={ev.title} className="bg-bg-light">
            <p className="mb-2 text-sm font-semibold text-grey-dark">
              {ev.title} ({ev.year})
            </p>
            <p className="mb-3 text-sm text-text-light">{ev.claim}</p>
            <a
              href={ev.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Quelle ansehen
            </a>
          </Card>
        ))}
      </div>
    </section>
  );
}
