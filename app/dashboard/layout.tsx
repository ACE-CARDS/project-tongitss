import { getUserWithRole } from '@/utils/supabase/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserWithRole();

  if (!user) {
    redirect('/auth/auth-code-error');
  }

  return (
    <>
      {children}
    </>
  );
}