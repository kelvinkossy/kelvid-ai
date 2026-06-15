export function generateFallbackVideo(prompt: string, durationSec: number) {
  const frames: string[] = [];
  const totalFrames = 12;

  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / totalFrames;
    const pixels: number[] = [];

    for (let y = 0; y < 36; y++) {
      for (let x = 0; x < 64; x++) {
        const nx = x / 64;
        const ny = y / 36;

        const bgR = Math.floor(10 + 15 * ny);
        const bgG = Math.floor(8 + 10 * ny);
        const bgB = Math.floor(30 + 20 * ny);

        let pr = bgR, pg = bgG, pb = bgB;

        for (let p = 0; p < 8; p++) {
          const px = (Math.sin(t * Math.PI * 2 + p * 2.1) * 0.35 + 0.5) * 64;
          const py = (Math.cos(t * Math.PI * 1.5 + p * 2.7) * 0.35 + 0.5) * 36;
          const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if (dist < 3 + Math.sin(t * 6 + p) * 1.5) {
            const alpha = 0.3 + 0.3 * Math.sin(t * 8 + p);
            pr = Math.min(255, Math.floor(pr + (140 - pr) * alpha));
            pg = Math.min(255, Math.floor(pg + (100 - pg) * alpha));
            pb = Math.min(255, Math.floor(pb + (255 - pb) * alpha));
          }
        }

        const cx = 32 + Math.sin(t * Math.PI) * 8;
        const cy = 18;
        const gd = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (gd < 12) {
          const gi = (1 - gd / 12) * 0.2;
          pr = Math.min(255, Math.floor(pr + (150 - pr) * gi));
          pg = Math.min(255, Math.floor(pg + (100 - pg) * gi));
          pb = Math.min(255, Math.floor(pb + (255 - pb) * gi));
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
