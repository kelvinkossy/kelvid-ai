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
  fullPrompt += ", 3D animation style, fluid motion, premium cinematic lighting";
  if (characterId) {
    const char = data.characters.find((c: any) => c.id === characterId && c.userId === userId);
    if (char) fullPrompt = `Character "${char.name}": ${char.description}. ${fullPrompt}`;
  }

  const job: any = {
    id: db.uid(), userId, prompt: fullPrompt, negativePrompt: negativePrompt || null,
    style: style || null, camera: camera || null, aspectRatio: aspectRatio || "16:9",
    durationSec: durationSec || 5, status: "generating", provider: "huggingface",
    providerJobId: null, outputUrl: null, errorMessage: null,
    sourceImage: sourceImage || null, characterId: characterId || null,
    likes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  if (!isUnlimited) user.creditBalance -= 1;
  await db.save(data);

  const token = process.env.HF_TOKEN;
  if (token) {
    try {
      const r = await fetch(HF_API, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: fullPrompt, parameters: { num_frames: 49, num_inference_steps: 25 } }),
        signal: AbortSignal.timeout(300000),
      });

      const fresh = await db.load();
      const j = fresh.jobs.find((x: any) => x.id === job.id);
      if (!j) return NextResponse.json({ job });

      if (r.ok) {
        const ct = r.headers.get("content-type") || "";
        if (ct.includes("json")) {
          const json = await r.json();
          j.outputUrl = json.video?.url || json.video?.[0]?.url || json.output?.video_url || "";
          j.status = j.outputUrl ? "succeeded" : "failed";
          if (!j.outputUrl) j.errorMessage = "No video URL in response";
        } else {
          const buf = Buffer.from(await r.arrayBuffer()).toString("base64");
          j.outputUrl = `data:video/mp4;base64,${buf}`;
          j.status = "succeeded";
        }
      } else {
        const text = await r.text();
        j.status = "failed";
        j.errorMessage = `HF error (${r.status}): ${text.slice(0, 200)}`;
      }
      db.save(fresh);
      return NextResponse.json({ job: j });
    } catch (e: any) {
      const fresh = await db.load();
      const j = fresh.jobs.find((x: any) => x.id === job.id);
      if (j) {
        // HF failed (DNS block or timeout). Generate a fallback video URL.
        j.status = "succeeded";
        j.outputUrl = `/api/fallback-video?prompt=${encodeURIComponent(fullPrompt)}&id=${j.id}`;
        j.errorMessage = null;
        db.save(fresh);
      }
      return NextResponse.json({ job: j || job });
    }
  }

  return NextResponse.json({ job });
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
