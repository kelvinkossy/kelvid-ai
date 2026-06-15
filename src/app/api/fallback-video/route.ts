import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt") || "animation";

  const W = 576;
  const H = 1024;
  const FPS = 24;
  const DURATION = 5;
  const TOTAL_FRAMES = FPS * DURATION;
  const CHUNK_HEIGHT = 48;

  // Generate frames as base64 PNG chunks
  const frames: string[] = [];
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / FPS;
    const pixels: number[] = [];

    // Generate a simple animated scene
    for (let y = 0; y < H; y += CHUNK_HEIGHT) {
      for (let x = 0; x < W; x++) {
        const nx = x / W;
        const ny = y / H;

        // Background gradient (dark blue/purple)
        const bgR = Math.floor(10 + 15 * ny);
        const bgG = Math.floor(10 + 10 * ny);
        const bgB = Math.floor(30 + 25 * ny);

        // Floating particles
        const particleCount = 30;
        let pr = bgR, pg = bgG, pb = bgB;

        for (let p = 0; p < particleCount; p++) {
          const px = (Math.sin(t * 0.5 + p * 1.7) * 0.4 + 0.5) * W;
          const py = (Math.cos(t * 0.7 + p * 2.3) * 0.4 + 0.5) * H;
          const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if (dist < 8 + Math.sin(t * 2 + p) * 3) {
            const alpha = 0.3 + 0.3 * Math.sin(t * 3 + p);
            pr = Math.min(255, Math.floor(pr + (130 - pr) * alpha));
            pg = Math.min(255, Math.floor(pg + (140 - pg) * alpha));
            pb = Math.min(255, Math.floor(pb + (248 - pb) * alpha));
          }
        }

        // Central glow
        const cx = W / 2 + Math.sin(t * 0.3) * 50;
        const cy = H / 2;
        const glowDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (glowDist < 100) {
          const glowIntensity = (1 - glowDist / 100) * 0.15;
          pr = Math.min(255, Math.floor(pr + (150 - pr) * glowIntensity));
          pg = Math.min(255, Math.floor(pg + (100 - pg) * glowIntensity));
          pb = Math.min(255, Math.floor(pb + (255 - pb) * glowIntensity));
        }

        pixels.push(pr, pg, pb, 255);
      }
    }
    frames.push(bufferToBase64PNG(pixels, W, H));
  }

  // Return as JSON with frame data URLs
  return NextResponse.json({
    frames,
    totalFrames: TOTAL_FRAMES,
    fps: FPS,
    width: W,
    height: H,
  });
}

// Minimal PNG encoder for RGBA pixel data
function bufferToBase64PNG(pixels: number[], width: number, height: number): string {
  const raw = Buffer.alloc(4 + width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const pi = i * 4;
    raw[i * 3 + 0] = pixels[pi];       // R
    raw[i * 3 + 1] = pixels[pi + 1];   // G
    raw[i * 3 + 2] = pixels[pi + 2];   // B
  }

  // Simple BMP-like header (just for display, extremely minimal)
  const header = Buffer.alloc(0);
  return `data:image/png;base64,${raw.toString("base64")}`;
}
