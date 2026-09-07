/**
 * The other end of an invitation.
 *
 * Public on purpose: someone following this link may not have an account yet,
 * and telling them to "ask an administrator" when they are holding the
 * administrator's link is the dead end this page removes.
 *
 * What it shows before sign-in is deliberately thin — the organisation's name
 * and the invited address — because the id in the URL is the only secret, and
 * a page that revealed more would leak it to anyone the link is forwarded to.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { invitation, organization } from '@/lib/db/auth-schema';
import { getSession } from '@/lib/auth/access';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AcceptForm } from './AcceptForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Einladung' };

export default async function EinladungPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rows = await db
    .select({
      email: invitation.email,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      orgName: organization.name,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(eq(invitation.id, id))
    .limit(1);

  const invite = rows[0];
  if (!invite) notFound();

  const session = await getSession();
  const expired = invite.expiresAt < new Date();
  const spent = invite.status !== 'pending';
  // Case-insensitive, matching the rule the accept endpoint enforces. Shown
  // here only so the mismatch is explained BEFORE the button, rather than as a
  // refusal after it.
  const wrongAccount =
    session != null && session.user.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <Card>
        <h1 className="heading-section">Einladung zu {invite.orgName}</h1>
        <p className="mt-3 text-text-secondary">
          Diese Einladung ist an <strong className="text-text-primary">{invite.email}</strong>{' '}
          gerichtet.
        </p>

        {spent && (
          <p className="mt-4 text-text-secondary">
            Sie wurde bereits angenommen oder zurückgezogen. Bitten Sie um eine neue.
          </p>
        )}

        {!spent && expired && (
          <p className="mt-4 text-text-secondary">
            Sie ist abgelaufen. Bitten Sie um eine neue — das dauert nur einen Moment.
          </p>
        )}

        {!spent && !expired && !session && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-text-secondary">
              Melden Sie sich mit dieser Adresse an, um die Einladung anzunehmen. Wenn Sie noch kein
              Konto haben, erstellen Sie eines — die Einladung wartet.
            </p>
            <Button href={`/anmelden?next=${encodeURIComponent(`/einladung/${id}`)}`} size="lg">
              Anmelden
            </Button>
            <Link
              href={`/registrieren?next=${encodeURIComponent(`/einladung/${id}`)}`}
              className="text-sm text-text-primary underline"
            >
              Konto erstellen
            </Link>
          </div>
        )}

        {!spent && !expired && session && wrongAccount && (
          <p className="mt-4 text-text-secondary">
            Sie sind als <strong className="text-text-primary">{session.user.email}</strong>{' '}
            angemeldet. Diese Einladung gilt für eine andere Adresse — melden Sie sich mit dieser
            an, oder bitten Sie um eine Einladung für Ihre.
          </p>
        )}

        {!spent && !expired && session && !wrongAccount && <AcceptForm invitationId={id} />}
      </Card>
    </main>
  );
}
