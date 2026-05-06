// lib/supabase/user-session.ts
import { createClient } from '@/lib/supabase/server';

export async function getUserWithRole() {
  const supabase = await createClient();

  // 1. Get the Auth Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return null;

  // 2. Fetch the role from your public.users table
  const { data: profile, error: dbError } = await supabase
    .from('users')
    .select('member_id, member (role)')
    .eq('id', user.id)
    .single();

    console.log("Auth User ID:", user.id);
    console.log("Public Profile Data:", profile);
    console.log("Database Error:", dbError);

  if (dbError) return { ...user, role: null };

  return {
    ...user,
    role: profile?.member?.role || profile?.member?.[0]?.role || null,
    member_id: profile.member_id
  };
}