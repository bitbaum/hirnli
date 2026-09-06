import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Tenant } from '@/lib/tenant/profile';
import { PLATFORM_HOST } from '@/lib/tenant/registry';

/**
 * What an organisation sees before it has written its story.
 *
 * This page exists because the alternative is worse in a specific way. A Gesuch
 * is composed from a narrative — why this work matters, what the organisation
 * can do, what it has already done, who vouches for it — and when that
 * narrative was a module rather than a row, an organisation without one still
 * got a complete, confident, well-formatted grant application. It was somebody
 * else's, with this organisation's name interpolated into it, and nothing on
 * the page said so.
 *
 * An empty state is the honest output, and it is also the useful one: it names
 * the one thing standing between this organisation and a working Gesuch.
 */
export default function StoryMissing({ tenant }: { tenant: Tenant }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="text-center">
        <h1 className="mb-4 heading-section">Noch keine Organisationsgeschichte</h1>
        <p className="mb-6 text-text-secondary">
          Ein Gesuch wird aus der Geschichte von {tenant.name} zusammengestellt — warum diese Arbeit
          nötig ist, was Ihre Organisation kann und was sie bereits erreicht hat. Diese Angaben
          fehlen noch, deshalb kann hier kein Gesuch erzeugt werden.
        </p>
        {/* Absolute, and to the platform: the account area lives on the
            platform host while this page is served from the organisation's own
            domain, so a relative path would 404 on the tenant's site. */}
        <Button href={`https://${PLATFORM_HOST}/o/${tenant.orgId}`} size="lg">
          Zum Organisationskonto
        </Button>
      </Card>
    </div>
  );
}
