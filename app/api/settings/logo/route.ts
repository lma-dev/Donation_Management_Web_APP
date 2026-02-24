import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { logAction } from "@/lib/activity-log";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPG, WebP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 2MB" },
        { status: 400 },
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Delete old uploaded logo if exists
    const existing = await prisma.appSetting.findUnique({
      where: { key: "appLogo" },
    });

    if (existing && existing.value.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), "public", existing.value);
      if (existsSync(oldPath)) {
        await unlink(oldPath);
      }
    }

    // Save new file
    const ext = file.name.split(".").pop() ?? "png";
    const filename = `logo-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // Update setting
    const logoPath = `/uploads/${filename}`;
    await prisma.appSetting.upsert({
      where: { key: "appLogo" },
      update: { value: logoPath },
      create: { key: "appLogo", value: logoPath },
    });

    await logAction({
      actionType: "Updated",
      actionLabel: "Application Logo Updated",
      details: `Logo updated to ${filename}`,
    });

    return NextResponse.json({ appLogo: logoPath });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 },
    );
  }
}
