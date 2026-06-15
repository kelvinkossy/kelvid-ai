import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Icons } from "@/components/icons";
import EmptyState from "@/components/empty-state";
import VaultGrid from "./grid";

export default async function VaultPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const userId = (session.user as any).id;

  const data = await db.load();
  const jobs = data.jobs
    .filter((j) => j.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">My Vault</h1>
          <p className="text-text-tertiary text-xs mt-0.5">{jobs.length} video{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/app/studio" className="btn btn-primary btn-sm"><Icons.studio/> New</Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon="vault" title="Your vault is empty" description="Generate your first video — it will appear here automatically." action={{ label: "Go to Studio", href: "/app/studio" }} />
      ) : (
        <VaultGrid jobs={JSON.parse(JSON.stringify(jobs))} />
      )}
    </div>
  );
}
