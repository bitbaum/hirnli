import Link from 'next/link';
import Card from '@/components/ui/Card';
import { RESOURCES } from '../data';

export default function KeyResources() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 heading-subsection">Wichtige Ressourcen</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {RESOURCES.map((resource) => (
          <Link
            key={resource.href}
            href={resource.href}
            className="block"
            {...(resource.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
              <div className="flex-1">
                <strong className="block text-sm">{resource.label}</strong>
                <span className="text-sm text-text-muted">{resource.description}</span>
              </div>
              <span className="text-primary" aria-hidden="true">
                {resource.external ? '↓' : '→'}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
