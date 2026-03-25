import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const BUCKET = "uploads";

async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email! },
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.size) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const docTypes = ["application/pdf"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const allowedTypes = [...imageTypes, ...docTypes, ...videoTypes];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only images (JPEG, PNG, WebP, GIF), PDFs, and videos (MP4, WebM, MOV) are allowed" },
      { status: 400 }
    );
  }

  // Validate file size (images 5MB, PDFs 20MB, videos 50MB)
  const maxSize = videoTypes.includes(file.type) ? 50 * 1024 * 1024
    : docTypes.includes(file.type) ? 20 * 1024 * 1024
    : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    const label = videoTypes.includes(file.type) ? "50MB" : docTypes.includes(file.type) ? "20MB" : "5MB";
    return NextResponse.json(
      { error: `File size must be under ${label}` },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase Storage upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl });
}
