import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.MINIO_ROOT_USER as string, secretAccessKey: process.env.MINIO_ROOT_PASSWORD as string },
});
export const BUCKETS = ['news-image', 'events', 'resource-image', 'member-photos', 'execpics'];
export const getPublicUrl = (bucket: string, path: string) => `/files/${bucket}/${path}`;