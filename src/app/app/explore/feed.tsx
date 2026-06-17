"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { usePosterFrame, PosterImage } from "@/components/poster";
import EmptyState from "@/components/empty-state";
import { ExploreSkeleton } from "@/components/skeleton";
import { toast } from "@/components/toast";

function ExploreCard({ job, user, isLiked, onLike, likes }: { job: any; user: any; isLiked: boolean; onLike: () => void; likes: number }) {
  const poster = usePosterFrame(job.outputUrl);
  const [playing, setPlaying] = useState(false);

  return (
    <div className="card overflow-hidden group animate-slide-up">
      <Link href={`/app/videos/${job.id}`} className="block relative">
        <PosterImage src={poster} alt={job.prompt} className="w-full aspect-[9/16] object-cover" />
        {playing ? (
          <video src={job.outputUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button onClick={(e) => { e.preventDefault(); setPlaying(!playing); }}
            className="flex items-center gap-1.5 text-xs text-white bg-black/50 backdrop-blur-sm px-2.5 py-1.5 rounded-lg hover:bg-black/70 transition"
          ><Icons.play /> Preview</button>
        </div>
      </Link>
      <div className="p-3.5">
        <p className="text-xs text-white leading-relaxed line-clamp-2">{job.prompt}</p>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
          <span className="text-[10px] text-text-tertiary">{user?.name || user?.email?.split("@")[0] || "Anonymous"}</span>
          <div className="flex items-center gap-2.5">
            <button onClick={onLike} className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-white transition-colors">
              <span className={isLiked ? "text-red-400" : ""}>{isLiked ? <Icons.heartFilled /> : <Icons.heart />}</span>
              <span>{likes}</span>
            </button>
            <button onClick={() => { navigator.clipboard.writeText(job.prompt); toast("Prompt copied","success"); }}
              className="flex items-center gap-1 text-[10px] text-text-tertiary hover:text-white transition-colors"
            ><Icons.copy /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExploreFeed({ jobs, users }: { jobs: any[]; users: any[] }) {
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [jobLikes, setJobLikes] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const toggleLike = async (id: string) => {
    setLikedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setJobLikes(prev => {
      const isCurrentlyLiked = likedSet.has(id);
      const current = prev[id] ?? jobs.find(j => j.id === id)?.likes ?? 0;
      return { ...prev, [id]: current + (isCurrentlyLiked ? -1 : 1) };
    });
    const isLiked = likedSet.has(id);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, liked: !isLiked }),
      });
      if (res.ok) {
        const data = await res.json();
        setJobLikes(p => ({ ...p, [id]: data.likes }));
      } else {
        setLikedSet(prev => { const n = new Set(prev); isLiked ? n.add(id) : n.delete(id); return n; });
        setJobLikes(p => {
          const revert = p[id] ?? jobs.find(j => j.id === id)?.likes ?? 0;
          return { ...p, [id]: revert + (isLiked ? 1 : -1) };
        });
      }
    } catch {
      setLikedSet(prev => { const n = new Set(prev); isLiked ? n.add(id) : n.delete(id); return n; });
      setJobLikes(p => {
        const revert = p[id] ?? jobs.find(j => j.id === id)?.likes ?? 0;
        return { ...p, [id]: revert + (isLiked ? 1 : -1) };
      });
    }
  };
  useEffect(() => { setMounted(true); const t = setTimeout(() => setLoaded(true), 400); return () => clearTimeout(t); }, []);

  if (!loaded) return <ExploreSkeleton />;

  if (jobs.length === 0) {
    return <EmptyState icon="explore" title="No community videos yet" description="Be the first to share your AI-generated video with the community!" action={{ label: "Create a video", href: "/app/studio" }} />;
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 ${mounted ? "animate-fade-in" : ""}`}>
      {jobs.map((job, i) => {
        const user = users.find((u) => u.id === job.userId);
        return <ExploreCard key={job.id} job={job} user={user} isLiked={likedSet.has(job.id)} onLike={() => toggleLike(job.id)} likes={jobLikes[job.id] ?? job.likes} />;
      })}
    </div>
  );
}
