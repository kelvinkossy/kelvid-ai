import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const data = await db.load();
  const user = data.users.find((u: any) => u.id === userId);
  return NextResponse.json({ credits: user?.creditBalance ?? 0 });
}
