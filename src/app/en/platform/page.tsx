import type { Metadata } from 'next';
import PlatformPageView from '@/components/platform/PlatformPageView';
import { PLATFORM_CONTENT } from '@/lib/config/platform-content';

export const metadata: Metadata = {
  title: PLATFORM_CONTENT.en.meta.title,
  description: PLATFORM_CONTENT.en.meta.description,
  openGraph: {
    title: PLATFORM_CONTENT.en.meta.title,
    description: PLATFORM_CONTENT.en.meta.description,
  },
};

export default function PlatformPageEn() {
  return <PlatformPageView locale="en" />;
}
