// Server only. Replaces utils/supabase/server.ts
import { PostgrestClient } from '@supabase/postgrest-js';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { signDbToken } from '@/lib/db-token';

export async function createServerDb() {
  const session = await auth.api.getSession({ headers: await headers() });
  const h: Record<string, string> = {};
  if (session) h.Authorization = 'Bearer ' + (await signDbToken(session.user)).token;
  return new PostgrestClient(process.env.POSTGREST_URL!, { headers: h }); // anon role when logged out
}
