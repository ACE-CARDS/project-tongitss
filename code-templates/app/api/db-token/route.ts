import { auth } from '@/lib/auth';
import { signDbToken } from '@/lib/db-token';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ token: null }, { status: 401 });
  const { token, expiresAt } = await signDbToken(session.user);
  return Response.json({ token, expiresAt }, { headers: { 'Cache-Control': 'no-store' } });
}
