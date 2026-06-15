"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { toast } from "@/components/toast";

export default function JobView({ job: initial }: { job: any }) {
  const [job, setJob] = useState(initial);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [fallbackVideoUrl, setFallbackVideoUrl] = useState<string | null>(null);
  const [generatingFallback, setGeneratingFallback] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (job.status === "succeeded" || job.status === "failed") return;
    const iv = setInterval(async () => {
      const r = await fetch(`/api/jobs?id=${job.id}`); const d = await r.json();
      if (d.job) { setJob(d.job); if (d.job.status === "succeeded" || d.job.status === "failed") clearInterval(iv); }
    }, 3000);
    return () => clearInterval(iv);
  }, [job.id, job.status]);

  // Generate fallback video in browser when provider is local-fallback
  useEffect(() => {
    if (job.provider !== "local-fallback" || generatingFallback || fallbackVideoUrl) return;
    setGeneratingFallback(true);

    const canvas = document.createElement("canvas");
    const W = 288, H = 512;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const stream = canvas.captureStream(15);
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm",
    });

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
      setFallbackVideoUrl(url);
      setGeneratingFallback(false);
    };
    recorder.start();

    const TOTAL_FRAMES = 75;
    let frame = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const t = frame / 15;

      // Background gradient
      const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(0.5, "#0f0f1a");
      grad.addColorStop(1, "#07070d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Particles
      for (let i = 0; i < 25; i++) {
        const px = (Math.sin(t * 0.5 + i * 1.7) * 0.4 + 0.5) * W;
        const py = (Math.cos(t * 0.7 + i * 2.3) * 0.4 + 0.5) * H;
        const size = Math.sin(t * 2 + i) * 2 + 3;
        const alpha = Math.sin(t * 3 + i * 0.8) * 0.15 + 0.25;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
        ctx.fill();
      }

      // Central glow
      const cx = W/2 + Math.sin(t * 0.3) * 30;
      const cy = H/3;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
      glow.addColorStop(0, "rgba(99, 102, 241, 0.15)");
      glow.addColorStop(1, "rgba(99, 102, 241, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 100, 0, Math.PI * 2);
      ctx.fill();

      // Spinning ring
      ctx.save();
      ctx.translate(W/2, H/2);
      ctx.rotate(t * 0.5);
      ctx.strokeStyle = `rgba(129, 140, 248, ${0.15 + 0.1 * Math.sin(t)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r = 60 + 20 * Math.sin(t + i);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Prompt text
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "14px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      const words = (job.prompt || "AI Video").split(" ");
      const lines: string[] = [];
      let line = "";
      for (const w of words) {
        if ((line + " " + w).length > 25) { lines.push(line); line = w; }
        else line = line ? line + " " + w : w;
      }
      if (line) lines.push(line);
      const startY = H - 30 - (lines.length - 1) * 20;
      lines.forEach((l, i) => { ctx.fillText(l, W/2, startY + i * 20); });

      frame++;
      setProgress(Math.round((frame / TOTAL_FRAMES) * 100));
      if (frame < TOTAL_FRAMES) requestAnimationFrame(draw);
      else recorder.stop();
    }
    draw();
  }, [job.outputUrl, fallbackVideoUrl, generatingFallback, job.prompt]);

  const aspectRatio = job.aspectRatio || "16:9";
  const [aw, ah] = aspectRatio.split(":").map(Number);

  function copyPrompt() {
    navigator.clipboard.writeText(job.prompt);
    toast("Prompt copied!", "success");
  }

  const showFallback = job.provider === "local-fallback";
  const showError = (job.status === "failed" || (!job.outputUrl && job.status === "succeeded")) && !showFallback;

  return (
    <div className={`space-y-5 ${mounted ? "animate-fade-in" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-bold truncate">{job.prompt}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${job.status === "succeeded" ? "bg-green-500/10 text-green-400 border border-green-500/20" : job.status === "failed" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>{job.status}</span>
            <span className="text-[10px] text-text-tertiary">{job.durationSec}s</span>
            {job.aspectRatio && <span className="text-[10px] text-text-tertiary">{job.aspectRatio}</span>}
            {job.camera && job.camera !== "none" && <span className="text-[10px] text-text-tertiary">{job.camera}</span>}
          </div>
        </div>
        <Link href={`/app/editor/${job.id}`} className="btn btn-ghost btn-sm hidden md:flex"><Icons.studio/> Edit</Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {job.outputUrl && !showFallback ? (
            <div className="card overflow-hidden !p-0 !rounded-xl">
              <div className="p-4">
                <video src={job.outputUrl} controls className="w-full rounded-lg bg-black" style={{ aspectRatio: `${aw}/${ah}` }} />
              </div>
            </div>
          ) : fallbackVideoUrl ? (
            <div className="card overflow-hidden !p-0 !rounded-xl">
              <div className="p-4">
                <video src={fallbackVideoUrl} controls autoPlay loop className="w-full rounded-lg bg-black" style={{ aspectRatio: `${aw}/${ah}` }} />
                <p className="text-[10px] text-amber-400/60 mt-2 flex items-center gap-1">🎨 Local animation (API unreachable)</p>
              </div>
            </div>
          ) : generatingFallback ? (
            <div className="card !p-12 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto border-2 border-brand-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-text-tertiary text-sm">Rendering fallback animation... {progress}%</p>
                <div className="w-48 h-1.5 bg-white/5 rounded-full mt-3 mx-auto overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          ) : showError ? (
            <div className="card !p-12 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <span className="text-3xl block mb-2">❌</span>
                <p className="text-text-tertiary text-sm">Failed: {job.errorMessage || "Unknown error"}</p>
              </div>
            </div>
          ) : (
            <div className="card !p-12 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto border-2 border-brand-400 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-text-tertiary text-sm">{job.status === "queued" ? "Your video is queued..." : "AI is generating your video..."}</p>
              </div>
            </div>
          )}

          {job.outputUrl && !showFallback && (
            <div className="flex flex-wrap gap-2">
              <a href={job.outputUrl} download className="btn btn-primary btn-sm"><Icons.download/> Download</a>
              <Link href={`/app/editor/${job.id}`} className="btn btn-ghost btn-sm md:hidden"><Icons.studio/> Open Editor</Link>
              <button onClick={copyPrompt} className="btn btn-ghost btn-sm"><Icons.copy/> Copy prompt</button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-2">Details</p>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between"><span className="text-text-tertiary">Status</span><span className="text-text-primary capitalize font-medium">{job.status}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Duration</span><span className="text-text-primary">{job.durationSec}s</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Aspect ratio</span><span className="text-text-primary">{job.aspectRatio}</span></div>
              {job.camera && job.camera !== "none" && <div className="flex justify-between"><span className="text-text-tertiary">Camera</span><span className="text-text-primary capitalize">{job.camera}</span></div>}
              <div className="flex justify-between"><span className="text-text-tertiary">Created</span><span className="text-text-primary">{new Date(job.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-2">Prompt</p>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-6">{job.prompt}</p>
            <button onClick={copyPrompt} className="btn btn-ghost btn-xs mt-2 !w-full"><Icons.copy/> Copy</button>
          </div>

          {job.negativePrompt && (
            <div className="card p-4">
              <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-1.5">Negative prompt</p>
              <p className="text-xs text-text-secondary">{job.negativePrompt}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
