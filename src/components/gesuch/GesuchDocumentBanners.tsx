import type { ReactNode } from 'react';

interface VorlageBannerProps {
  title: string;
  className?: string;
  children: ReactNode;
}

export function VorlageBanner({ title, className = '', children }: VorlageBannerProps) {
  return (
    <div
      className={`rounded-lg border-2 border-warning bg-warning-bg p-4 text-center ${className}`}
    >
      <p className="heading-detail text-warning">{title}</p>
      <p className="mt-1 text-sm text-text-secondary">{children}</p>
    </div>
  );
}

interface PrintTipBannerProps {
  children: ReactNode;
  className?: string;
  suffix?: ReactNode;
}

export function PrintTipBanner({ children, className = '', suffix = '.' }: PrintTipBannerProps) {
  return (
    <div
      className={`rounded-lg border border-accent-border bg-accent-soft p-4 text-center text-sm text-text-secondary ${className}`}
    >
      <strong>Tipp:</strong> Drücken Sie Cmd+P (Mac) oder Ctrl+P (Windows/Linux) für eine saubere
      A4-PDF-Ausgabe{suffix}
      <div className="mt-2 flex justify-center gap-4">{children}</div>
    </div>
  );
}
