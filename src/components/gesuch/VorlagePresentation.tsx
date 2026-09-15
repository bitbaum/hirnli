import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import type { Tenant } from '@/lib/tenant/profile';
import {
  GesuchHeroSection,
  GesuchWhySection,
  GesuchHowSection,
  GesuchProjectsSection,
  GesuchEvidenceSection,
  GesuchContactSection,
} from '@/components/gesuch/sections';
import { VorlageBanner } from '@/components/gesuch/GesuchDocumentBanners';

/**
 * What a Gesuch-Vorlage looks like on screen.
 *
 * Both template routes — `[vorlage]` and `[vorlage]/[type]` — rendered the
 * same page: the VORLAGE banner, the hero, the five story sections in one
 * order, and the two links out. They differ only in how the banner and hero
 * are worded, because one is keyed by document type and the other by
 * Schwerpunkt × type. Keeping two copies meant a section added to a template
 * appeared on one of them and quietly not the other.
 *
 * Deliberately NOT here: the `gesuch.ready` check. It stays in the routes,
 * where `every-gesuch-caller-checks-ready.test.ts` can see that whoever
 * composed a Gesuch also asked whether it may be sent — a guard that reads
 * the composing file, not its callee.
 */
export default function VorlagePresentation({
  tenant,
  gesuch,
  primaryColor,
  bannerTitle,
  bannerNote,
  heroSubtitle,
  heroDescription,
  dokumentHref,
}: {
  tenant: Tenant;
  gesuch: ComposedGesuch;
  primaryColor: string;
  bannerTitle: string;
  /** The sentence under the banner heading — worded per template family. */
  bannerNote: ReactNode;
  heroSubtitle: string;
  heroDescription: string;
  dokumentHref: string;
}) {
  return (
    <div className="gesuch-page">
      <VorlageBanner title={bannerTitle} className="mb-4 print:hidden">
        {bannerNote}
      </VorlageBanner>

      <GesuchHeroSection
        orgName={tenant.name}
        subtitle={heroSubtitle}
        foundationName={gesuch.foundation.name}
        description={heroDescription}
        themes={gesuch.themes.all}
        primaryColor={primaryColor}
      />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 md:px-0">
        {gesuch.story.why && <GesuchWhySection why={gesuch.story.why} />}

        <GesuchHowSection
          trackRecord={gesuch.story.how.track_record}
          competencies={gesuch.story.how.competencies}
        />

        <GesuchProjectsSection projects={gesuch.story.projects} />

        <GesuchEvidenceSection evidence={gesuch.story.evidence} />

        <GesuchContactSection
          orgName={tenant.name}
          foundationName="Ihre Stiftung"
          organization={gesuch.organization}
        />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6 print:hidden">
          <Button href={dokumentHref} size="lg">
            Formelles Gesuch-Dokument (PDF)
          </Button>
          <Link
            href="/fundraising/gesuch-vorlagen"
            className="py-3 text-sm text-primary hover:underline"
          >
            &larr; Alle Vorlagen
          </Link>
        </div>
      </div>
    </div>
  );
}
