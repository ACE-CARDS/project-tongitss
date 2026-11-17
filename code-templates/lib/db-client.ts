'use client';
// Browser side. Replaces utils/supabase/client.ts
import { PostgrestClient } from '@supabase/postgrest-js';

let cached: { token: string; exp: number } | null = null;
export const clearDbToken = () => { cached = null; }; // call on sign-out

async function getToken() {
  if (cached && cached.exp > Date.now() + 30000) return cached.token;
  const r = await fetch('/api/db-token', { credentials: 'include' });
  if (!r.ok) return null;
  const { token, expiresAt } = await r.json();
  cached = { token, exp: expiresAt };
  return token as string;
}

export function createDb() {
  return new PostgrestClient(location.origin + '/rest/v1', {
    fetch: async (input, init) => {
      const t = await getToken();
      const h = new Headers(init?.headers);
      if (t) h.set('Authorization', 'Bearer ' + t);
      return fetch(input, { ...init, headers: h });
    },
  });
}
