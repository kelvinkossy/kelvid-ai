export function generateFallbackVideo(prompt: string, durationSec: number) {
  const seed = hashPrompt(prompt);
  const colors = generatePalette(seed);

  const frames: string[] = [];
  const totalFrames = Math.max(12, Math.min(30, durationSec * 4));

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / totalFrames;
    const pixels: number[] = [];

    for (let y = 0; y < 36; y++) {
      for (let x = 0; x < 64; x++) {
        const nx = x / 64;
        const ny = y / 36;

        const bgR = colors.bg[0] + Math.floor(15 * ny);
        const bgG = colors.bg[1] + Math.floor(10 * ny);
        const bgB = colors.bg[2] + Math.floor(25 * ny);

        let pr = clampColor(bgR);
        let pg = clampColor(bgG);
        let pb = clampColor(bgB);

        for (let p = 0; p < 8; p++) {
          const px = (Math.sin(t * Math.PI * 2 + p * 2.1 + seed.offset) * 0.35 + 0.5) * 64;
          const py = (Math.cos(t * Math.PI * 1.5 + p * 2.7 + seed.offset * 0.5) * 0.35 + 0.5) * 36;
          const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if (dist < 3 + Math.sin(t * 6 + p) * 1.5) {
            const alpha = 0.3 + 0.3 * Math.sin(t * 8 + p);
            pr = clampColor(Math.floor(pr + (colors.particles[p % colors.particles.length][0] - pr) * alpha));
            pg = clampColor(Math.floor(pg + (colors.particles[p % colors.particles.length][1] - pg) * alpha));
            pb = clampColor(Math.floor(pb + (colors.particles[p % colors.particles.length][2] - pb) * alpha));
          }
        }

        const cx = 32 + Math.sin(t * Math.PI + seed.offset * 0.3) * 8;
        const cy = 18;
        const gd = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (gd < 12) {
          const gi = (1 - gd / 12) * 0.2;
          pr = clampColor(Math.floor(pr + (colors.glow[0] - pr) * gi));
          pg = clampColor(Math.floor(pg + (colors.glow[1] - pg) * gi));
          pb = clampColor(Math.floor(pb + (colors.glow[2] - pb) * gi));
        }

        pixels.push(pr, pg, pb, 255);
      }
    }

    frames.push(Buffer.from(pixels).toString("base64"));
  }

  return {
    frames,
    totalFrames,
    width: 64,
    height: 36,
    fps: 4,
    durationSec,
    prompt,
  };
}

function hashPrompt(prompt: string): { offset: number } {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
    hash |= 0;
  }
  return { offset: (hash % 1000) / 1000 };
}

function generatePalette(seed: { offset: number }) {
  const hue = seed.offset * 360;
  const palettes = [
    { bg: [10, 10, 30], particles: [[99, 102, 241], [129, 140, 248], [165, 180, 252]], glow: [99, 102, 241] },
    { bg: [30, 10, 30], particles: [[244, 114, 182], [251, 168, 220], [236, 72, 153]], glow: [244, 114, 182] },
    { bg: [10, 30, 20], particles: [[52, 211, 153], [110, 231, 183], [16, 185, 129]], glow: [52, 211, 153] },
    { bg: [30, 20, 10], particles: [[251, 191, 36], [251, 146, 60], [245, 158, 11]], glow: [251, 191, 36] },
    { bg: [10, 10, 40], particles: [[139, 92, 246], [167, 139, 250], [124, 58, 237]], glow: [139, 92, 246] },
  ];

  const idx = Math.floor(seed.offset * palettes.length) % palettes.length;
  return palettes[idx];
}

function clampColor(v: number): number {
  return Math.max(0, Math.min(255, v));
}
