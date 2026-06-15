import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { FREE_TRIAL_CREDITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 });
    const data = await db.load();
    if (data.users.find((u) => u.email === email)) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const user = { id: db.uid(), email, passwordHash: await bcrypt.hash(password, 12), name: name || null, role: "USER", creditBalance: FREE_TRIAL_CREDITS, createdAt: new Date().toISOString() };
    data.users.push(user); await db.save(data);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
