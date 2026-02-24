import { NextRequest, NextResponse } from "next/server";
import {
  listDeletedUsers,
  restoreUser,
  purgeUser,
} from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const users = await listDeletedUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deleted users" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    for (const id of ids) {
      await restoreUser(id);
    }

    await logAction({
      actionType: "Restored",
      actionLabel: "Users Restored",
      details: `Restored ${ids.length} user(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, restored: ids.length });
  } catch (error) {
    if (error instanceof UserError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to restore users" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    for (const id of ids) {
      await purgeUser(id);
    }

    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "Users Permanently Deleted",
      details: `Permanently deleted ${ids.length} user(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, purged: ids.length });
  } catch (error) {
    if (error instanceof UserError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to permanently delete users" },
      { status: 500 },
    );
  }
}
