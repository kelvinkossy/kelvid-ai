"use client";
import { useState } from "react";
import { PRICES_NGN } from "@/lib/constants";
import { toast } from "@/components/toast";

export default function BuyButton({ packId }: { packId: string }) {
  const [loading, setLoading] = useState(false);
  async function handleBuy() {
    setLoading(true);
    const res = await fetch("/api/paystack-init", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packId }) });
    const data = await res.json();
    if (!res.ok) { toast(data.error || "Payment failed", "error"); setLoading(false); return; }
    window.location.href = data.authorizationUrl;
  }
  return <button onClick={handleBuy} disabled={loading} className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition text-sm disabled:opacity-50">{loading ? "Redirecting..." : `Buy ₦${PRICES_NGN[packId].toLocaleString()}`}</button>;
}
