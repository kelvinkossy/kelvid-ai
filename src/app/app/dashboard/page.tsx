import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth(); if (!session?.user) redirect("/auth/sign-in");
  const userId = (session.user as any).id;
  const data = await db.load();
  const user = data.users.find((u) => u.id === userId);
  const jobs = data.jobs.filter((j) => j.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-brand-900/40 border border-brand-800/50">
          <p className="text-sm text-brand-300 mb-1">Credits remaining</p>
          <p className="text-4xl font-bold">{user?.creditBalance ?? 0}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm text-slate-400 mb-1">Videos generated</p>
          <p className="text-4xl font-bold">{jobs.length}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-center gap-3">
          <Link href="/app/studio" className="block w-full py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition">Create new video</Link>
          <Link href="/app/billing" className="block w-full py-3 text-center rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition">Buy credits</Link>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Recent videos</h2>
      {jobs.length === 0 ? (
        <div className="p-12 rounded-2xl border-2 border-dashed border-white/10 text-center text-slate-500">No videos yet. <Link href="/app/studio" className="text-brand-400 hover:underline">Generate your first video</Link></div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/app/videos/${job.id}`} className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium truncate">{job.prompt}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(job.createdAt).toLocaleDateString()} &middot; {job.durationSec}s</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${job.status === "succeeded" ? "bg-green-900/50 text-green-400" : job.status === "failed" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400"}`}>{job.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
