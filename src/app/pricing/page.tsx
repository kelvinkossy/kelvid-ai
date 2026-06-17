import Link from "next/link";
import { CREDIT_PACKS, PRICES_NGN } from "@/lib/constants";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]" />

      <header className="relative z-10 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold"><span className="text-gradient">Kel</span><span className="text-white/70">Vid AI</span></Link>
          <nav className="flex items-center gap-8">
            <Link href="/auth/sign-in" className="text-sm text-white/50 hover:text-white/90 transition-all">Sign in</Link>
            <Link href="/auth/sign-up" className="text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl transition-all">Get started</Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-brand-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-glow" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Pay as you go</h1>
          <p className="text-white/40 text-lg">Start with 1 free video. Buy credits only when you need more.</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack, i) => (
            <div key={pack.id} className={`relative glass-card rounded-2xl p-8 animate-slide-up stagger-${i + 1} ${pack.popular ? "border-brand-500/50 glow" : ""}`}>
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-semibold px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg shadow-brand-600/30">
                  ✨ Best value
                </div>
              )}
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">{pack.label}</h3>
              <p className="text-4xl font-bold text-white mb-1">₦{PRICES_NGN[pack.id].toLocaleString()}</p>
              <p className="text-sm text-white/30 mb-8">{pack.credits} video credits</p>
              <Link href="/auth/sign-up"
                className={`block w-full py-3.5 rounded-xl text-center font-semibold text-sm transition-all duration-300 ${
                  pack.popular
                    ? "bg-brand-600 hover:bg-brand-500 text-white glow"
                    : "glass glass-hover text-white/70 hover:text-white"
                }`}
              >
                Get started
              </Link>
              {pack.popular && (
                <div className="mt-4 space-y-2 pt-4 border-t border-white/[0.04]">
                  <p className="text-xs text-white/30 flex items-center gap-2">✓ Best price per credit</p>
                  <p className="text-xs text-white/30 flex items-center gap-2">✓ Most popular choice</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-white/20 mt-10">All prices in Nigerian Naira. Each credit = 1 video generation.</p>
      </section>
    </div>
  );
}
