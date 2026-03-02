import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: [
          '/gesuch/share/',  // Share pages: sent directly, not discovered via search
          '/fundraising/',   // Internal pipeline tools
          '/api/',           // API routes
        ],
      },
    ],
  };
}
