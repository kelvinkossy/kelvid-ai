import Link from "next/link";
import LazyBackground from "@/components/lazy-bg";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden relative">
      <LazyBackground count={45} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <header className="relative z-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-gradient">Kel</span><span className="text-white/50">Vid AI</span>
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-text-tertiary hover:text-text-secondary transition-all duration-200">Pricing</Link>
            <Link href="/auth/sign-in" className="text-sm text-text-tertiary hover:text-text-secondary transition-all duration-200">Sign in</Link>
            <Link href="/auth/sign-up" className="btn-primary !py-2 !px-4 !text-xs">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs text-brand-300 bg-brand-600/10 border border-brand-600/20 mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
          Built in Nigeria for Africa
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[.9] animate-fade-in stagger-1">
          Turn words into
          <br />
          <span className="text-gradient-2">stunning videos</span>
        </h1>

        <p className="mt-5 text-base text-text-tertiary max-w-lg animate-fade-in stagger-2 leading-relaxed">
          Type any idea. Get a professional AI-generated video in seconds. No editing skills needed.
        </p>

        <div className="mt-8 flex items-center gap-3 animate-fade-in stagger-3">
          <Link href="/auth/sign-up" className="btn-primary !py-3.5 !px-7 !text-base glow group relative overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">Start free</span>
          </Link>
          <Link href="/pricing" className="btn-ghost !py-3.5 !px-7 !text-base">See pricing</Link>
        </div>

        <p className="mt-3 text-xs text-text-tertiary/50 animate-fade-in stagger-4">No credit card required</p>

        <div className="mt-16 w-full max-w-4xl animate-scale-in stagger-5">
          <div className="card !p-1 glow">
            <div className="rounded-xl overflow-hidden bg-gradient-to-b from-brand-950/80 via-[#0c0c18] to-surface-2 relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl animate-breathe" />

              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[10px] text-text-tertiary/30 ml-2 font-mono">studio.kelvid.ai</span>
              </div>

              <div className="p-8 md:p-10 flex flex-col items-center">
                <div className="w-full max-w-md card !p-4 mb-5 bg-surface-3/50 animate-float">
                  <p className="text-[10px] text-text-tertiary/50 mb-1.5 font-mono tracking-wider uppercase">PROMPT</p>
                  <p className="text-sm text-text-secondary leading-relaxed">&ldquo;A majestic lion walking through the golden savanna at sunset, cinematic lighting, 8k resolution&rdquo;</p>
                </div>

                <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-brand-950/80 via-purple-950/30 to-brand-950/80 border border-border flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-600/10 via-transparent to-transparent animate-breathe" />
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-600/15 flex items-center justify-center mb-4 animate-pulse-glow group-hover:scale-110 transition-transform duration-500">
                      <svg className="w-7 h-7 text-brand-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <p className="text-xs text-text-tertiary/60 font-mono">Preview</p>
                    <div className="flex justify-center gap-1 mt-3">
                      {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-brand-400/50 animate-bounce" style={{animationDelay:`${i*.15}s`}} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <p className="text-xs text-text-tertiary uppercase tracking-widest font-semibold">How it works</p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { n:"01", t:"Describe your idea", d:"Type any video concept in plain English. The AI understands every style and scene." },
            { n:"02", t:"AI brings it to life", d:"Our model generates a high-quality video from your prompt in seconds." },
            { n:"03", t:"Download and share", d:"Export your video instantly and share it on any platform." },
          ].map((s,i) => (
            <div key={s.n} className={`card p-6 hover:bg-surface-card transition-all duration-300 animate-slide-up stagger-${i+1} cursor-default`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center text-xs text-brand-400 font-bold">{s.n}</div>
                <div className="h-px flex-1 bg-border" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{s.t}</h3>
              <p className="text-xs text-text-tertiary leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-t border-border py-12 text-center text-xs text-text-tertiary/40">
        <p>KelVid AI &mdash; AI video generation, simplified.</p>
      </section>
    </div>
  );
}
