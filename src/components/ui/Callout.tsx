import type { ReactNode } from 'react';

type CalloutColor = 'warning' | 'primary' | 'success' | 'danger';

const COLOR_CLASSES: Record<CalloutColor, string> = {
  warning: 'bg-warning/10 border-warning',
  primary: 'bg-primary/10 border-primary',
  success: 'bg-success/10 border-success',
  danger:  'bg-danger/10 border-danger',
};

interface CalloutProps {
  color: CalloutColor;
  className?: string;
  children: ReactNode;
}

export default function Callout({ color, className = '', children }: CalloutProps) {
  return (
    <div className={`border-l-4 rounded-lg p-4 ${COLOR_CLASSES[color]} ${className}`}>
      {children}
    </div>
  );
}
