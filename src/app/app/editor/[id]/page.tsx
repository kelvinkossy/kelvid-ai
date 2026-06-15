import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AIEditor from "./ai-editor";

export default async function EditorPage(props: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");
  const { id } = await props.params;
  const userId = (session.user as any).id;

  const data = await db.load();
  const job = data.jobs.find((j) => j.id === id);
  if (!job || job.userId !== userId) notFound();

  const videoUrl = job.outputUrl || "";

  if (!videoUrl) {
    return (
      <div className="p-12 rounded-2xl border-2 border-dashed border-white/10 text-center text-slate-500">
        Video is not ready yet.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">AI Editor</h1>
      <p className="text-slate-400 text-sm mb-8 truncate">{job.prompt}</p>
      <AIEditor job={JSON.parse(JSON.stringify(job))} videoUrl={videoUrl} onSave={() => {}} />
    </div>
  );
}
