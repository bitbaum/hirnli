import type { WhySection } from '@/lib/schemas/story';
import Card from '@/components/ui/Card';

interface GesuchWhySectionProps {
  why: WhySection;
}

export default function GesuchWhySection({ why }: GesuchWhySectionProps) {
  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-grey-dark md:text-3xl">
        {why.headline}
      </h2>
      <p className="mb-8 text-base leading-relaxed text-text-light md:text-lg">
        {why.hook}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-danger">Das Problem</h3>
          <p className="text-sm leading-relaxed text-text-light">
            {why.problem}
          </p>
        </Card>
        <Card>
          <h3 className="mb-3 text-lg font-semibold text-secondary">Unsere Lösung</h3>
          <p className="text-sm leading-relaxed text-text-light">
            {why.solution}
          </p>
        </Card>
      </div>
    </section>
  );
}
