import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { logAction } from "@/lib/activity-log";

const DEFAULTS: Record<string, string> = {
  appName: "Spring Liberation Rose",
  appLogo: "/logo.svg",
};

async function getSettings() {
  const rows = await prisma.appSetting.findMany();
  const settings: Record<string, string> = { ...DEFAULTS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const body = await request.json();
    const updates: { key: string; value: string }[] = [];

    if (typeof body.appName === "string" && body.appName.trim()) {
      updates.push({ key: "appName", value: body.appName.trim() });
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No valid settings to update" },
        { status: 400 },
      );
    }

    for (const { key, value } of updates) {
      await prisma.appSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logAction({
      actionType: "Updated",
      actionLabel: "Application Settings Updated",
      details: `Updated settings: ${updates.map((u) => `${u.key}="${u.value}"`).join(", ")}`,
    });

    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
