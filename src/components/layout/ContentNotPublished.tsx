/**
 * What a tenant sees on a page it has not authored.
 *
 * The alternative — and the behaviour this replaces — was to render the
 * reference tenant's content under the reader's name. That is not a fallback,
 * it is a substitution: the second tenant's /finanzen showed another
 * organisation's eight-year profit-and-loss, /team showed fourteen of its
 * colleagues by name, /wirkung showed its CO2 savings.
 *
 * So: say plainly that there is nothing here yet, name what the page would
 * contain, and stop. Empty is honest; borrowed is not.
 */

import Card from '@/components/ui/Card';

export default function ContentNotPublished({
  page,
  tenantName,
  describes,
}: {
  /** Human name of the page, e.g. "Finanzen". */
  page: string;
  /** Whose page it is — so the reader knows nothing is broken. */
  tenantName: string;
  /** One sentence on what would appear here, so the gap is legible. */
  describes: string;
}) {
  return (
    <Card className="py-12 text-center">
      <p className="heading-card mb-2">{page} noch nicht veröffentlicht</p>
      <p className="mx-auto max-w-prose text-sm text-text-secondary">
        {tenantName} hat für diese Seite noch keine Inhalte hinterlegt. {describes}
      </p>
    </Card>
  );
}
