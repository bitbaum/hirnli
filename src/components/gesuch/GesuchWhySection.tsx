import type { WhySection } from '@/lib/schemas/story';
import type { ThemeKey } from '@/lib/config/stories';
import Card from '@/components/ui/Card';

interface GesuchWhySectionProps {
  why: WhySection;
  secondaryThemeRelevance?: { theme: ThemeKey; label: string; connection: string }[];
}

export default function GesuchWhySection({ why, secondaryThemeRelevance }: GesuchWhySectionProps) {
  return (
    <section>
      <h2 className="mb-6 heading-page">
        {why.headline}
      </h2>
      <p className="mb-8 text-base leading-relaxed text-text-light md:text-lg">
        {why.hook}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="mb-3 heading-card text-danger">Das Problem</h3>
          <p className="text-sm leading-relaxed text-text-light">
            {why.problem}
          </p>
        </Card>
        <Card>
          <h3 className="mb-3 heading-card text-secondary">Unsere Lösung</h3>
          <p className="text-sm leading-relaxed text-text-light">
            {why.solution}
          </p>
        </Card>
      </div>

      {secondaryThemeRelevance && secondaryThemeRelevance.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 heading-card">
            Weitere relevante Schwerpunkte
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {secondaryThemeRelevance.map((item) => (
              <div
                key={item.theme}
                className="rounded-lg border border-border bg-bg-light p-4"
              >
                <span className="heading-detail text-primary">{item.label}</span>
                <p className="mt-1 text-sm leading-relaxed text-text-light">
                  {item.connection}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
