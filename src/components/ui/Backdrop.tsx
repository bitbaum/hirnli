'use client';

/**
 * Backdrop — Shared overlay layer for modals, drawers, and full-screen
 * sheets. Replaces the six inline `<div className="fixed inset-0 bg-black/...">`
 * call sites that previously chose 30/40/50% opacity and z-40/z-50 ad-hoc.
 *
 * Tone (`darker` for centered modals, `muted` for slide-in drawers/nav menus)
 * is the only design decision a caller has to make; everything else — z-index,
 * position, click-outside, pointer cursor — is decided here.
 */

import type { MouseEvent } from 'react';

type BackdropTone = 'muted' | 'darker';
type BackdropLayer = 'backdrop' | 'modal';

interface BackdropProps {
  /** Click handler for backdrop dismissal. The component scopes it to
   *  the backdrop element itself, so children's clicks don't trigger it. */
  onClose?: () => void;
  /**
   * `muted` (default): `bg-black/30`, for drawers and overlays where the
   *   underlying chrome should remain readable.
   * `darker`: `bg-black/50`, for centered modals where the user must focus
   *   on the dialog.
   */
  tone?: BackdropTone;
  /**
   * Stacking layer per the z-index SSOT in globals.css.
   * - `backdrop` (default): `z-40`, for drawer overlays + the nav mobile menu
   *   (the drawer panel itself sits above this).
   * - `modal`: `z-50`, for centered dialogs where backdrop and dialog share
   *   the same stacking context.
   */
  layer?: BackdropLayer;
  /** Render children centered on the backdrop (modal pattern) — otherwise
   *  the backdrop is a pure overlay layer. */
  centered?: boolean;
  /** Extra padding for the centered container — defaults to `p-3 sm:p-4`. */
  paddingClassName?: string;
  /**
   * When provided, the backdrop stays mounted and fades via opacity. Use this
   * for drawers that animate their own slide-in/out — set `open=false` to fade
   * out without unmounting. Omit (or pass `undefined`) for modal-style "render
   * only while visible" usage.
   */
  open?: boolean;
  /** Optional extra class names. */
  className?: string;
  children?: React.ReactNode;
}

const TONE_CLASS: Record<BackdropTone, string> = {
  muted: 'bg-black/30',
  darker: 'bg-black/50',
};

const LAYER_CLASS: Record<BackdropLayer, string> = {
  backdrop: 'z-backdrop',
  modal: 'z-modal',
};

export default function Backdrop({
  onClose,
  tone = 'muted',
  layer = 'backdrop',
  centered = false,
  paddingClassName = 'p-3 sm:p-4',
  open,
  className = '',
  children,
}: BackdropProps) {
  const layoutClass = centered
    ? `flex items-center justify-center ${paddingClassName}`
    : '';

  const transitionClass = open === undefined
    ? ''
    : `transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`;

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    if (!onClose) return;
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className={`fixed inset-0 ${LAYER_CLASS[layer]} ${TONE_CLASS[tone]} ${layoutClass} ${transitionClass} ${className}`.trim()}
      onClick={handleClick}
      aria-hidden={onClose ? undefined : 'true'}
    >
      {children}
    </div>
  );
}
