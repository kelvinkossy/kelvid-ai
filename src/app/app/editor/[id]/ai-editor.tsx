"use client";

import { useState, useRef, useEffect } from "react";

type EditMode = "none" | "smart-cut" | "color-grade" | "speed-ramp" | "inpaint";

interface Props {
  job: any;
  videoUrl: string;
  onSave: (editedBlob: Blob) => void;
}

export default function AIEditor({ job, videoUrl, onSave }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMode, setActiveMode] = useState<EditMode>("none");
  const [processing, setProcessing] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [gradePrompt, setGradePrompt] = useState("");
  const [speedRampPoints, setSpeedRampPoints] = useState<number[]>([]);

  useEffect(() => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    v.src = videoUrl;
    v.load();
  }, [videoUrl]);

  function captureFrames() {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d")!;
    c.width = 160;
    c.height = 90;
    const captured: string[] = [];
    const totalFrames = Math.min(20, Math.floor(v.duration || 5) * 2);
    for (let i = 0; i < totalFrames; i++) {
      const t = (i / totalFrames) * (v.duration || 5);
      v.currentTime = t;
      ctx.drawImage(v, 0, 0, 160, 90);
      captured.push(c.toDataURL("image/jpeg", 0.5));
    }
    setFrames(captured);
  }

  async function handleSmartCut() {
    setProcessing(true);
    setActiveMode("smart-cut");

    const v = videoRef.current;
    if (!v) { setProcessing(false); return; }

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(v);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const beatTimestamps: number[] = [];

    v.play();
    await new Promise((r) => { v.onseeked = r; v.currentTime = 0; });
    v.play();

    const interval = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      if (avg > 80) beatTimestamps.push(v.currentTime);
    }, 100);

    await new Promise((r) => { v.onended = r; });
    clearInterval(interval);
    audioCtx.close();

    const cuts = beatTimestamps.filter((t, i) => i === 0 || t - beatTimestamps[i - 1] > 1);
    setSpeedRampPoints(cuts);
    setProcessing(false);
  }

  function applyColorGrade() {
    setActiveMode("color-grade");
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const ctx = c.getContext("2d")!;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0);

    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    const d = imageData.data;

    const mood = gradePrompt.toLowerCase();
    if (mood.includes("dark") || mood.includes("batman") || mood.includes("moody")) {
      for (let i = 0; i < d.length; i += 4) {
        d[i] *= 0.6; d[i + 1] *= 0.5; d[i + 2] *= 0.7;
      }
    } else if (mood.includes("warm") || mood.includes("vintage") || mood.includes("90s")) {
      for (let i = 0; i < d.length; i += 4) {
        d[i] *= 1.3; d[i + 1] *= 0.8; d[i + 2] *= 0.6;
      }
    } else if (mood.includes("cool") || mood.includes("neon") || mood.includes("cyber")) {
      for (let i = 0; i < d.length; i += 4) {
        d[i] *= 0.7; d[i + 1] *= 1.1; d[i + 2] *= 1.4;
      }
    } else {
      const sat = mood.includes("vibrant") ? 1.5 : 1.1;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = gray + (d[i] - gray) * sat;
        d[i + 1] = gray + (d[i + 1] - gray) * sat;
        d[i + 2] = gray + (d[i + 2] - gray) * sat;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    c.toBlob((blob) => {
      if (blob) onSave(blob);
    });
    setProcessing(false);
  }

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      <div className="rounded-2xl overflow-hidden bg-black border border-white/10">
        <video ref={videoRef} controls className="w-full" style={{ maxHeight: 400 }} />
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-sm text-slate-400 mb-3">Timeline</p>
        {frames.length === 0 ? (
          <button onClick={captureFrames} className="text-sm text-brand-400 hover:underline">
            Load frames
          </button>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {frames.map((f, i) => (
              <div
                key={i}
                onClick={() => setCurrentFrame(i)}
                className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                  i === currentFrame ? "border-brand-500" : "border-transparent"
                }`}
              >
                <img src={f} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        {speedRampPoints.length > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            {speedRampPoints.length} cut points detected
          </p>
        )}
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <p className="text-sm text-slate-400 mb-3">AI Magic Bar</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={handleSmartCut}
            disabled={processing}
            className={`p-3 rounded-xl text-sm font-medium transition ${
              activeMode === "smart-cut"
                ? "bg-brand-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            ✂️ Smart Cut
            <span className="block text-xs text-slate-400 mt-0.5">Auto-trim to beat</span>
          </button>

          <button
            onClick={() => setActiveMode("color-grade")}
            className={`p-3 rounded-xl text-sm font-medium transition ${
              activeMode === "color-grade"
                ? "bg-brand-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            🎨 AI Grade
            <span className="block text-xs text-slate-400 mt-0.5">Hollywood color</span>
          </button>

          <button
            onClick={() => setActiveMode("speed-ramp")}
            className={`p-3 rounded-xl text-sm font-medium transition ${
              activeMode === "speed-ramp"
                ? "bg-brand-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            💨 Speed Ramp
            <span className="block text-xs text-slate-400 mt-0.5">Auto action slomo</span>
          </button>

          <button
            onClick={() => setActiveMode("inpaint")}
            className={`p-3 rounded-xl text-sm font-medium transition ${
              activeMode === "inpaint"
                ? "bg-brand-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            🪄 Modify
            <span className="block text-xs text-slate-400 mt-0.5">AI object swap</span>
          </button>
        </div>
      </div>

      {activeMode === "color-grade" && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <label className="block text-sm text-slate-300">Describe the look</label>
          <input
            type="text"
            value={gradePrompt}
            onChange={(e) => setGradePrompt(e.target.value)}
            placeholder='e.g. "dark moody Batman" or "warm vintage 90s"'
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={applyColorGrade}
            disabled={!gradePrompt || processing}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition disabled:opacity-50"
          >
            {processing ? "Applying..." : "Apply color grade"}
          </button>
        </div>
      )}

      {activeMode === "speed-ramp" && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-slate-300 mb-3">Smart speed ramping</p>
          <p className="text-xs text-slate-500 mb-3">
            Detects action peaks and applies smooth slow-motion at the right moment.
          </p>
          <button
            onClick={handleSmartCut}
            disabled={processing}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition disabled:opacity-50"
          >
            {processing ? "Analyzing..." : "Detect action peaks"}
          </button>
        </div>
      )}

      {activeMode === "inpaint" && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm text-slate-300 mb-2">🪄 AI Object Inpainting</p>
          <p className="text-xs text-slate-500">
            Requires Replicate API key with an inpainting model configured.
          </p>
        </div>
      )}
    </div>
  );
}
