import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, UNLIMITED_USERS } from "@/lib/db";

const HF_API = "https://api-inference.huggingface.co/models/Lightricks/LTX-Video-0.9.8-13B-distilled";

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

  const job: any = {
    id: db.uid(), userId, prompt: fullPrompt, negativePrompt: negativePrompt || null,
    style: style || null, camera: camera || null, aspectRatio: aspectRatio || "16:9",
    durationSec: durationSec || 5, status: "queued", provider: "huggingface",
    providerJobId: null, outputUrl: null, errorMessage: null,
    sourceImage: sourceImage || null, characterId: characterId || null,
    likes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  if (!isUnlimited) user.creditBalance -= 1;
  await db.save(data);

  await fetchHF(fullPrompt, job.id);

  return NextResponse.json({ job });
}

async function fetchHF(prompt: string, jobId: string) {
  const token = process.env.HF_TOKEN;
  if (!token) return;

  try {
    const response = await fetch(HF_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { num_frames: 49, num_inference_steps: 25, wait_for_model: true } }),
      signal: AbortSignal.timeout(180000),
    });

    const data = await db.load();
    const j = data.jobs.find((x: any) => x.id === jobId);
    if (!j) return;

    if (response.ok) {
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("json")) {
        const json = await response.json();
        j.outputUrl = json.video?.url || JSON.stringify(json).match(/"url":"([^"]+)"/)?.[1] || "";
        j.status = j.outputUrl ? "succeeded" : "failed";
      } else {
        const buf = Buffer.from(await response.arrayBuffer()).toString("base64");
        j.outputUrl = `data:video/mp4;base64,${buf}`;
        j.status = "succeeded";
      }
    } else {
      j.status = "generating";
    }
    await db.save(data);
  } catch (e: any) {
    const data = await db.load();
    const j = data.jobs.find((x: any) => x.id === jobId);
    if (j) {
      j.status = "failed";
      j.errorMessage = e.name === "TimeoutError" ? "Request timed out (model cold start can take 2+ min)" : e.message || "Request failed";
      await db.save(data);
    }
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

  // If job stuck in "generating", retry the HF request
  if (job.status === "generating" && job.provider === "huggingface") {
    fetchHF(job.prompt, job.id);
  }

  return NextResponse.json({ job });
}
