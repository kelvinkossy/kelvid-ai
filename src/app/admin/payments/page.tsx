import { db } from "@/lib/db";

export default async function AdminPaymentsPage() {
  const data = await db.load();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <div className="space-y-2">{[...data.payments].reverse().map((p) => {
        const u = data.users.find((x) => x.id === p.userId);
        return (
          <div key={p.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div><p className="text-sm font-medium">{u?.email} &middot; ₦{p.amount.toLocaleString()} &middot; {p.creditsPurchased} credits</p><p className="text-xs text-slate-500">{p.paystackReference}</p></div>
            <span className={`text-xs px-3 py-1 rounded-full capitalize ${p.status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>{p.status}</span>
          </div>
        );
      })}</div>
    </div>
  );
}
