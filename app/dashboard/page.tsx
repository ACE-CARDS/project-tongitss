import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const session = await supabase.auth.getUser();

  console.log(session);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">Welcome to your Dashboard!</h1>
    </div>
  );
}