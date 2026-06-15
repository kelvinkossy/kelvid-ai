import { auth } from "@/lib/auth"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { notFound } from "next/navigation"; import JobView from "./job-view";

export default async function VideoPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth(); if (!session?.user) redirect("/auth/sign-in");
  const { id } = await props.params; const userId = (session.user as any).id;
  const data = await db.load(); const job = data.jobs.find((j) => j.id === id);
  if (!job || job.userId !== userId) notFound();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Video details</h1>
      <p className="text-slate-400 text-sm mb-8 truncate">{job.prompt}</p>
      <JobView job={JSON.parse(JSON.stringify(job))} />
    </div>
  );
}
