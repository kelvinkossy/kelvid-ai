import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY || "";
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    const sig = signature || "";
    if (!secret || hash.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(sig))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    const event = JSON.parse(body);
    if (event.event === "charge.success") {
      const ref = event.data.reference;
      const data = await db.load();
      const payment = data.payments.find((p) => p.paystackReference === ref);
      if (payment && payment.status === "pending") {
        payment.status = "paid"; payment.updatedAt = new Date().toISOString();
        const user = data.users.find((u) => u.id === payment.userId);
        if (user) user.creditBalance += payment.creditsPurchased;
        await db.save(data);
      }
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Internal" }, { status: 500 }); }
}
