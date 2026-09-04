import type { Metadata } from 'next';
import CTABanner from '@/components/ui/CTABanner';
import StoryBridge from '@/components/layout/StoryBridge';
import { getStoryBridges } from '@/lib/config/story-bridges';
import { pageMeta, CTA_CONFIG } from './home-data';
import { getTenant } from '@/lib/tenant/resolve';
import { HeroSection, PlatformGuide, PillarGrid, TransparencyBlock } from './home-components';

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = pageMeta(await getTenant());
  return { title, description };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PlatformGuide />
      <PillarGrid />
      <TransparencyBlock />

      <section className="mb-12">
        <CTABanner
          title={CTA_CONFIG.title}
          description={CTA_CONFIG.description}
          headingLevel="h2"
          links={CTA_CONFIG.links}
        />
      </section>

      <StoryBridge bridges={getStoryBridges('dashboard')} />
    </>
  );
}
