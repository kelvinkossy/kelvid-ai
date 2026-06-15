"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import LazyBackground from "@/components/lazy-bg";
import { Icons } from "@/components/icons";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setError("Invalid email or password"); setLoading(false); return; }
    router.push("/app/studio");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <LazyBackground count={20} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4"><Icons.logo /></div>
          <h1 className="text-xl font-bold">Welcome back</h1>
          <p className="text-text-tertiary text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 animate-slide-up">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="input" placeholder="Your password" />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary !w-full !py-3 mt-1">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-text-tertiary mt-6 animate-fade-in">
          Don&apos;t have an account?{" "}
          <a href="/auth/sign-up" className="text-brand-400 hover:text-brand-300 transition-colors">Sign up</a>
        </p>
      </div>
    </div>
  );
}
