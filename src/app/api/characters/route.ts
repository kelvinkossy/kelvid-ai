import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const data = await db.load();
  const characters = data.characters.filter((c) => c.userId === userId);
  return NextResponse.json({ characters });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { name, description } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const data = await db.load();
  const character = {
    id: db.uid(), userId, name, description: description || "", imageUrl: null, createdAt: new Date().toISOString(),
  };
  data.characters.push(character);
  await db.save(data);
  return NextResponse.json({ character });
}
