import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createClient } from "@/utils/db/server";

export async function getUserWithRole() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const db = await createClient();
  const { data: profile, error: dbError } = await db
    .from("users")
    .select(`
      member_id,
      member!inner (
        role,
        acadyear,
        is_active
      )
    `)
    .eq("id", session.user.id)
    .eq("member.is_active", true)
    .order("acadyear", { foreignTable: "member", ascending: false })
    .limit(1, { foreignTable: "member" })
    .single();

  if (dbError || !profile) {
    console.error("Access Denied or Database Error:", dbError);
    return null;
  }

  const memberData = Array.isArray(profile.member)
    ? profile.member[0]
    : profile.member;

  return {
    ...session.user,
    role: memberData?.role || null,
    acadyear: memberData?.acadyear || null,
    member_id: profile.member_id,
  };
}