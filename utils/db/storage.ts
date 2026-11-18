export const getPublicUrl = (bucket: string, path: string) =>
  `/files/${bucket}/${path}`;

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);

  const res = await fetch(`/api/storage/${encodeURIComponent(bucket)}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to upload file");
  return data;
}

export async function removeFiles(
  bucket: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;

  const res = await fetch(`/api/storage/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete file(s)");
  }
}