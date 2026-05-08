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
          ? 'rounded-2xl bg-grey-dark p-8 text-white text-center'
          : 'rounded-lg border border-border bg-bg-light p-8 text-center'
      }
    >
      <Heading
        className={
          isGradient
            ? 'text-2xl font-bold mb-4'
            : 'text-2xl font-bold mb-4 text-grey-dark'
        }
      >
        {title}
      </Heading>
      <p
        className={
          isGradient
            ? 'text-lg mb-6 leading-relaxed max-w-3xl mx-auto text-white/90'
            : 'text-base mb-6 leading-relaxed max-w-3xl mx-auto text-text-light'
        }
      >
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {links.map((link, i) => {
          const isPrimary = link.variant === 'primary' || (!link.variant && i === 0);
          return (
            <Button
              key={link.href}
              href={link.href}
              variant={isGradient ? 'secondary' : (isPrimary ? 'primary' : 'secondary')}
              size="lg"
              className={
                isGradient
                  ? isPrimary
                    ? 'bg-white text-grey-dark hover:bg-white/90 border-0'
                    : 'border-white/50 bg-white/15 text-white hover:bg-white/25'
                  : ''
              }
            >
              {link.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
