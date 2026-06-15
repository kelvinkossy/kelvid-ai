"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePosterFrame, PosterImage } from "@/components/poster";
import { VaultSkeleton } from "@/components/skeleton";

function VaultCard({ job }: { job: any }) {
  const poster = usePosterFrame(job.outputUrl);

  return (
    <Link href={`/app/videos/${job.id}`} className="card overflow-hidden group animate-slide-up">
      <div className="aspect-[9/16] bg-gradient-to-br from-surface-3 to-surface-2 flex items-center justify-center relative">
        {job.outputUrl ? (
          <PosterImage src={poster} alt={job.prompt} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-lg block mb-1.5 opacity-50">
              {job.status === "queued" ? "⏳" : job.status === "failed" ? "❌" : "🎬"}
            </span>
            <span className="text-[10px] text-text-tertiary capitalize">{job.status}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-[11px] text-white font-medium">View →</span>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] text-text-secondary truncate">{job.prompt}</p>
        <p className="text-[10px] text-text-tertiary/50 mt-0.5">{new Date(job.createdAt).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}

export default function VaultGrid({ jobs }: { jobs: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <VaultSkeleton />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {jobs.map((job, i) => (
        <div key={job.id} className={`animate-slide-up stagger-${(i % 6) + 1}`}>
          <VaultCard job={job} />
        </div>
      ))}
    </div>
  );
}
