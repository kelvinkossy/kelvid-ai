import { db } from "@/lib/db";

export default async function AdminUsersPage() {
  const data = await db.load();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="space-y-2">{data.users.map((u) => (
        <div key={u.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div><p className="text-sm font-medium">{u.email}</p><p className="text-xs text-slate-500">{u.name || "No name"} &middot; {u.role} &middot; {u.creditBalance} credits</p></div>
          <span className="text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
        </div>
      ))}</div>
    </div>
  );
}
