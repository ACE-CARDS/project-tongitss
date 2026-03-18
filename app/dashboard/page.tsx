import { createClient } from "@/lib/supabase/server";
import { getUserWithRole } from "@/lib/supabase/session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUserWithRole();

  // If no session, send to login
  if (!user) {
    redirect('/auth/login');
  }

  // Check for specific roles
  if (user.role !== 'admin' && user.role !== 'member') {
    return <div>Access Denied: You do not have the required permissions.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">Welcome to your Dashboard!</h1>
    </div>
  );
}