import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
          <Nav />
          <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
