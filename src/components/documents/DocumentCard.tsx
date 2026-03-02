import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { Document } from '@/lib/config/documents';

interface DocumentCardProps {
  document: Document;
}

const FORMAT_ICONS: Record<string, string> = {
  PDF: '📄',
  CSV: '📊',
  Excel: '📈',
  Markdown: '📝',
};

const ACTION_LABELS: Record<string, string> = {
  print: 'Öffnen & Cmd/Ctrl+P',
  download: 'Download',
  external: 'Öffnen',
};

const ACTION_ICONS: Record<string, string> = {
  print: '🖨️',
  download: '⬇️',
  external: '🔗',
};

export default function DocumentCard({ document }: DocumentCardProps) {
  const icon = FORMAT_ICONS[document.format] || '📄';
  const actionLabel = ACTION_LABELS[document.action] || 'Öffnen';
  const actionIcon = ACTION_ICONS[document.action] || '→';

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <div>
            <h3 className="text-base font-semibold text-grey-dark group-hover:text-primary transition-colors">
              {document.title}
            </h3>
            {document.badge && (
              <Badge color="blue" className="mt-1">{document.badge}</Badge>
            )}
          </div>
        </div>
        <Badge color={document.format === 'PDF' ? 'purple' : 'emerald'}>
          {document.format}
        </Badge>
      </div>

      <p className="text-sm text-text-light mb-4">
        {document.description}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted mb-3">
        {document.size && (
          <span>
            <strong>Grösse:</strong> {document.size}
          </span>
        )}
        {document.lastUpdated && (
          <span>
            <strong>Stand:</strong> {new Date(document.lastUpdated).toLocaleDateString('de-CH')}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-medium text-primary group-hover:text-primary-light transition-colors flex items-center gap-2">
          <span>{actionIcon}</span>
          <span>{actionLabel}</span>
        </span>
        {document.action === 'download' && (
          <span className="text-xs text-emerald-600 font-semibold">Direkt-Download</span>
        )}
      </div>
    </>
  );

  if (document.action === 'download') {
    return (
      <Card className="group border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-200">
        <a
          href={document.href}
          download
          className="block no-underline"
        >
          {cardContent}
        </a>
      </Card>
    );
  }

  return (
    <Link href={document.href} className="block group no-underline">
      <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-200">
        {cardContent}
      </Card>
    </Link>
  );
}
