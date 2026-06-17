import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { jobId, liked } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const data = await db.load();
  const job = data.jobs.find((j: any) => j.id === jobId);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!data._likes) data._likes = [];
  const existing = data._likes.find((l: any) => l.userId === userId && l.jobId === jobId);

  if (liked) {
    if (existing) return NextResponse.json({ likes: job.likes });
    data._likes.push({ userId, jobId, createdAt: new Date().toISOString() });
    job.likes = (job.likes || 0) + 1;
  } else {
    if (!existing) return NextResponse.json({ likes: job.likes });
    data._likes = data._likes.filter((l: any) => !(l.userId === userId && l.jobId === jobId));
    job.likes = Math.max(0, (job.likes || 0) - 1);
  }

  job.updatedAt = new Date().toISOString();
  await db.save(data);

  return NextResponse.json({ likes: job.likes });
}
