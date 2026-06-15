import { db } from "@/lib/db";

export default async function AdminPage() {
  const data = await db.load();
  const revenue = data.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Overview</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10"><p className="text-sm text-slate-400">Users</p><p className="text-3xl font-bold">{data.users.length}</p></div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10"><p className="text-sm text-slate-400">Jobs</p><p className="text-3xl font-bold">{data.jobs.length}</p></div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10"><p className="text-sm text-slate-400">Payments</p><p className="text-3xl font-bold">{data.payments.length}</p></div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10"><p className="text-sm text-slate-400">Revenue (NGN)</p><p className="text-3xl font-bold">₦{revenue.toLocaleString()}</p></div>
      </div>
    </div>
  );
}
