// Browser side. Replaces supabase.storage.from(bucket).upload(...)
export async function uploadFile(bucket: string, file: File) {
  const r = await fetch('/api/storage/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, fileName: file.name, contentType: file.type }),
  });
  if (!r.ok) throw new Error('presign failed');
  const { uploadUrl, key, publicUrl } = await r.json();
  const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!put.ok) throw new Error('upload failed');
  return { key, publicUrl };
}

// Replaces supabase.storage.from(bucket).remove([key])
export async function deleteFile(bucket: string, key: string) {
  const r = await fetch('/api/storage/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, key }),
  });
  if (!r.ok) throw new Error('delete failed');
}
