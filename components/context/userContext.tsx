"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";
import { createClient } from "@/utils/db/client";

type UserContextType = {
  user: any | null;
  isPending: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  user: initialUser = null,
}: {
  children: ReactNode;
  user?: any;
}) {
  const { data: session, isPending } = authClient.useSession();
  const [roleData, setRoleData] = useState<{
    role: string | null;
    acadyear: string | null;
    member_id: number | null;
  } | null>(
    initialUser
      ? {
          role: initialUser.role ?? null,
          acadyear: initialUser.acadyear ?? null,
          member_id: initialUser.member_id ?? null,
        }
      : null
  );

  useEffect(() => {
    const sessionUser = session?.user;
    if (!sessionUser) {
      if (!isPending) setRoleData(null);
      return;
    }

    // Already have role data for this user from SSR initialUser
    if (initialUser?.id === sessionUser.id && initialUser?.role) {
      setRoleData({
        role: initialUser.role,
        acadyear: initialUser.acadyear ?? null,
        member_id: initialUser.member_id ?? null,
      });
      return;
    }

    // Fallback for client-side login without full page reload
    let cancelled = false;
    async function loadRole() {
      const db = createClient();
      const { data } = await db
        .from("users")
        .select("member_id, member!inner(role, acadyear, is_active)")
        .eq("id", sessionUser!.id)
        .eq("member.is_active", true)
        .order("acadyear", { foreignTable: "member", ascending: false })
        .limit(1, { foreignTable: "member" })
        .single();

      if (!cancelled && data) {
        const m = Array.isArray(data.member) ? data.member[0] : data.member;
        setRoleData({
          role: m?.role ?? null,
          acadyear: m?.acadyear ?? null,
          member_id: data.member_id ?? null,
        });
      }
    }
    loadRole();
    return () => {
      cancelled = true;
    };
  }, [session?.user, isPending, initialUser]);

  const baseUser = session?.user ?? (isPending ? initialUser : null);
  const user = baseUser
    ? {
        ...(initialUser?.id === baseUser.id ? initialUser : {}),
        ...baseUser,
        ...(roleData ?? {}),
      }
    : null;

  return (
    <UserContext.Provider value={{ user, isPending }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}