import type { Metadata } from 'next';
import PlatformPageView from '@/components/platform/PlatformPageView';
import { PLATFORM_CONTENT } from '@/lib/config/platform-content';

export const metadata: Metadata = {
  title: PLATFORM_CONTENT.de.meta.title,
  description: PLATFORM_CONTENT.de.meta.description,
};

export default function PlattformPage() {
  return <PlatformPageView locale="de" />;
}
