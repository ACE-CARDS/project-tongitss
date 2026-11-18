"use client";

import { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

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
  const user = session?.user ?? (isPending ? initialUser : null);

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