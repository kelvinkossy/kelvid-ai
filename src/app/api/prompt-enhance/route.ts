import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json({ enhanced: enhanceFallback(prompt), source: "local" });
    }

    try {
      const res = await fetch("https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: `<|user|>\nRewrite this video prompt as a highly detailed cinematic description. Add lighting, camera angles, mood, and visual style details. Keep it under 200 words.\n\nOriginal: "${prompt}"\n<|assistant|>\n`,
          parameters: { max_new_tokens: 300, temperature: 0.7 },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = Array.isArray(json) ? json[0]?.generated_text || "" : json.generated_text || "";
        const cleaned = text.split("<|assistant|>").pop()?.trim() || enhanceFallback(prompt);
        if (cleaned.length > prompt.length + 10) {
          return NextResponse.json({ enhanced: cleaned, source: "huggingface" });
        }
      }
    } catch {}

    return NextResponse.json({ enhanced: enhanceFallback(prompt), source: "fallback" });
  } catch {
    return NextResponse.json({ enhanced: enhanceFallback("a cinematic scene"), source: "local" });
  }
}

function enhanceFallback(prompt: string): string {
  const styles = [
    "cinematic lighting, 8k resolution, hyper-realistic, moody atmosphere",
    "vibrant colors, golden hour lighting, sharp focus, professional grade",
    "dark aesthetic, neon accents, dramatic shadows, film grain texture",
    "soft natural lighting, pastel tones, dreamy atmosphere, bokeh effect",
    "high contrast, gritty texture, dynamic composition, anamorphic lens",
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];
  const subjects = prompt.length > 50 ? prompt : `${prompt}, breathtaking cinematography, ${style}`;
  return subjects.charAt(0).toUpperCase() + subjects.slice(1);
}
