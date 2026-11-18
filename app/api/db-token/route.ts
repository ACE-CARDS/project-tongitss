import { auth } from '@/lib/auth';
import { mintDbToken } from '@/lib/db-token';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ token: null });
  return Response.json({ token: await mintDbToken(session.user) });
}