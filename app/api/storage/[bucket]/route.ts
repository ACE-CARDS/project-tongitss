import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3, BUCKETS, getPublicUrl } from "@/lib/storage";
import { getUser } from "@/utils/db/server";
import { getUserWithRole } from "@/utils/db/session";

const ADMIN_ONLY_BUCKETS = ["execpics", "member-photos", "member-pictures"];
const ADMIN_ROLES = ["admin", "superadmin"];

async function authorizeStorageWrite(bucket: string): Promise<NextResponse | null> {
  if (!BUCKETS.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  // Admin-only buckets: requires users JOIN member with role IN ('admin', 'superadmin')
  if (ADMIN_ONLY_BUCKETS.includes(bucket)) {
    const profile = await getUserWithRole();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!profile.role || !ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  }

  // Standard public-read buckets ('events', 'news-image', 'resource-image'): any authenticated user
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bucket: string }> }
) {
  try {
    const { bucket } = await params;
    const authError = await authorizeStorageWrite(bucket);
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get("file");
    const rawPath = formData.get("path");

    if (!(file instanceof File) || typeof rawPath !== "string" || !rawPath.trim()) {
      return NextResponse.json({ error: "Missing file or path" }, { status: 400 });
    }

    const path = rawPath.replace(/^\/+/, "");
    if (path.includes("..")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );

    return NextResponse.json({
      path,
      publicUrl: getPublicUrl(bucket, path),
    });
  } catch (error) {
    console.error("Storage upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ bucket: string }> }
) {
  try {
    const { bucket } = await params;
    const authError = await authorizeStorageWrite(bucket);
    if (authError) return authError;

    const body = await req.json().catch(() => null);
    const paths: unknown = body?.paths;

    if (!Array.isArray(paths) || paths.length === 0 || !paths.every((p) => typeof p === "string" && p.trim())) {
      return NextResponse.json({ error: "Invalid or empty paths array" }, { status: 400 });
    }

    const cleanPaths = paths.map((p) => p.replace(/^\/+/, ""));
    if (cleanPaths.some((p) => p.includes(".."))) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: cleanPaths.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );

    return NextResponse.json({ deleted: cleanPaths });
  } catch (error) {
    console.error("Storage delete error:", error);
    return NextResponse.json({ error: "Failed to delete file(s)" }, { status: 500 });
  }
}