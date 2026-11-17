// Server only.
import { S3Client } from '@aws-sdk/client-s3';

const common = {
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY!, secretAccessKey: process.env.S3_SECRET_KEY! },
};
export const s3Internal = new S3Client({ ...common, endpoint: process.env.S3_ENDPOINT });
// Presigned URLs must be signed with the PUBLIC host (the host is part of the signature)
export const s3Signer = new S3Client({ ...common, endpoint: process.env.S3_PUBLIC_ENDPOINT });
export const BUCKETS = ['news-image', 'events', 'resource-image', 'execpics', 'member-photos'];
