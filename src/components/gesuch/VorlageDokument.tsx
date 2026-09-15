import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ComposedGesuchDokument } from '@/lib/domain/gesuch-composer';
import {
  AnschreibenSection,
  ProjektbeschriebSection,
  BudgetSection,
  KurzportraitSection,
} from '@/components/gesuch/sections';
import { VorlageBanner, PrintTipBanner } from '@/components/gesuch/GesuchDocumentBanners';

/**
 * The printable Gesuch-Vorlage: banner, print bar, the four formal sections,
 * back link.
 *
 * Both dokument routes — `[vorlage]/dokument` and `[vorlage]/[type]/dokument`
 * — printed exactly this, in this order. What is printed is the document a
 * funder receives, so two copies of it is the one place where drift is not a
 * tidiness problem: a section added to one page and not the other means two
 * different grant applications leaving the same product.
 *
 * The `dok.ready` check stays in the routes, where
 * every-gesuch-caller-checks-ready.test.ts can see it on the file that
 * composed the document.
 */
export default function VorlageDokument({
  dok,
  bannerTitle,
  bannerNote,
  interaktiveHref,
}: {
  dok: ComposedGesuchDokument;
  bannerTitle: string;
  /** The sentence under the banner heading — worded per template family. */
  bannerNote: ReactNode;
  /** The on-screen version of this same template. */
  interaktiveHref: string;
}) {
  return (
    <div className="gesuch-dokument mx-auto max-w-3xl">
      <div className="mb-8 space-y-3 print:hidden">
        <VorlageBanner title={bannerTitle}>{bannerNote}</VorlageBanner>
        <PrintTipBanner>
          <Link href={interaktiveHref} className="text-primary hover:underline">
            Interaktive Seite
          </Link>
          <Link href="/fundraising/gesuch-vorlagen" className="text-primary hover:underline">
            Alle Vorlagen
          </Link>
        </PrintTipBanner>
      </div>

      <AnschreibenSection dok={dok} />
      <ProjektbeschriebSection dok={dok} />
      <BudgetSection dok={dok} />
      <KurzportraitSection dok={dok} />

      <div className="pb-12 text-center print:hidden">
        <Link href={interaktiveHref} className="text-sm text-primary hover:underline">
          &larr; Zurück zur interaktiven Vorlage
        </Link>
      </div>
    </div>
  );
}
