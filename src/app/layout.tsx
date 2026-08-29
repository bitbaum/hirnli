import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { BRANDING } from '@/lib/config/branding';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE_TITLE = `${ORG_PROFILE.name} — Transparentes Fundraising`;
const SITE_DESCRIPTION =
  'Alle Zahlen, alle Quellen, komplett nachvollziehbar: Finanzen, Wirkung und Strategie — plus Stiftungsrecherche und Gesuch-Generierung auf einer Plattform.';

export const metadata: Metadata = {
  // Absolute base for OG images and canonical URLs (link previews need absolute URLs)
  metadataBase: new URL(ORG_PROFILE.siteUrl),
  title: {
    default: SITE_TITLE,
    template: `%s — ${BRANDING.siteName}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: BRANDING.siteName,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: 'de_CH',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = await getTranslations('common');
  return (
    <html
      lang={locale === 'de' ? 'de-CH' : locale}
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider>
          <ThemeProvider>
            <a href="#main-content" className="skip-link">
              {t('skipLink')}
            </a>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>

        {/* FleetCrown feedback widget — env-gated, see docs/architecture/feedback-widget.md */}
        {process.env.NEXT_PUBLIC_FC_WIDGET_TOKEN && (
          <Script
            src="https://fleetcrown.orangecat.ch/widget.js"
            strategy="afterInteractive"
            data-fc-project={process.env.NEXT_PUBLIC_FC_WIDGET_TOKEN}
          />
        )}
      </body>
    </html>
  );
}
