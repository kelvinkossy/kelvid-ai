"use client";

import { useEffect, useState, useCallback } from "react";
import { Icons } from "./icons";

interface Toast { id: string; message: string; type: "success" | "error" | "info"; exiting?: boolean }

let addToastFn: ((msg: string, type?: "success" | "error" | "info") => void) | null = null;

export function toast(message: string, type: "success" | "error" | "info" = "success") {
  addToastFn?.(message, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString(36);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, 3500);
  }, []);

  useEffect(() => { addToastFn = add; return () => { addToastFn = null; }; }, [add]);

  const colors = { success: "bg-green-600/90 border-green-500/40", error: "bg-red-600/90 border-red-500/40", info: "bg-brand-600/90 border-brand-500/40" };

  return (
    <div data-toast>
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md text-sm text-white shadow-2xl ${colors[t.type]} ${t.exiting ? "animate-toast-out" : "animate-toast-in"}`}>
          <span className="text-base">{t.type === "success" ? <Icons.check /> : t.type === "error" ? <Icons.x /> : <Icons.sparkle />}</span>
          {t.message}
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-2 text-white/40 hover:text-white/80 transition"><Icons.x /></button>
        </div>
      ))}
    </div>
  );
}
