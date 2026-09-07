'use client';

/**
 * Members and invitations, for one organisation.
 *
 * The invite form hands back a LINK rather than claiming to have sent a mail.
 * Production has no mail sender, and "we have emailed them" when nothing left
 * the building is the kind of lie that costs someone a day of waiting. The
 * invitation itself is real: it is a row with an expiry, and accepting it
 * requires being signed in as the address it names.
 */

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ORG_ROLES, type OrgRole } from '@/lib/auth/roles';
import type { OrgMember, PendingInvitation } from '@/lib/auth/membership';
import { cancelInvitation, inviteMember, removeMember, type MembersState } from './actions';

const ROLE_LABEL: Record<OrgRole, string> = {
  owner: 'Eigentümer:in',
  admin: 'Administrator:in',
  member: 'Mitglied',
};

const ROLE_HINT: Record<OrgRole, string> = {
  owner: 'Alles, inklusive Eigentum vergeben und die Organisation auflösen.',
  admin: 'Inhalte bearbeiten und Personen einladen.',
  member: 'Lesen.',
};

const FIELD =
  'mt-1 w-full min-h-11 rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary';

export function MembersClient({
  orgSlug,
  platformHost,
  canInvite,
  isOwner,
  members,
  invitations,
}: {
  orgSlug: string;
  platformHost: string;
  canInvite: boolean;
  isOwner: boolean;
  members: OrgMember[];
  invitations: PendingInvitation[];
}) {
  const [inviteState, inviteAction, inviting] = useActionState<MembersState, FormData>(
    inviteMember,
    {},
  );
  const [cancelState, cancelAction] = useActionState<MembersState, FormData>(cancelInvitation, {});
  const [removeState, removeAction] = useActionState<MembersState, FormData>(removeMember, {});
  const [copied, setCopied] = useState(false);

  const fullLink = inviteState.inviteLink ? `https://${platformHost}${inviteState.inviteLink}` : '';
  // Only an owner may create another owner, so an admin is not offered the option
  // at all rather than being refused after typing an address.
  const offerableRoles = ORG_ROLES.filter((r) => isOwner || r !== 'owner');

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-text-primary">Mitglieder</h2>
        {members.length === 0 ? (
          <p className="max-w-prose text-sm text-text-secondary">
            Diese Organisation hat noch keine Mitglieder.
          </p>
        ) : (
          <ul className="divide-y divide-border-default rounded-lg border border-border-default">
            {members.map((m) => (
              <li key={m.memberId} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{m.name ?? m.email}</p>
                  {m.name && <p className="truncate text-xs text-text-muted">{m.email}</p>}
                </div>
                <span className="text-xs text-text-muted">{ROLE_LABEL[m.role]}</span>
                {canInvite && (
                  <form action={removeAction}>
                    <input type="hidden" name="orgSlug" value={orgSlug} />
                    <input type="hidden" name="memberId" value={m.memberId} />
                    <button
                      type="submit"
                      className="min-h-9 rounded-lg border border-border-default px-3 text-xs text-text-secondary"
                    >
                      Entfernen
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {removeState.error && <p className="text-sm text-status-error">{removeState.error}</p>}
      </section>

      {invitations.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Offene Einladungen</h2>
          <ul className="divide-y divide-border-default rounded-lg border border-border-default">
            {invitations.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{i.email}</p>
                  <p className="text-xs text-text-muted">
                    Gültig bis {new Intl.DateTimeFormat('de-CH').format(new Date(i.expiresAt))} ·{' '}
                    <span className="font-mono">{`https://${platformHost}/einladung/${i.id}`}</span>
                  </p>
                </div>
                <form action={cancelAction}>
                  <input type="hidden" name="orgSlug" value={orgSlug} />
                  <input type="hidden" name="invitationId" value={i.id} />
                  <button
                    type="submit"
                    className="min-h-9 rounded-lg border border-border-default px-3 text-xs text-text-secondary"
                  >
                    Zurückziehen
                  </button>
                </form>
              </li>
            ))}
          </ul>
          {cancelState.error && <p className="text-sm text-status-error">{cancelState.error}</p>}
        </section>
      )}

      {canInvite && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-text-primary">Jemanden einladen</h2>
          <p className="max-w-prose text-sm text-text-muted">
            Es wird keine E-Mail verschickt — für diese Installation ist kein Mailversand
            eingerichtet. Sie erhalten einen Link und geben ihn selbst weiter. Annehmen kann ihn
            nur, wer mit genau dieser Adresse angemeldet ist.
          </p>

          <form action={inviteAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="orgSlug" value={orgSlug} />
            <label className="min-w-64 flex-1 text-sm font-medium text-text-primary">
              E-Mail-Adresse
              <input name="email" type="email" required className={FIELD} />
            </label>
            <label className="text-sm font-medium text-text-primary">
              Rolle
              <select name="role" defaultValue="admin" className={FIELD}>
                {offerableRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]} — {ROLE_HINT[r]}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={inviting}>
              {inviting ? 'Wird erstellt …' : 'Einladung erstellen'}
            </Button>
          </form>

          {inviteState.error && <p className="text-sm text-status-error">{inviteState.error}</p>}

          {fullLink && (
            <div className="flex flex-col gap-2 rounded-lg border border-border-default bg-surface-raised p-4">
              <p className="text-sm text-text-secondary">
                Einladung für{' '}
                <strong className="text-text-primary">{inviteState.invitedEmail}</strong> erstellt.
                Diesen Link weitergeben:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-surface-base px-2 py-1 font-mono text-xs text-text-primary">
                  {fullLink}
                </code>
                <button
                  type="button"
                  className="min-h-9 rounded-lg border border-border-default px-3 text-xs text-text-secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(fullLink).then(
                      () => setCopied(true),
                      () => setCopied(false),
                    );
                  }}
                >
                  {copied ? 'Kopiert' : 'Kopieren'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
