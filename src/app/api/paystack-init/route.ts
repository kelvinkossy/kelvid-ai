import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CREDIT_PACKS, PRICES_NGN } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { packId } = await req.json();
  const pack = CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return NextResponse.json({ error: "Paystack not configured" }, { status: 500 });

  const data = await db.load();
  const user = data.users.find((u) => u.id === userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ref = `VF-${Date.now()}-${userId.slice(0, 6)}`;
  try {
    const r = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, amount: PRICES_NGN[packId] * 100, currency: "NGN", reference: ref, callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/billing`, metadata: { userId, packId, credits: pack.credits } }),
    });
    const result = await r.json();
    if (!result.status) return NextResponse.json({ error: result.message || "Failed" }, { status: 400 });
    data.payments.push({ id: db.uid(), userId, provider: "paystack", paystackReference: ref, amount: PRICES_NGN[packId], currency: "NGN", creditsPurchased: pack.credits, status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await db.save(data);
    return NextResponse.json({ authorizationUrl: result.data.authorization_url });
  } catch { return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 }); }
}
