/**
 * Where a new customer becomes one.
 *
 * Before this page existed, `/start` told a person with no organisation to ask
 * whoever invited them — and nobody could be that inviter, because nothing
 * created organisations. The two tenants in production were made by hand.
 *
 * The form asks for exactly the facts `storedTenantProfileSchema` requires and
 * nothing else. Address, phone and tax status are optional in that schema
 * because a young organisation may not have them yet, and asking here would
 * make a new customer fill in things they cannot answer before seeing anything.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/access';
import { PLATFORM_HOST } from '@/lib/tenant/registry';
import { CreateOrganizationForm } from './CreateOrganizationForm';

export const metadata: Metadata = { title: 'Organisation erstellen' };

export default async function CreateOrganizationPage() {
  const session = await getSession();
  if (!session) redirect('/anmelden');

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">
        Organisation erstellen
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        Diese Angaben erscheinen auf Ihren Seiten und in jedem Gesuch. Sie lassen sich später
        ändern; Adresse, Telefon und Steuerbefreiung können Sie ergänzen, sobald Sie sie haben.
      </p>

      <CreateOrganizationForm platformHost={PLATFORM_HOST} defaultEmail={session.user.email} />
    </main>
  );
}
