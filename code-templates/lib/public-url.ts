export const publicUrl = (bucket: string, key: string) =>
  process.env.NEXT_PUBLIC_FILES_URL + '/' + bucket + '/' + key.split('/').map(encodeURIComponent).join('/');
