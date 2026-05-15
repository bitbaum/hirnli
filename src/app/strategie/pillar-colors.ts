export type PillarColorScheme = 'emerald' | 'blue' | 'violet' | 'amber';

export const PILLAR_COLORS: Record<PillarColorScheme, {
  border: string;
  borderHover: string;
  bg: string;
  bgHover: string;
  text: string;
  accent: string;
  ring: string;
}> = {
  emerald: {
    border: 'border-success/20',
    borderHover: 'hover:border-success',
    bg: 'bg-success/10',
    bgHover: 'hover:bg-success/15',
    text: 'text-success',
    accent: 'bg-success',
    ring: 'focus-visible:ring-success',
  },
  blue: {
    border: 'border-primary/20',
    borderHover: 'hover:border-primary',
    bg: 'bg-primary/10',
    bgHover: 'hover:bg-primary/15',
    text: 'text-primary',
    accent: 'bg-primary',
    ring: 'focus-visible:ring-primary',
  },
  violet: {
    border: 'border-pillar-vision/20',
    borderHover: 'hover:border-pillar-vision/60',
    bg: 'bg-pillar-vision/10',
    bgHover: 'hover:bg-pillar-vision/15',
    text: 'text-pillar-vision',
    accent: 'bg-pillar-vision',
    ring: 'focus-visible:ring-pillar-vision',
  },
  amber: {
    border: 'border-warning/20',
    borderHover: 'hover:border-warning',
    bg: 'bg-warning/10',
    bgHover: 'hover:bg-warning/15',
    text: 'text-warning',
    accent: 'bg-warning',
    ring: 'focus-visible:ring-warning',
  },
};
