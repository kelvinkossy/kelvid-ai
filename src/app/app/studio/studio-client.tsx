"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import RippleButton from "@/components/ripple-button";
import { toast } from "@/components/toast";

const ASPECT_RATIOS = [
  { id: "9:16", label: "TikTok" },
  { id: "16:9", label: "Cinematic" },
  { id: "1:1", label: "Square" },
];
const CAMERA_MOVEMENTS = ["none", "pan", "zoom", "orbit", "crane"];

const TEMPLATES = [
  { name: "Product Ad", prompt: "Premium product rotating on a minimalist white pedestal, studio lighting, 8k product photography, shallow depth of field" },
  { name: "Nature", prompt: "A serene waterfall in a lush tropical forest, golden sun rays piercing through the canopy, mist rising, cinematic 8k" },
  { name: "Cyberpunk", prompt: "Neon-lit rainy cyberpunk street at midnight, flying cars between skyscrapers, holographic advertisements, cinematic mood" },
  { name: "Luxury", prompt: "A luxury sports car driving along a coastal highway at golden hour, cinematic tracking shot, warm tones, deep blue ocean" },
  { name: "Fantasy", prompt: "A mystical glowing crystal cave with floating light orbs, purple and blue bioluminescence, ethereal atmosphere" },
  { name: "Abstract", prompt: "Flowing liquid metal in vibrant colors, smooth morphing shapes, 3D rendering, creative abstract art" },
];

