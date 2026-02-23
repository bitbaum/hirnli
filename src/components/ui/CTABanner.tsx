import Link from 'next/link';

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
 * - gradient: emerald gradient bg with white text (default)
 * - light: emerald-50 bg with dark text
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
          ? 'rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center'
          : 'rounded-lg border-2 border-emerald-200 bg-emerald-50 p-8 text-center'
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
            ? 'text-lg mb-6 leading-relaxed max-w-3xl mx-auto'
            : 'text-base mb-6 leading-relaxed max-w-3xl mx-auto text-grey-dark'
        }
      >
        {description}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {links.map((link, i) => {
          const isPrimary = link.variant === 'primary' || (!link.variant && i === 0);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                isGradient
                  ? isPrimary
                    ? 'px-8 py-4 bg-white text-emerald-700 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg'
                    : 'px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors duration-200 border-2 border-white'
                  : isPrimary
                    ? 'px-6 py-3 bg-white text-emerald-700 font-semibold rounded-lg border-2 border-emerald-700 hover:bg-emerald-700 hover:text-white transition-all duration-200 no-underline'
                    : 'px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg border-2 border-emerald-700 hover:bg-emerald-800 hover:border-emerald-800 transition-all duration-200 no-underline'
              }
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
