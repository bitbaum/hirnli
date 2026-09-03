import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { getSession } from '@/lib/auth/access';

export const metadata: Metadata = { title: 'Konto erstellen' };

export default async function SignUpPage() {
  if (await getSession()) redirect('/start');
  return (
    <main className="mx-auto w-full max-w-sm px-4 py-16">
      <AuthForm mode="signup" />
    </main>
  );
}