export default function StudioClient({ credits }: { credits: number }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [prompt, setPrompt] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [camera, setCamera] = useState("none");
  const [duration, setDuration] = useState(5);
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"prompt" | "settings">("prompt");
  const [history, setHistory] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    try { const h = JSON.parse(localStorage.getItem("vf_history") || "[]"); setHistory(h); } catch {}
  }, []);

  useEffect(() => {
    if (!mounted || !canvasRef.current) return;
    const c = canvasRef.current, ctx = c.getContext("2d")!;
    const [aw, ah] = aspectRatio.split(":").map(Number);
    c.width = 320; c.height = Math.round((320 * ah) / aw);
    let f = 0, id: ReturnType<typeof setInterval>;
    if (window.innerWidth < 768) {
      ctx.fillStyle = "#1e1b4b"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#ffffff10"; ctx.font = "12px system-ui"; ctx.textAlign = "center";
      ctx.fillText(`🎬 ${aspectRatio}`, c.width/2, c.height-16); return;
    }
    id = setInterval(() => { f++; ctx.clearRect(0,0,c.width,c.height);
      const g = ctx.createRadialGradient(c.width/2,c.height/2,0,c.width/2,c.height/2,c.width*0.7);
      g.addColorStop(0,"#1e1b4b"); g.addColorStop(0.5,"#0f0f1a"); g.addColorStop(1,"#07070d");
      ctx.fillStyle=g; ctx.fillRect(0,0,c.width,c.height);
      for(let i=0;i<12;i++){const x=(Math.sin(f*0.02+i*1.7)*0.5+0.5)*c.width,y=(Math.cos(f*0.03+i*2.3)*0.5+0.5)*c.height;ctx.beginPath();ctx.arc(x,y,Math.sin(f*0.05+i)*2+2,0,Math.PI*2);ctx.fillStyle=`rgba(129,140,248,${Math.sin(f*0.04+i*0.8)*0.1+0.15})`;ctx.fill();}
      ctx.fillStyle="#ffffff10"; ctx.font="12px system-ui"; ctx.textAlign="center"; ctx.fillText(`🎬 ${aspectRatio}`,c.width/2,c.height-16);
    },80);
    return () => clearInterval(id);
  }, [mounted, aspectRatio]);

  async function handleEnhance() {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/prompt-enhance",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const d = await res.json();
      if (d.enhanced) setEnhanced(d.enhanced);
    } catch { setEnhanced(prompt); }
    setEnhancing(false);
  }

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setPrompt(t.prompt);
    setShowTemplates(false);
  }

  function useHistoryItem(p: string) {
    setPrompt(p);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (credits < 1) { setError("Out of credits. Buy more."); toast("Out of credits — buy more", "error"); return; }
    setLoading(true); setError("");
    const finalPrompt = enhanced ? enhanced : prompt;
    const body: Record<string, unknown> = { prompt:finalPrompt, negativePrompt, aspectRatio, camera, durationSec:duration };
    if (img) body.sourceImage = img;
    const res = await fetch("/api/jobs",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d = await res.json();
    if (!res.ok) { setError(d.error||"Failed"); setLoading(false); toast(d.error||"Failed","error"); return; }
    const updated = [finalPrompt, ...history.filter(h => h !== finalPrompt)].slice(0, 10);
    setHistory(updated); localStorage.setItem("vf_history", JSON.stringify(updated));
    toast("Video generation started!", "success");
    router.push(`/app/videos/${d.job.id}`);
  }

  if (!mounted) return <div className="space-y-4">{[1,2,3,4].map(i=><div key={i} className="animate-skeleton h-20"/>)}</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Studio</h1>
          <p className="text-text-tertiary text-xs mt-0.5">AI video creation</p>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-1.5 border border-border">
          <div className="w-2 h-2 rounded-full bg-brand-400/70 animate-pulse" />
          <span className="text-xs text-text-tertiary font-medium">{credits}</span>
        </div>
      </div>

      <div className="flex gap-1 mb-5 border-b border-border">
        {(["prompt","settings"] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition ${tab===t?"text-brand-400 border-brand-400":"text-text-tertiary border-transparent hover:text-text-secondary"}`}>{t==="prompt"?"Prompt":"Settings"}</button>
        ))}
        <button onClick={()=>setShowTemplates(!showTemplates)} className={`ml-auto px-3 py-2 text-xs font-medium transition flex items-center gap-1 ${showTemplates?"text-brand-400":"text-text-tertiary hover:text-text-secondary"}`}><Icons.sparkle/> Templates</button>
      </div>

      {showTemplates && (
        <div className="mb-4 p-3 rounded-xl bg-brand-600/8 border border-brand-600/15 animate-slide-up">
          <p className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider mb-2.5">Quick templates</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {TEMPLATES.map(t => (
              <button key={t.name} onClick={()=>applyTemplate(t)}
                className="text-[11px] px-2.5 py-2 rounded-lg bg-white/[0.03] border border-border hover:border-brand-400/30 hover:bg-brand-600/5 text-left text-text-secondary hover:text-white transition-all"
              >
                <span className="font-semibold">{t.name}</span>
                <p className="text-[9px] text-text-tertiary leading-tight mt-0.5 line-clamp-2">{t.prompt.slice(0,60)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">Prompt</p>
                <button type="button" onClick={handleEnhance} disabled={!prompt.trim()||enhancing}
                  className="flex items-center gap-1 text-[10px] bg-brand-600/10 text-brand-400 px-2.5 py-1 rounded-lg transition disabled:opacity-30"
                ><Icons.sparkle/>{enhancing?"Enhancing...":"Enhance"}</button>
              </div>
              <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} required rows={3}
                className="input !py-2.5 !text-sm resize-none" placeholder="Describe the video you want to create..."
              />

              {enhanced && <div className="p-3 rounded-xl bg-brand-600/8 border border-brand-600/15 animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-brand-400 font-semibold flex items-center gap-1"><Icons.sparkle/> Enhanced</span>
                  <button type="button" onClick={()=>{setPrompt(enhanced);setEnhanced("");toast("Prompt applied","success")}} className="text-[10px] text-brand-400/60 hover:text-brand-400 transition">Use →</button>
                </div>
                <p className="text-xs text-brand-200/80">{enhanced}</p>
              </div>}

              {tab==="settings" && <div className="space-y-3 pt-1 animate-fade-in">
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium mb-2">Aspect ratio</p>
                  <div className="grid grid-cols-3 gap-1.5">{ASPECT_RATIOS.map(ar=><button key={ar.id} type="button" onClick={()=>setAspectRatio(ar.id)} className={`px-2 py-2 rounded-lg text-xs font-medium transition ${aspectRatio===ar.id?"chip-active":"bg-white/[0.03] text-text-tertiary border border-border hover:border-border-hover"}`}>{ar.id}<br/><span className="text-[9px] opacity-60">{ar.label}</span></button>)}</div>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium mb-2">Camera</p>
                  <div className="flex gap-1.5">{CAMERA_MOVEMENTS.map(cm=><button key={cm} type="button" onClick={()=>setCamera(cm)} className={`flex-1 px-1 py-2 rounded-lg text-[10px] font-medium transition ${camera===cm?"chip-active":"bg-white/[0.03] text-text-tertiary border border-border hover:border-border-hover"}`}>{cm==="none"?"Static":cm}</button>)}</div>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary font-medium mb-2">Duration</p>
                  <div className="flex gap-1.5">{[5,10,15].map(d=><button key={d} type="button" onClick={()=>setDuration(d)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${duration===d?"chip-active":"bg-white/[0.03] text-text-tertiary border border-border hover:border-border-hover"}`}>{d}s</button>)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary bg-white/[0.03] border border-border px-3 py-2 rounded-lg transition"><Icons.camera/>{img?"Change":"Add image"}</button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=ev=>setImg(ev.target?.result as string);r.readAsDataURL(f)}} className="hidden"/>
                  {img&&<div className="relative"><img src={img} className="w-8 h-8 rounded object-cover border border-border"/><button type="button" onClick={()=>setImg(null)} className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">×</button></div>}
                </div>
              </div>}

              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

              <RippleButton type="submit" disabled={loading||credits<1||!prompt.trim()} className="btn btn-primary !w-full !py-3 glow">
                {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Generating...</span> : credits<1 ? "Out of credits" : "Generate video"}
              </RippleButton>
            </div>
          </form>

          {history.length > 0 && (
            <div className="card p-4">
              <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-2.5 flex items-center gap-1"><Icons.clock/> Recent prompts</p>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h, i) => (
                  <button key={i} onClick={()=>useHistoryItem(h)} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.03] border border-border hover:border-brand-400/30 text-text-tertiary hover:text-text-secondary transition-all truncate max-w-[180px]">{h}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-2">Preview</p>
            <canvas ref={canvasRef} className="w-full rounded-xl border border-border bg-black" style={{aspectRatio:aspectRatio.replace(":","/")}}/>
            <div className="flex gap-1.5 mt-2 flex-wrap">{aspectRatio!=="9:16"&&<span className="chip text-[9px]">{aspectRatio}</span>}{camera!=="none"&&<span className="chip text-[9px]">{camera} cam</span>}<span className="chip text-[9px]">{duration}s</span></div>
          </div>
          <div className="card p-4">
            <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider mb-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-400"/> Characters</p>
            <CharacterSelector />
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterSelector() {
  const [chars, setChars] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  async function load() { const r=await fetch("/api/characters"); const d=await r.json(); if(d.characters) setChars(d.characters); }
  async function save() { if(!name.trim())return; await fetch("/api/characters",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description:desc})}); setName("");setDesc("");setShow(false);load(); toast("Character saved","success"); }

  return <div onMouseEnter={load} className="space-y-1.5">
    {chars.length===0&&!show ? (
      <button onClick={()=>setShow(true)} className="text-xs text-brand-400/50 hover:text-brand-400 transition flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full border border-brand-400/30 flex items-center justify-center text-[10px]">+</span> Create character</button>
    ) : (<>
      {chars.map(c=><div key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.02]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600/20 to-purple-600/20 flex items-center justify-center text-[10px] text-brand-300 font-bold">{c.name[0]}</div>
        <div className="flex-1 min-w-0"><p className="text-[11px] text-text-secondary truncate">{c.name}</p><p className="text-[9px] text-text-tertiary/50 truncate">{c.description}</p></div>
      </div>)}
      {show&&<div className="space-y-1.5 pt-1.5 border-t border-border animate-fade-in">
        <input value={name} onChange={e=>setName(e.target.value)} className="input !py-1.5 !text-xs" placeholder="Character name"/>
        <input value={desc} onChange={e=>setDesc(e.target.value)} className="input !py-1.5 !text-xs" placeholder="Description"/>
        <div className="flex gap-1"><button onClick={save} className="btn btn-primary btn-xs">Save</button><button onClick={()=>setShow(false)} className="btn btn-ghost btn-xs">Cancel</button></div>
      </div>}
    </>)}
  </div>;
}
