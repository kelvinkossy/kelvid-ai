"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateForm({ credits }: { credits: number }) {
  const [prompt, setPrompt] = useState(""); const [style, setStyle] = useState("");
  const [duration, setDuration] = useState(5); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); const router = useRouter();
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (credits < 1) { setError("Out of credits. Buy more."); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, style, durationSec: duration }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed"); setLoading(false); return; }
    router.push(`/app/videos/${data.job.id}`);
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div><label className="block text-sm text-slate-300 mb-1">Prompt</label><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} required rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none" /></div>
      <div><label className="block text-sm text-slate-300 mb-1">Style (optional)</label><input type="text" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500" /></div>
      <div><label className="block text-sm text-slate-300 mb-1">Duration</label><select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500"><option value={5}>5 seconds</option><option value={10}>10 seconds</option><option value={15}>15 seconds</option></select></div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" disabled={loading || credits < 1} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition disabled:opacity-50">{loading ? "Starting..." : credits < 1 ? "Out of credits" : "Generate video"}</button>
    </form>
  );
}
