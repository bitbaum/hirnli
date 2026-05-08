import type { Project } from '@/lib/schemas/story';
import Card from '@/components/ui/Card';

interface GesuchProjectsSectionProps {
  projects: Project[];
}

export default function GesuchProjectsSection({ projects }: GesuchProjectsSectionProps) {
  if (projects.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 heading-page">Unsere Projekte</h2>
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.title}>
            <h3 className="mb-1 text-lg font-bold text-grey-dark md:text-xl">{project.title}</h3>
            <p className="mb-4 text-sm text-text-muted">{project.subtitle}</p>
            <p className="mb-6 text-sm leading-relaxed text-text-light">{project.summary}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="mb-2 heading-xs-label text-primary">Ziele</h4>
                <ul className="space-y-1">
                  {project.goals.map((g) => (
                    <li key={g} className="text-sm text-text-light">• {g}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 heading-xs-label text-accent">Aktivitäten</h4>
                <ul className="space-y-1">
                  {project.activities.map((a) => (
                    <li key={a} className="text-sm text-text-light">• {a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 heading-xs-label text-secondary">Wirkung</h4>
                <ul className="space-y-1">
                  {project.outcomes.map((o) => (
                    <li key={o} className="text-sm text-text-light">• {o}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
