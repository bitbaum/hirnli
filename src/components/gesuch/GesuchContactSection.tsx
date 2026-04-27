import type { CoreFacts } from '@/lib/schemas/story';
import { ORG_PROFILE } from '@/lib/config/org-profile';

interface GesuchContactSectionProps {
  foundationName: string;
  organization: CoreFacts;
}

export default function GesuchContactSection({ foundationName, organization }: GesuchContactSectionProps) {
  const websiteUrl = `https://${organization.organization.website.replace('https://', '')}`;

  return (
    <section className="rounded-2xl bg-bg-light p-4 text-center md:p-8">
      <h2 className="mb-4 text-xl font-bold text-grey-dark md:text-2xl">Lassen Sie uns ins Gespräch kommen</h2>
      <p className="mb-6 text-text-light">
        Wir freuen uns auf einen Austausch darüber, wie {ORG_PROFILE.name} und {foundationName} gemeinsam wirken können.
      </p>
      <div className="mb-6 space-y-1 text-sm text-text-light">
        <p className="font-semibold text-grey-dark">{organization.organization.name}</p>
        <p>{organization.organization.address}</p>
        <p>
          <a href={websiteUrl} className="text-primary hover:underline">
            {organization.organization.website}
          </a>
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-sm text-text-muted">
        {organization.unique.map((u) => (
          <span key={u} className="rounded-full bg-white px-3 py-1.5">{u}</span>
        ))}
      </div>
    </section>
  );
}
