import { auth } from '@/lib/auth';
import { createServerDb } from '@/lib/db-server';
import { BUCKETS, s3Internal } from '@/lib/storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { bucket, key } = await req.json();
  if (!BUCKETS.includes(bucket) || typeof key !== 'string' || !key)
    return Response.json({ error: 'bad request' }, { status: 400 });

  const db = await createServerDb();
  const { data: allowed } = await db.rpc('is_admin_or_superadmin');
  if (!allowed) return Response.json({ error: 'forbidden' }, { status: 403 });

  await s3Internal.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return Response.json({ ok: true });
}
