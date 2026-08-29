import { Button } from '@/components/ui/Button';

interface CTALink {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

interface CTABannerProps {
  title: string;
  description: string | React.ReactNode;
  links: CTALink[];
  headingLevel?: 'h2' | 'h3';
  variant?: 'gradient' | 'light';
}

/**
 * Shared CTA banner used across multiple pages.
 * Two visual variants:
 * - gradient: dark bg with white text (default)
 * - light: subtle bg with dark text
 */
export default function CTABanner({
  title,
  description,
  links,
  headingLevel = 'h3',
  variant = 'gradient',
}: CTABannerProps) {
  const Heading = headingLevel;
  const isGradient = variant === 'gradient';

  return (
    <div
      className={
        isGradient
          ? 'rounded-xl border border-border-subtle bg-surface-raised p-8 text-center'
          : 'rounded-xl border border-border-default bg-surface-raised p-8 text-center'
      }
    >
      <Heading className="heading-section mb-3">{title}</Heading>
      <p className="text-base mb-6 leading-relaxed max-w-3xl mx-auto text-text-secondary">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {links.map((link, i) => {
          const isPrimary = link.variant === 'primary' || (!link.variant && i === 0);
          return (
            <Button
              key={link.href}
              href={link.href}
              variant={isPrimary ? 'primary' : 'secondary'}
              size="lg"
            >
              {link.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
