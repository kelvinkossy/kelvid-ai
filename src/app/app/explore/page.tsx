import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ExploreFeed from "./feed";

export default async function ExplorePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const data = await db.load();
  const publicJobs = data.jobs
    .filter((j) => j.status === "succeeded" && j.outputUrl)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 50);

  return (
    <div className="animate-fade-in">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-text-tertiary text-sm mt-1">Discover videos from the community</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip text-[11px]">Trending</span>
          <span className="chip text-[11px]">Recent</span>
        </div>
      </div>
      <ExploreFeed jobs={JSON.parse(JSON.stringify(publicJobs))} users={data.users} />
    </div>
  );
}
