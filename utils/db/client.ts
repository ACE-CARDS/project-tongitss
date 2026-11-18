'use client';
import { PostgrestClient } from '@supabase/postgrest-js';
import { authClient } from '@/lib/auth-client';

let cache: { token: string | null; exp: number } | null = null;
async function getToken() {
  if (cache && cache.exp > Date.now()) return cache.token;
  const r = await fetch('/api/db-token', { cache: 'no-store' });
  const { token } = await r.json();
  cache = { token, exp: Date.now() + (token ? 10 * 60_000 : 5_000) };
  return token as string | null;
}

export function createClient() {
  const db: any = new PostgrestClient(`${window.location.origin}/rest`, {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const token = await getToken();
      const headers = new Headers(init?.headers);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
  });
  db.auth = {
    getUser: async () => ({ data: { user: (await authClient.getSession()).data?.user ?? null }, error: null }),
  };
  return db;
}