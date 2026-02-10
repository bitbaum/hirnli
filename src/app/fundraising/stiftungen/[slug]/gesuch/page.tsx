import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { THEMES } from '@/lib/config/foundations';
import { getFoundationBySlug, generateFoundationParams } from '@/lib/domain/foundation-helpers';
import { composeGesuch } from '@/lib/domain/gesuch-composer';
import Card from '@/components/ui/Card';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return generateFoundationParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: `Gesuch — Revamp-IT × ${foundation.name}`,
    description: `Personalisiertes Gesuch für ${foundation.name}`,
  };
}

export default async function GesuchPage({ params }: Props) {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);

  if (!foundation) {
    notFound();
  }

  const gesuch = composeGesuch(foundation);

  // Not-ready fallback
  if (!gesuch.ready) {
    return (
      <div className="gesuch-page mx-auto max-w-4xl py-12">
        <Card className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-grey-dark">
            Gesuch für {gesuch.foundation.name}
          </h1>
          <p className="mb-6 text-text-light">{gesuch.readyReason}</p>
          <Link
            href={`/fundraising/stiftungen/${slug}`}
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-light"
          >
            Zurück zur Stiftungsseite
          </Link>
        </Card>
      </div>
    );
  }

  // Determine primary theme color for hero gradient
  const primaryThemeId = foundation.themes[0];
  const primaryColor = primaryThemeId ? THEMES[primaryThemeId]?.color ?? '#3498DB' : '#3498DB';

  return (
    <div className="gesuch-page">
      {/* Section 1: Hero */}
      <section
        className="rounded-2xl px-8 py-16 text-white"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}88, #2C3E50)`,
        }}
      >
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
            Partnerschaftsvorschlag
          </p>
          <h1 className="mb-4 text-4xl font-bold">
            Revamp-IT × {gesuch.foundation.name}
          </h1>
          {gesuch.foundation.purposeSummary && (
            <p className="mb-6 max-w-2xl text-lg text-white/90">
              {gesuch.foundation.purposeSummary}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {gesuch.themes.all.map((theme) => (
              <span
                key={theme.id}
                className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium"
              >
                {theme.icon} {theme.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-12 py-12">
        {/* Section 2: WHY */}
        {gesuch.story.why && (
          <section>
            <h2 className="mb-6 text-3xl font-bold text-grey-dark">
              {gesuch.story.why.headline}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-text-light">
              {gesuch.story.why.hook}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <h3 className="mb-3 text-lg font-semibold text-danger">Das Problem</h3>
                <p className="text-sm leading-relaxed text-text-light">
                  {gesuch.story.why.problem}
                </p>
              </Card>
              <Card>
                <h3 className="mb-3 text-lg font-semibold text-secondary">Unsere Lösung</h3>
                <p className="text-sm leading-relaxed text-text-light">
                  {gesuch.story.why.solution}
                </p>
              </Card>
            </div>
          </section>
        )}

        {/* Section 3: HOW */}
        <section>
          <h2 className="mb-6 text-3xl font-bold text-grey-dark">
            {gesuch.story.how.track_record.headline}
          </h2>
          <p className="mb-6 text-lg leading-relaxed text-text-light">
            {gesuch.story.how.track_record.text}
          </p>

          {/* Proof Points */}
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {gesuch.story.how.track_record.proof_points.map((point) => (
              <Card key={point.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{point.value}</p>
                <p className="text-xs text-text-muted">{point.label}</p>
              </Card>
            ))}
          </div>

          {/* Competencies */}
          <div className="grid gap-6 md:grid-cols-2">
            {gesuch.story.how.competencies.map((comp) => (
              <Card key={comp.headline}>
                <h3 className="mb-3 text-lg font-semibold text-grey-dark">{comp.headline}</h3>
                <ul className="space-y-1">
                  {comp.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2 text-sm text-text-light">
                      <span className="mt-0.5 text-secondary">&#10003;</span>
                      {cap}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 4: WHAT — Projects */}
        {gesuch.story.projects.length > 0 && (
          <section>
            <h2 className="mb-6 text-3xl font-bold text-grey-dark">Unsere Projekte</h2>
            <div className="space-y-6">
              {gesuch.story.projects.map((project) => (
                <Card key={project.title}>
                  <h3 className="mb-1 text-xl font-bold text-grey-dark">{project.title}</h3>
                  <p className="mb-4 text-sm text-text-muted">{project.subtitle}</p>
                  <p className="mb-6 text-sm leading-relaxed text-text-light">{project.summary}</p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                        Ziele
                      </h4>
                      <ul className="space-y-1">
                        {project.goals.map((g) => (
                          <li key={g} className="text-sm text-text-light">• {g}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">
                        Aktivitäten
                      </h4>
                      <ul className="space-y-1">
                        {project.activities.map((a) => (
                          <li key={a} className="text-sm text-text-light">• {a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                        Wirkung
                      </h4>
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
        )}

        {/* Section 5: Evidence */}
        {gesuch.story.evidence.length > 0 && (
          <section>
            <h2 className="mb-6 text-3xl font-bold text-grey-dark">Wissenschaftliche Grundlagen</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {gesuch.story.evidence.map((ev) => (
                <Card key={ev.title} className="bg-bg-light">
                  <p className="mb-2 text-sm font-semibold text-grey-dark">
                    {ev.title} ({ev.year})
                  </p>
                  <p className="mb-3 text-sm text-text-light">{ev.claim}</p>
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Quelle ansehen
                  </a>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Contact CTA */}
        <section className="rounded-2xl bg-bg-light p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-grey-dark">Lassen Sie uns ins Gespräch kommen</h2>
          <p className="mb-6 text-text-light">
            Wir freuen uns auf einen Austausch darüber, wie Revamp-IT und {gesuch.foundation.name} gemeinsam wirken können.
          </p>
          <div className="mb-6 space-y-1 text-sm text-text-light">
            <p className="font-semibold text-grey-dark">{gesuch.organization.organization.name}</p>
            <p>{gesuch.organization.organization.address}</p>
            <p>
              <a href={`https://${gesuch.organization.organization.website.replace('https://', '')}`} className="text-primary hover:underline">
                {gesuch.organization.organization.website}
              </a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-text-muted">
            {gesuch.organization.unique.map((u) => (
              <span key={u} className="rounded-full bg-white px-3 py-1">{u}</span>
            ))}
          </div>
        </section>

        {/* Navigation links — hidden in print */}
        <div className="flex justify-center gap-6 print:hidden">
          <Link
            href={`/fundraising/stiftungen/${slug}/gesuch/dokument`}
            className="rounded-lg bg-grey-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-grey-dark/90"
          >
            Formelles Gesuch-Dokument (PDF)
          </Link>
          <Link
            href={`/fundraising/stiftungen/${slug}`}
            className="text-sm text-primary hover:underline leading-10"
          >
            &larr; Zurück zur Stiftungsseite
          </Link>
        </div>
      </div>
    </div>
  );
}
