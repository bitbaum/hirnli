import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import { BRANDING } from '@/lib/config/branding';
import { ORG_PROFILE } from '@/lib/config/org-profile';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: `${BRANDING.siteName} — Transparenz-Hub für ${ORG_PROFILE.name} Fundraising`,
    template: `%s — ${BRANDING.siteName}`,
  },
  description: 'Fundraising Intelligence Platform: Alle Daten, alle Quellen, komplett transparent. Finanzen, Wirkung, Strategie, Stiftungen.',
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
    <html lang="de-CH" className={inter.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
        <Nav />
        <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
