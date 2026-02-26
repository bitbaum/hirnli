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
    'bg-grey-dark text-white hover:bg-grey-dark/85 active:bg-grey-dark/75',
  secondary:
    'border border-border bg-white text-grey-dark hover:bg-bg-light active:bg-grey-light',
  soft:
    'bg-primary text-white hover:bg-primary/90 active:bg-primary/80',
  ghost:
    'text-text hover:bg-bg-light active:bg-grey-light',
  danger:
    'bg-danger text-white hover:bg-danger/90 active:bg-danger/80',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
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
    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          target={target || '_blank'}
          rel={rel || 'noopener noreferrer'}
          onClick={onClick}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
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
    >
      {children}
    </button>
  );
}
