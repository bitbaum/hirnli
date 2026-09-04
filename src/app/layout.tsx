import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { BRANDING } from '@/lib/config/branding';
import { getTenant } from '@/lib/tenant/resolve';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE_DESCRIPTION =
  'Alle Zahlen, alle Quellen, komplett nachvollziehbar: Finanzen, Wirkung und Strategie — plus Stiftungsrecherche und Gesuch-Generierung auf einer Plattform.';

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenant();
  const siteTitle = `${tenant.name} — Transparentes Fundraising`;

  return {
    // Absolute base for OG images and canonical URLs (link previews need
    // absolute URLs). Omitted for a tenant with no site of its own rather than
    // pointed at somebody else's domain, which is where every relative URL on
    // the page — including the OG image — would then resolve.
    metadataBase: tenant.siteUrl ? new URL(tenant.siteUrl) : undefined,
    title: {
      default: siteTitle,
      template: `%s — ${BRANDING.siteName}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: 'website',
      siteName: BRANDING.siteName,
      title: siteTitle,
      description: SITE_DESCRIPTION,
      locale: 'de_CH',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: SITE_DESCRIPTION,
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

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
