"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/app/studio", label: "Studio", icon: Icons.studio },
  { href: "/app/explore", label: "Explore", icon: Icons.explore },
  { href: "/app/vault", label: "My Vault", icon: Icons.vault },
  { href: "/app/billing", label: "Billing", icon: Icons.billing },
];

export default function AppShell({ children, credits: initialCredits, email, role }: { children: React.ReactNode; credits: number; email: string; role: string }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [credits, setCredits] = useState(initialCredits);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch("/api/user/credits");
        if (res.ok) { const d = await res.json(); setCredits(d.credits); }
      } catch {}
    };
    fetchCredits();
    const iv = setInterval(fetchCredits, 15000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-surface-2/80 fixed h-full z-30">
        <div className="px-4 h-14 flex items-center border-b border-border">
          <Link href="/app/studio" className="flex items-center gap-2" prefetch={true}>
            <Icons.logo />
            <span className="text-sm font-semibold"><span className="text-gradient">Kel</span><span className="text-white/50">Vid AI</span></span>
          </Link>
          <nav className="flex-1 p-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} prefetch={true}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  active ? "bg-brand-600/10 text-brand-400" : "text-text-tertiary hover:text-text-secondary hover:bg-white/[0.02]"
                }`}
              >
                <span className={active ? "text-brand-400" : "text-white/15"}><item.icon /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="rounded-xl bg-white/[0.03] p-2.5">
            <p className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">Credits</p>
            <p className="text-lg font-bold text-gradient">{credits}</p>
          </div>
          {role === "ADMIN" && <Link href="/admin" className="flex items-center gap-2 px-3 py-2 mt-2 rounded-xl text-xs text-amber-400/40 hover:text-amber-400 hover:bg-amber-400/[0.03] transition-all">⚙ Admin</Link>}
        </div>
      </aside>

      <div className="md:ml-56 flex-1 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between px-4 h-12">
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/30 hover:text-white/60 transition p-1">
                <Icons.menu />
              </button>
              <span className="text-[11px] text-text-tertiary hidden md:block">{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/app/billing" className="md:hidden chip text-[10px] px-2 py-0.5 rounded-md">
                {credits} cr
              </Link>
              <form action="/api/auth/signout" method="POST"><button type="submit" className="text-[11px] text-text-tertiary hover:text-text-secondary transition px-2 py-1 rounded-lg hover:bg-white/[0.02]">Sign out</button></form>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto">
          {mounted ? children : <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="animate-skeleton h-24"/>)}</div>}
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute left-0 top-0 h-full w-64 bg-surface-2 p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <Link href="/app/studio" className="flex items-center gap-2 mb-6" prefetch={true}>
              <Icons.logo />
              <span className="text-sm font-semibold"><span className="text-gradient">Kel</span><span className="text-white/50">Vid AI</span></span>
            </Link>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} prefetch={true} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all ${
                    pathname.startsWith(item.href) ? "bg-brand-600/10 text-brand-400" : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  <span className={pathname.startsWith(item.href) ? "text-brand-400" : "text-white/15"}><item.icon /></span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
