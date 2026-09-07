import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ComposedGesuch } from '@/lib/domain/gesuch-composer';
import type { Tenant } from '@/lib/tenant/profile';
import { PLATFORM_HOST } from '@/lib/tenant/registry';

/**
 * What a Gesuch that cannot honestly be written looks like.
 *
 * `composeGesuch` has always answered this question — `ready` and `readyReason`
 * are on every composed document — and four routes never asked it. They
 * rendered the document regardless, which for the first customer was harmless
 * because it had written every theme, and for the second produced a formal
 * grant application with a blank argument on page one.
 *
 * A composer that reports a problem to nobody is the same defect as a
 * parameter nobody reads: it looks handled from the producing side. So this
 * component exists to make honouring `ready` cheap, and a source-level test
 * makes forgetting it fail.
 */
export default function GesuchNotReady({
  gesuch,
  tenant,
  backHref,
  backLabel = 'Zurück',
}: {
  gesuch: Pick<ComposedGesuch, 'readyReason' | 'foundation'>;
  tenant: Tenant;
  backHref: string;
  backLabel?: string;
}) {
  // The reason distinguishes "we know too little about this funder" from "you
  // have not written this yet", and only the second has an action attached.
  const isContentGap = gesuch.readyReason?.includes('Erzählung') ?? false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="text-center">
        <h1 className="mb-4 heading-section">Gesuch für {gesuch.foundation.name}</h1>
        <p className="mb-6 text-text-secondary">{gesuch.readyReason}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {isContentGap && (
            <Button href={`https://${PLATFORM_HOST}/o/${tenant.orgId}/inhalte/stories`} size="lg">
              Inhalte ergänzen
            </Button>
          )}
          <Button href={backHref} variant={isContentGap ? 'secondary' : 'primary'} size="lg">
            {backLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
