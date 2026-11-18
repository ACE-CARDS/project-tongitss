import { PostgrestClient } from '@supabase/postgrest-js';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { mintDbToken } from '@/lib/db-token';

type DbClient = PostgrestClient<any> & {
  auth: {
    getUser: () => Promise<{
      data: { user: Awaited<ReturnType<typeof getUser>> };
      error: null;
    }>;
  };
};

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function createClient(): Promise<DbClient> {
  const user = await getUser();
  const h: Record<string, string> = {};
  if (user) h.Authorization = `Bearer ${await mintDbToken(user)}`;
  const db = new PostgrestClient<any>(
    process.env.POSTGREST_URL as string,
    { headers: h }
  ) as DbClient;
  // Compatibility shim so existing `supabase.auth.getUser()` calls keep working.
  db.auth = { getUser: async () => ({ data: { user }, error: null }) };
  return db;
}