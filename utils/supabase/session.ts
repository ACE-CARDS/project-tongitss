// lib/supabase/user-session.ts
import { createClient } from '@/utils/supabase/server';

export async function getUserWithRole() {
  const supabase = await createClient();

  // 1. Get the Auth Session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) return null;

  // 2. Fetch the profile and the most recent role based on acadyear
  // We order by acadyear descending to get the latest year first
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
    .order('acadyear', { foreignTable: 'member', ascending: false }) // Sort the related member records
    .limit(1, { foreignTable: 'member' }) // Ensure we only get the latest record from the join
    .single();

  console.log("Auth User ID:", user.id);
  console.log("Public Profile Data (Latest Year):", profile);
  
  if (dbError || !profile) {
    console.error("Access Denied or Database Error:", dbError);
    return null; 
  }
  
  // Handle both single object or array return depending on your Supabase relationship config
  const memberData = Array.isArray(profile?.member) ? profile.member[0] : profile?.member;

  return {
    ...user,
    role: memberData?.role || null,
    acadyear: memberData?.acadyear || null, // Optional: keep track of which year this role is from
    member_id: profile.member_id
  };
}