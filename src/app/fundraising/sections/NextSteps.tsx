import Link from 'next/link';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { NEXT_STEPS } from '../data';

export default function NextSteps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nächste Schritte</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {NEXT_STEPS.map((step) => (
          <div key={step.step} className="rounded-lg border border-border p-4">
            <h3 className="mb-2 heading-item">{step.step}</h3>
            <p className="mb-3 text-sm text-text-muted">{step.description}</p>
            <Link href={step.href} className="text-sm font-medium text-primary hover:underline">
              {step.linkLabel} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
