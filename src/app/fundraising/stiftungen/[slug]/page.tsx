import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { STIFTUNGEN_DATA } from '@/lib/config/foundations';
import FoundationHeader from '@/components/foundation/FoundationHeader';
import FoundationSidebar from '@/components/foundation/FoundationSidebar';
import FitAnalysis from '@/components/foundation/FitAnalysis';
import FoundationDetailTabs from './FoundationDetailTabs';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate all slugs at build time
export async function generateStaticParams() {
  return STIFTUNGEN_DATA.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const foundation = STIFTUNGEN_DATA.find((f) => f.slug === slug);
  if (!foundation) return { title: 'Stiftung nicht gefunden' };
  return {
    title: foundation.name,
    description: foundation.tagline,
  };
}

export default async function FoundationDetailPage({ params }: Props) {
  const { slug } = await params;
  const foundation = STIFTUNGEN_DATA.find((f) => f.slug === slug);

  if (!foundation) {
    notFound();
  }

  return (
    <div>
      <FoundationHeader foundation={foundation} />

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <FoundationDetailTabs foundation={foundation} />
        </div>
        <aside>
          <FoundationSidebar foundation={foundation} />
        </aside>
      </div>
    </div>
  );
}
