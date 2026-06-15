import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { CREDIT_PACKS, PRICES_NGN } from "@/lib/constants"; import BuyButton from "./buy-button"; import { Icons } from "@/components/icons";

export default async function BillingPage() {
  const session = await auth(); if (!session?.user) redirect("/auth/sign-in");
  const userId = (session.user as any).id; const data = await db.load();
  const user = data.users.find((u) => u.id === userId);
  const payments = data.payments.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-text-tertiary text-sm mt-1">Manage your credits and payments</p>
        </div>
        <div className="card !rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="text-xs text-text-tertiary">Balance</span>
          <span className="text-lg font-bold text-gradient">{user?.creditBalance ?? 0}</span>
        </div>
      </div>

      <div className="mb-12">
        <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Icons.billing /> Buy credits</p>
        <div className="grid md:grid-cols-3 gap-3">
          {CREDIT_PACKS.map((pack, i) => (
            <div key={pack.id} className={`card p-6 animate-slide-up stagger-${i+1} ${pack.popular ? "border-brand-500/40 glow-sm" : ""}`}>
              {pack.popular && <div className="inline-flex text-[10px] font-semibold text-brand-300 bg-brand-600/15 px-3 py-1 rounded-full mb-3 border border-brand-600/20">Best value</div>}
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold mb-1">{pack.label}</p>
              <p className="text-3xl font-bold text-white mb-1">₦{PRICES_NGN[pack.id].toLocaleString()}</p>
              <p className="text-xs text-text-tertiary mb-5">{pack.credits} credits</p>
              <BuyButton packId={pack.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-4">Payment history</p>
        {payments.length === 0 ? (
          <div className="card !p-8 text-center"><p className="text-text-tertiary text-sm">No payments yet</p></div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="card !p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{p.creditsPurchased} credits &middot; ₦{p.amount.toLocaleString()}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${p.status === "paid" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
