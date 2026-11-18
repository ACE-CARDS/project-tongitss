import { PostgrestClient } from '@supabase/postgrest-js';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { mintDbToken } from '@/lib/db-token';

export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function createClient() {
  const user = await getUser();
  const h: Record<string, string> = {};
  if (user) h.Authorization = `Bearer ${await mintDbToken(user)}`;
  const db: any = new PostgrestClient(process.env.POSTGREST_URL as string, { headers: h });
  // Compatibility shim so existing `supabase.auth.getUser()` calls keep working.
  db.auth = { getUser: async () => ({ data: { user }, error: null }) };
  return db;
}