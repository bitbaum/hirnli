import type { PhotoSlot } from '@/lib/schemas/story';

interface PhotoPlaceholderProps {
  slot: PhotoSlot;
}

export default function PhotoPlaceholder({ slot }: PhotoPlaceholderProps) {
  return (
    <div className="my-3 flex items-center justify-center rounded border-2 border-dashed border-border bg-surface-alt px-4 py-6 text-center">
      <p className="text-sm text-text-muted">{slot.description}</p>
    </div>
  );
}
