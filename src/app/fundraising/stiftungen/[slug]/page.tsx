import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getFoundationBySlug, generateFoundationParams } from '@/lib/domain/foundation-helpers';
import FoundationHeader from '@/components/foundation/FoundationHeader';
import FoundationSidebar from '@/components/foundation/FoundationSidebar';
import FitAnalysis from '@/components/foundation/FitAnalysis';
import FoundationDetailTabs from './FoundationDetailTabs';

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
    title: foundation.name,
    description: foundation.tagline,
  };
}

export default async function FoundationDetailPage({ params }: Props) {
  const { slug } = await params;
  const foundation = getFoundationBySlug(slug);

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
