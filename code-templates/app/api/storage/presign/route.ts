import { auth } from '@/lib/auth';
import { createServerDb } from '@/lib/db-server';
import { BUCKETS, s3Signer } from '@/lib/storage';
import { publicUrl } from '@/lib/public-url';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const { bucket, fileName, contentType } = await req.json();
  if (!BUCKETS.includes(bucket) || !String(contentType).startsWith('image/'))
    return Response.json({ error: 'bad request' }, { status: 400 });

  // Authorize through the database (RLS-aware helper that already exists in your schema)
  const db = await createServerDb();
  const { data: allowed } = await db.rpc('is_admin_or_superadmin');
  if (!allowed) return Response.json({ error: 'forbidden' }, { status: 403 });

  const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = Date.now() + '-' + crypto.randomUUID().slice(0, 8) + '-' + safe;
  const uploadUrl = await getSignedUrl(
    s3Signer,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
  return Response.json({ uploadUrl, key, publicUrl: publicUrl(bucket, key) });
}
