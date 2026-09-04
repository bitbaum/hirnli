import { GREY_DARK_HEX } from '@/lib/config/chart-colors';
import type { ThemeMetadata } from '@/lib/schemas/theme';

interface GesuchHeroSectionProps {
  /** The applying organisation's name. Passed in — this component is
   *  rendered for whichever tenant composed the Gesuch. */
  orgName: string;
  subtitle: string;
  foundationName: string;
  description: string;
  foundationBridge?: string;
  themes: ThemeMetadata[];
  primaryColor: string;
}

export default function GesuchHeroSection({
  orgName,
  subtitle,
  foundationName,
  description,
  foundationBridge,
  themes,
  primaryColor,
}: GesuchHeroSectionProps) {
  return (
    <section
      className="rounded-2xl px-4 py-12 text-white md:px-8 md:py-16"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}88, ${GREY_DARK_HEX})`,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/70">
          {subtitle}
        </p>
        <h1 className="mb-4 heading-section text-white md:text-4xl">
          {orgName} × {foundationName}
        </h1>
        {description && (
          <p className="mb-4 max-w-2xl text-base text-white/90 md:text-lg">{description}</p>
        )}
        {foundationBridge && (
          <p className="mb-6 max-w-2xl text-sm italic text-white/75">{foundationBridge}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <span
              key={theme.id}
              className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium"
            >
              {theme.icon} {theme.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
