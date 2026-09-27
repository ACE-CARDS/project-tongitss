// lib/supabase/user-session.ts
import { createClient } from '@/utils/supabase/server';

export async function getUserWithRole() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return null;


  const { data: profile, error: dbError } = await supabase
    .from('users')
    .select(`
      member_id, 
      member!inner (
        role,
        acadyear,
        is_active
      )
    `)
    .eq('id', user.id)
    .eq('member.is_active', true)
    .order('acadyear', { foreignTable: 'member', ascending: false })
    .limit(1, { foreignTable: 'member' })
    .single();

  console.log("Auth User ID:", user.id);
  console.log("Public Profile Data (Latest Year):", profile);
  
  if (dbError || !profile) {
    console.error("Access Denied or Database Error:", dbError);
    return null; 
  }
  
  const memberData = Array.isArray(profile?.member) ? profile.member[0] : profile?.member;

  return {
    ...user,
    role: memberData?.role || null,
    acadyear: memberData?.acadyear || null,
    member_id: profile.member_id
  };
}