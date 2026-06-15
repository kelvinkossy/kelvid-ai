import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { id, status, output, error } = await req.json();
    const token = req.headers.get("authorization")?.replace("Token ", "");
    const expected = process.env.REPLICATE_API_TOKEN;
    if (token !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await db.load();
    const job = data.jobs.find((j) => j.providerJobId === id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (status === "succeeded") {
      job.status = "succeeded";
      job.outputUrl = Array.isArray(output) ? output[0] : output;
    } else if (status === "failed") {
      job.status = "failed";
      job.errorMessage = error || "Generation failed";
    }
    job.updatedAt = new Date().toISOString();
    await db.save(data);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
