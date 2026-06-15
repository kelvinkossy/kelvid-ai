import { db } from "@/lib/db";

export default async function AdminJobsPage() {
  const data = await db.load();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      <div className="space-y-2">{[...data.jobs].reverse().map((j) => {
        const u = data.users.find((x) => x.id === j.userId);
        return (
          <div key={j.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium truncate max-w-md">{j.prompt}</p>
              <span className={`text-xs px-3 py-1 rounded-full capitalize ${j.status === "succeeded" ? "bg-green-900/50 text-green-400" : j.status === "failed" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400"}`}>{j.status}</span>
            </div>
            <p className="text-xs text-slate-500">{u?.email} &middot; {j.durationSec}s &middot; {new Date(j.createdAt).toLocaleString()}</p>
          </div>
        );
      })}</div>
    </div>
  );
}
