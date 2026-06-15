import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, UNLIMITED_USERS } from "@/lib/db";
import { generateFallbackVideo } from "@/lib/fallback-video";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { prompt, negativePrompt, style, camera, aspectRatio, durationSec, sourceImage, characterId } = await req.json();
  if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

  const data = await db.load();
  const user = data.users.find((u: any) => u.id === userId);
  const isUnlimited = user && UNLIMITED_USERS.includes(user.email);
  if (!user || (!isUnlimited && user.creditBalance < 1)) return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });

  let fullPrompt = prompt;
  if (style) fullPrompt += `, ${style}`;
  if (camera && camera !== "none") {
    const dirs: Record<string, string> = { pan: ", camera panning left to right", zoom: ", slow cinematic zoom in", orbit: ", 360-degree orbit", crane: ", crane rising up" };
    fullPrompt += dirs[camera] || "";
  }
  if (characterId) {
    const char = data.characters.find((c: any) => c.id === characterId && c.userId === userId);
    if (char) fullPrompt = `Character "${char.name}": ${char.description}. ${fullPrompt}`;
  }

  const jobId = db.uid();
  const fallbackVideoData = generateFallbackVideo(fullPrompt, durationSec || 5);

  const job: any = {
    id: jobId, userId, prompt: fullPrompt, negativePrompt: negativePrompt || null,
    style: style || null, camera: camera || null, aspectRatio: aspectRatio || "16:9",
    durationSec: durationSec || 5, status: "succeeded", provider: "local-fallback",
    providerJobId: null, outputUrl: null, errorMessage: null,
    sourceImage: sourceImage || null, characterId: characterId || null,
    likes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  if (!isUnlimited) user.creditBalance -= 1;
  await db.save(data);

  // Try HF in background - if it succeeds, update the job
  const token = process.env.HF_TOKEN;
  if (token) {
    tryHFGeneration(fullPrompt, token, jobId, data);
  }

  return NextResponse.json({
    job,
    fallbackVideo: fallbackVideoData,
  });
}

async function tryHFGeneration(prompt: string, token: string, jobId: string, data: any) {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { wait_for_model: true } }),
      signal: AbortSignal.timeout(120000),
    });

    if (response.ok) {
      const ct = response.headers.get("content-type") || "";
      const fresh = await db.load();
      const j = fresh.jobs.find((x: any) => x.id === jobId);
      if (!j) return;

      if (ct.includes("json")) {
        const json = await response.json();
        j.outputUrl = json.video?.url || "";
        j.status = j.outputUrl ? "succeeded" : "failed";
        j.provider = "huggingface";
      } else {
        const buf = Buffer.from(await response.arrayBuffer()).toString("base64");
        j.outputUrl = `data:video/mp4;base64,${buf}`;
        j.status = "succeeded";
        j.provider = "huggingface";
      }
      await db.save(fresh);
    }
  } catch {}
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const data = await db.load();
  const job = data.jobs.find((j: any) => j.id === id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if (job.userId !== userId && (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ job });
}
