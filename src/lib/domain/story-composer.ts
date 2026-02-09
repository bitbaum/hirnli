import type { WhySection, Project, Evidence } from '../schemas/story';

export interface ComposedStory {
  why: WhySection;
  how: {
    track_record: { headline: string; proof_points: Record<string, string | number> };
    competencies: Array<{ headline: string; capabilities: string[] }>;
  };
  projects: Project[];
  evidence: Evidence[];
}

/**
 * Compose a full grant application story for a given theme combination.
 * Import WHY, HOW, PROJECTS, EVIDENCE from config/stories.ts to use this.
 */
export function composeStory(
  primaryTheme: string,
  why: Record<string, WhySection>,
  how: Record<string, { headline: string; capabilities: string[]; partners?: string[] }>,
  howTrackRecord: { headline: string; proof_points: Record<string, string | number> },
  projects: Record<string, Project>,
  evidence: Record<string, Record<string, Evidence>>,
  secondaryThemes: string[] = [],
): ComposedStory {
  // Get primary WHY
  const primaryWhy = why[primaryTheme] || why['klima'];

  // Collect competencies
  const competencies = Object.entries(how)
    .filter(([key]) => key !== 'track_record')
    .map(([, section]) => section);

  // Get matching projects
  const allThemes = [primaryTheme, ...secondaryThemes];
  const matchingProjects = Object.values(projects).filter((p) =>
    p.themes.some((t) => allThemes.includes(t)),
  );

  // Collect evidence
  const evidenceRefs = primaryWhy.evidence || [];
  const collectedEvidence: Evidence[] = [];
  for (const ref of evidenceRefs) {
    for (const category of Object.values(evidence)) {
      if (category[ref]) {
        collectedEvidence.push(category[ref]);
      }
    }
  }

  return {
    why: primaryWhy,
    how: {
      track_record: howTrackRecord,
      competencies,
    },
    projects: matchingProjects,
    evidence: collectedEvidence,
  };
}
