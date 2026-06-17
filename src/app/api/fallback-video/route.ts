import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt") || "animation";

  const W = 576;
  const H = 1024;
  const FPS = 8;
  const DURATION = 5;
  const TOTAL_FRAMES = FPS * DURATION;

  const colors = generatePaletteFromPrompt(prompt);

  const frames: string[] = [];
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / FPS;
    const pixels = Buffer.alloc(W * H * 4);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const nx = x / W;
        const ny = y / H;
        const idx = (y * W + x) * 4;

        let r = Math.floor(colors.bg[0] + 15 * ny);
        let g = Math.floor(colors.bg[1] + 10 * ny);
        let b = Math.floor(colors.bg[2] + 25 * ny);

        for (let p = 0; p < 20; p++) {
          const px = (Math.sin(t * 0.5 + p * 1.7 + colors.offset) * 0.4 + 0.5) * W;
          const py = (Math.cos(t * 0.7 + p * 2.3 + colors.offset * 0.5) * 0.4 + 0.5) * H;
          const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if (dist < 8 + Math.sin(t * 2 + p) * 3) {
            const alpha = 0.3 + 0.3 * Math.sin(t * 3 + p);
            const pc = colors.particles[p % colors.particles.length];
            r = clamp(Math.floor(r + (pc[0] - r) * alpha));
            g = clamp(Math.floor(g + (pc[1] - g) * alpha));
            b = clamp(Math.floor(b + (pc[2] - b) * alpha));
          }
        }

        const cx = W / 2 + Math.sin(t * 0.3 + colors.offset) * 50;
        const cy = H / 2;
        const glowDist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (glowDist < 100) {
          const gi = (1 - glowDist / 100) * 0.15;
          r = clamp(Math.floor(r + (colors.glow[0] - r) * gi));
          g = clamp(Math.floor(g + (colors.glow[1] - g) * gi));
          b = clamp(Math.floor(b + (colors.glow[2] - b) * gi));
        }

        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }

    frames.push(`data:image/png;base64,${encodeMinimalPNG(pixels, W, H)}`);
  }

  return NextResponse.json({
    frames,
    totalFrames: TOTAL_FRAMES,
    fps: FPS,
    width: W,
    height: H,
  });
}

function generatePaletteFromPrompt(prompt: string) {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
    hash |= 0;
  }
  const offset = (hash % 1000) / 1000;

  const palettes = [
    { bg: [10, 10, 30], particles: [[99, 102, 241], [129, 140, 248], [165, 180, 252]], glow: [99, 102, 241] },
    { bg: [30, 10, 30], particles: [[244, 114, 182], [251, 168, 220], [236, 72, 153]], glow: [244, 114, 182] },
    { bg: [10, 30, 20], particles: [[52, 211, 153], [110, 231, 183], [16, 185, 129]], glow: [52, 211, 153] },
    { bg: [30, 20, 10], particles: [[251, 191, 36], [251, 146, 60], [245, 158, 11]], glow: [251, 191, 36] },
    { bg: [10, 10, 40], particles: [[139, 92, 246], [167, 139, 250], [124, 58, 237]], glow: [139, 92, 246] },
  ];

  const idx = Math.floor(offset * palettes.length) % palettes.length;
  return { ...palettes[idx], offset };
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, v));
}

function encodeMinimalPNG(pixels: Buffer, width: number, height: number): string {
  const zlib = require("zlib");
  const rawData = Buffer.alloc(width * height * 4 + height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;
      const di = y * (width * 4 + 1) + 1 + x * 4;
      rawData[di] = pixels[si + 2];
      rawData[di + 1] = pixels[si + 1];
      rawData[di + 2] = pixels[si];
      rawData[di + 3] = pixels[si + 3];
    }
  }
  const deflated = zlib.deflateSync(rawData);

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
    return (c ^ 0xffffffff) >>> 0;
  }
  function u32(v: number): Buffer {
    const b = Buffer.alloc(4);
    b.writeUInt32BE(v >>> 0);
    return b;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = Buffer.concat([u32(13), Buffer.from("IHDR"), ihdrData, u32(crc32(Buffer.concat([Buffer.from("IHDR"), ihdrData])))]);

  const idat = Buffer.concat([u32(deflated.length), Buffer.from("IDAT"), deflated, u32(crc32(Buffer.concat([Buffer.from("IDAT"), deflated])))]);

  const iend = Buffer.concat([u32(0), Buffer.from("IEND"), u32(crc32(Buffer.from("IEND")))]);

  return Buffer.concat([signature, ihdr, idat, iend]).toString("base64");
}
