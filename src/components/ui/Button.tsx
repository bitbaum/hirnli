'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';

// ============================================================================
// Button — Shared button component with consistent variants and sizes
//
// Ground Truth #2: Single source of truth for all button styling.
// Ground Truth #5: Simple API, avoids premature abstraction.
// ============================================================================

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-text-primary text-surface-base hover:bg-text-secondary active:bg-text-secondary/90',
  secondary:
    'border border-border-default bg-surface-base text-text-primary hover:bg-surface-raised active:bg-surface-overlay',
  soft:
    'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  ghost:
    'text-text-primary hover:bg-surface-raised active:bg-surface-overlay',
  danger:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/80',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'min-h-11 px-3 py-1.5 text-sm',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-11 px-6 py-3 text-sm',
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50';

function cls(...parts: (string | false | undefined | null)[]) {
  return parts.filter(Boolean).join(' ');
}

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent) => void;
  target?: string;
  rel?: string;
  title?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  href,
  disabled,
  type = 'button',
  onClick,
  target,
  rel,
  title,
}: ButtonProps) {
  const classes = cls(
    BASE,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && 'w-full',
    className,
  );

  if (href) {
    const isExternal = href.startsWith('http');
    // Use plain <a> for external links OR when target is specified (e.g. PDF in new tab)
    if (isExternal || target) {
      return (
        <a
          href={href}
          className={classes}
          target={target || (isExternal ? '_blank' : undefined)}
          rel={rel || ((isExternal || target) ? 'noopener noreferrer' : undefined)}
          onClick={onClick}
          title={title}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
