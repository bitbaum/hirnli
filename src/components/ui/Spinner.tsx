/**
 * Spinner — Single source for the loading spinner glyph.
 *
 * Replaces seven hand-rolled `<span class="inline-block h-X w-X animate-spin
 * rounded-full border-2 border-X border-t-X">` snippets that picked their own
 * size and border colours. Use this in any "waiting for…" state.
 *
 * For full-page or full-section loading affordances (with a centered label),
 * prefer `<LoadingState>`; this component is the minimal inline glyph.
 */

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
/**
 * Tone of the spinner — what colour the active arc should be.
 *
 * - `primary` (default): border-default with a primary arc; for surfaces
 *   sitting on the page or a card.
 * - `accent`: a full primary ring with a transparent gap; for accent banners
 *   where the spinner is the page's main visual signal.
 * - `on-accent`: white arc with translucent white track; for sitting on
 *   top of a primary-coloured button.
 * - `current`: borrows `currentColor` for both track and arc; pairs with a
 *   parent that already sets a text colour (badges, inline status pills).
 */
type SpinnerTone = 'primary' | 'accent' | 'on-accent' | 'current';

interface SpinnerProps {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  /** Override classes (e.g. add margin/translate). Use sparingly. */
  className?: string;
  /** Accessible label for screen readers; defaults to "Lädt…". */
  label?: string;
}

const SIZE_CLASS: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-3.5 w-3.5 border-2',
  md: 'h-4 w-4 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-8 w-8 border-4',
};

const TONE_CLASS: Record<SpinnerTone, string> = {
  primary: 'border-border-default border-t-primary',
  accent: 'border-primary border-t-transparent',
  'on-accent': 'border-white/30 border-t-white',
  current: 'border-current border-t-transparent',
};

export default function Spinner({
  size = 'md',
  tone = 'primary',
  className = '',
  label = 'Lädt…',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full ${SIZE_CLASS[size]} ${TONE_CLASS[tone]} ${className}`.trim()}
    />
  );
}
