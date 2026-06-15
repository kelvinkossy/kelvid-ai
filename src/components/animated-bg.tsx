"use client";

import { useEffect, useRef } from "react";

interface Orb { x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number; pulse: number; }

export default function AnimatedBackground({ count = 30 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isMobile = window.innerWidth < 768;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let orbs: Orb[] = [];
    let mouseX = 0, mouseY = 0;
    let frameCount = 0;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const orbCount = isMobile ? Math.min(count, 12) : count;
    for (let i = 0; i < orbCount; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * (isMobile ? 40 : 80) + (isMobile ? 15 : 30),
        alpha: Math.random() * 0.04 + 0.01,
        hue: Math.random() * 60 + 240,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let mouseActive = false;
    let mouseTimer: ReturnType<typeof setTimeout>;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      mouseActive = true;
      clearTimeout(mouseTimer);
      mouseTimer = setTimeout(() => { mouseActive = false; }, 2000);
    });

    function draw() {
      if (!canvas) return;
      frameCount++;
      if (isMobile && frameCount % 2 !== 0) { animId = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const infl = mouseActive ? 0.0001 : 0;
      for (const orb of orbs) {
        orb.x += orb.vx + (mouseX - canvas.width / 2) * infl;
        orb.y += orb.vy + (mouseY - canvas.height / 2) * infl;
        orb.pulse += 0.008;

        if (orb.x < -200) orb.x = canvas.width + 200;
        if (orb.x > canvas.width + 200) orb.x = -200;
        if (orb.y < -200) orb.y = canvas.height + 200;
        if (orb.y > canvas.height + 200) orb.y = -200;

        const pulseSize = orb.size * (1 + Math.sin(orb.pulse) * 0.12);
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, pulseSize);
        gradient.addColorStop(0, `hsla(${orb.hue + Math.sin(orb.pulse) * 20}, 70%, 60%, ${(orb.alpha * 2)})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue + 20 + Math.sin(orb.pulse) * 20}, 60%, 50%, ${orb.alpha})`);
        gradient.addColorStop(1, `hsla(${orb.hue + 40}, 50%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
