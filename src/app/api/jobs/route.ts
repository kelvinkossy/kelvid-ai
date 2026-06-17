import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, UNLIMITED_USERS } from "@/lib/db";
import { generateFallbackVideo } from "@/lib/fallback-video";

export const runtime = "nodejs";

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
    durationSec: durationSec || 5, status: "generating", provider: "local-fallback",
    providerJobId: null, outputUrl: null, errorMessage: null,
    sourceImage: sourceImage || null, characterId: characterId || null,
    likes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  if (!isUnlimited) user.creditBalance -= 1;
  await db.save(data);

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const hfToken = process.env.HF_TOKEN;
  let generated = false;

  if (replicateToken) {
    generated = await tryReplicate(fullPrompt, durationSec || 5, replicateToken, jobId);
  }

  if (!generated && hfToken) {
    generated = await tryHFGeneration(fullPrompt, hfToken, jobId);
  }

  const fresh = await db.load();
  const updatedJob = fresh.jobs.find((j: any) => j.id === jobId);

  if (!generated && updatedJob) {
    updatedJob.status = "succeeded";
    updatedJob.provider = "local-fallback";
    await db.save(fresh);
  }

  return NextResponse.json({
    job: updatedJob || job,
    fallbackVideo: generated ? null : fallbackVideoData,
  });
}

async function tryReplicate(prompt: string, durationSec: number, token: string, jobId: string): Promise<boolean> {
  try {
    const createRes = await fetch("https://api.replicate.com/v1/models/stability-ai/stable-video-diffusion/predictions", {
      method: "POST",
      headers: { Authorization: `Token ${token}`, "Content-Type": "application/json", "Prefer": "wait" },
      body: JSON.stringify({
        input: { prompt, negative_prompt: "blurry, low quality, distorted, ugly", video_length: `${Math.min(durationSec || 5, 15)}_frames`, width: 576, height: 1024 },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!createRes.ok) return false;
    const prediction = await createRes.json();

    const videoUrl = (prediction.status === "succeeded" && prediction.output)
      ? (Array.isArray(prediction.output) ? prediction.output[0] : prediction.output)
      : null;

    if (videoUrl) {
      const data = await db.load();
      const j = data.jobs.find((x: any) => x.id === jobId);
      if (j) { j.status = "succeeded"; j.outputUrl = videoUrl; j.provider = "replicate"; j.providerJobId = prediction.id; await db.save(data); }
      return true;
    }

    if (prediction.id) return await pollReplicate(prediction.id, token, jobId);
    return false;
  } catch { return false; }
}

async function pollReplicate(predictionId: string, token: string, jobId: string): Promise<boolean> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${token}` }, signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) break;
      const pred = await res.json();
      if (pred.status === "succeeded") {
        const videoUrl = Array.isArray(pred.output) ? pred.output[0] : pred.output;
        const data = await db.load();
        const j = data.jobs.find((x: any) => x.id === jobId);
        if (j) { j.status = "succeeded"; j.outputUrl = videoUrl; j.provider = "replicate"; j.providerJobId = predictionId; await db.save(data); }
        return true;
      }
      if (pred.status === "failed") {
        const data = await db.load();
        const j = data.jobs.find((x: any) => x.id === jobId);
        if (j) { j.status = "failed"; j.errorMessage = pred.error || "Replicate generation failed"; await db.save(data); }
        return false;
      }
    } catch { break; }
  }
  return false;
}

async function tryHFGeneration(prompt: string, token: string, jobId: string): Promise<boolean> {
  try {
    const endpoint = "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { wait_for_model: true } }),
      signal: AbortSignal.timeout(180000),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      const data = await db.load();
      const j = data.jobs.find((x: any) => x.id === jobId);
      if (j) { j.errorMessage = `HF error ${response.status}: ${errBody.slice(0, 200)}`; await db.save(data); }
      return false;
    }

    const ct = response.headers.get("content-type") || "";
    const data = await db.load();
    const j = data.jobs.find((x: any) => x.id === jobId);
    if (!j) return false;

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
    await db.save(data);
    return j.status === "succeeded";
  } catch (e: any) {
    const data = await db.load();
    const j = data.jobs.find((x: any) => x.id === jobId);
    if (j) { j.errorMessage = `HF fetch failed: ${e?.message?.slice(0, 100) || "unknown"}`; await db.save(data); }
    return false;
  }
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
