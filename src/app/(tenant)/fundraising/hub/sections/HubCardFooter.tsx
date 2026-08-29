interface HubCardFooterItem {
  label: string;
  value: string;
}

interface HubCardFooterProps {
  items: HubCardFooterItem[];
  className?: string;
}

export default function HubCardFooter({ items, className }: HubCardFooterProps) {
  return (
    <div
      className={`mt-3 pt-3 border-t border-border-default text-sm text-text-secondary${className ? ` ${className}` : ''}`}
    >
      {items.map((item, i) => (
        <span key={item.label}>
          <strong>{item.label}:</strong> {item.value}
          {i < items.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
