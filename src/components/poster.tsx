"use client";

import { useEffect, useRef, useState } from "react";

export function usePosterFrame(videoUrl: string | null, time = 0.5) {
  const [poster, setPoster] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoUrl) return;
    const video = document.createElement("video");
    videoRef.current = video;
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.preload = "auto";
    video.muted = true;

    const handleLoaded = () => {
      video.currentTime = time;
    };
    const handleSeeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, 320, 180);
      setPoster(canvas.toDataURL("image/jpeg", 0.6));
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("seeked", handleSeeked);
    };
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("seeked", handleSeeked);
    video.load();

    return () => { video.removeEventListener("loadeddata", handleLoaded); video.removeEventListener("seeked", handleSeeked); };
  }, [videoUrl, time]);

  return poster;
}

export function PosterImage({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (!src) return <div className={`bg-gradient-to-br from-surface-3 to-surface-2 ${className}`} />;
  return <img src={src} alt={alt} className={className} loading="lazy" />;
}
