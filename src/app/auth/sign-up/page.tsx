"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LazyBackground from "@/components/lazy-bg";
import { Icons } from "@/components/icons";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/sign-up", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Error"); setLoading(false); return; }
    router.push("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
      <LazyBackground count={20} />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-4"><Icons.logo /></div>
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-text-tertiary text-sm mt-1">Get 1 free video to start</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 animate-slide-up">
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block font-medium">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block font-medium">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs text-text-secondary mb-1.5 block font-medium">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="input" placeholder="At least 6 characters" />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary !w-full !py-3 mt-1">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-text-tertiary mt-6 animate-fade-in">
          Already have an account?{" "}
          <a href="/auth/sign-in" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</a>
        </p>
      </div>
    </div>
  );
}
