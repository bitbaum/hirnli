import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import type { Document, DocumentFormat, DocumentAction } from '@/lib/config/documents';
import { formatDateCH } from '@/lib/utils/format';

type EffectiveAction = DocumentAction | 'view';

interface DocumentCardProps {
  document: Document;
}

const FORMAT_ICONS: Record<DocumentFormat, string> = {
  PDF: '📄',
  CSV: '📊',
  Excel: '📈',
  Markdown: '📝',
};

const ACTION_LABELS: Record<EffectiveAction, string> = {
  print: 'Öffnen & Cmd/Ctrl+P',
  download: 'Download',
  view: 'PDF ansehen',
  external: 'Öffnen',
};

const ACTION_ICONS: Record<EffectiveAction, string> = {
  print: '🖨️',
  download: '⬇️',
  view: '📄',
  external: '🔗',
};

export default function DocumentCard({ document }: DocumentCardProps) {
  const icon = FORMAT_ICONS[document.format];
  // PDFs with download action should open in-browser instead of downloading
  const isPdfView = document.format === 'PDF' && document.action === 'download';
  const effectiveAction: EffectiveAction = isPdfView ? 'view' : document.action;
  const actionLabel = ACTION_LABELS[effectiveAction];
  const actionIcon = ACTION_ICONS[effectiveAction];

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h3 className="heading-item group-hover:text-primary transition-colors">
              {document.title}
            </h3>
            {document.badge && (
              <Badge color="blue" className="mt-1">
                {document.badge}
              </Badge>
            )}
          </div>
        </div>
        <Badge color={document.format === 'PDF' ? 'purple' : 'emerald'}>{document.format}</Badge>
      </div>

      <p className="text-sm text-text-secondary mb-4">{document.description}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted mb-3">
        {document.size && (
          <span>
            <strong>Grösse:</strong> {document.size}
          </span>
        )}
        {document.lastUpdated && (
          <span>
            <strong>Stand:</strong> {formatDateCH(document.lastUpdated)}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-default">
        <span className="text-sm font-medium text-primary group-hover:text-primary-light transition-colors flex items-center gap-2">
          <span>{actionIcon}</span>
          <span>{actionLabel}</span>
        </span>
        {!isPdfView && document.action === 'download' && (
          <span className="text-sm text-success font-semibold">Direkt-Download</span>
        )}
      </div>
    </>
  );

  // PDFs: open in new tab (browser PDF viewer)
  if (isPdfView) {
    return (
      <a
        href={document.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block group no-underline"
      >
        <Card className="border-l-4 border-l-primary hover:shadow-lg transition-hover">
          {cardContent}
        </Card>
      </a>
    );
  }

  // Data files (CSV, Excel): direct download
  if (document.action === 'download') {
    return (
      <Card className="group border-l-4 border-l-success hover:shadow-lg transition-hover">
        <a href={document.href} download className="block no-underline">
          {cardContent}
        </a>
      </Card>
    );
  }

  // Print/external: open in same tab
  return (
    <Link href={document.href} className="block group no-underline">
      <Card className="border-l-4 border-l-primary hover:shadow-lg transition-hover">
        {cardContent}
      </Card>
    </Link>
  );
}
